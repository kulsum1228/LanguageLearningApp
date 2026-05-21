const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────
// ROBUST JSON EXTRACTOR
// Handles: pure JSON, ```json blocks, JSON buried in prose
// ─────────────────────────────────────────
const extractJSON = (text) => {
  if (!text) return null;

  // 1. Strip markdown code fences
  let clean = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // 2. Try direct parse first
  try {
    return JSON.parse(clean);
  } catch (_) {}

  // 3. Find the first { ... } block in the text (handles prose before/after JSON)
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }

  return null;
};

// ─────────────────────────────────────────
// SCENARIO PROMPT BUILDER
// ─────────────────────────────────────────
const buildScenarioPrompt = (characterDescription, scenarioDescription) =>
  `You are ${characterDescription} AND a Marathi language trainer.

YOUR ROLE:
- Stay fully in character as the ${characterDescription.split(" and ")[0]}
- Weave corrections naturally INTO your Marathi reply — do not break character

CRITICAL: You MUST respond with ONLY a valid JSON object. No text before or after. No explanations. No markdown. Just raw JSON.

The JSON must have exactly these 4 keys:
{
  "marathi": "Your character reply in Marathi script only. If user made a mistake, correct it naturally within this sentence itself like a real teacher mid-conversation.",
  "translation": "The exact English translation of what you wrote in the marathi field.",
  "feedback": "ONE short English line: either '✅ Great Marathi!' or '🔶 Small fix: [wrong → correct]'. Max 10 words total.",
  "hint": "One English nudge for what the user can say next, including a sample Marathi phrase and its English meaning."
}

STRICT RULES:
- "marathi" must contain Marathi script ONLY — no English, no brackets, no translations inside it.
- "translation" must be a clean English translation of the marathi field.
- "feedback" must start with ✅ or 🔶 and be under 10 words.
- "hint" must include a sample Marathi phrase with English meaning.
- If user speaks English: reply warmly in Marathi, give the Marathi phrase in the hint.
- If user is off-topic: redirect back in character via your Marathi reply.

SCENARIO: ${scenarioDescription}`;

const scenarios = {
  rickshaw: {
    name: "Auto-Rickshaw Driver",
    emoji: "🛺",
    prompt: buildScenarioPrompt(
      "a friendly auto-rickshaw driver in Mumbai",
      "Help the user practice booking an auto-rickshaw. Topics: destination, price negotiation, distance, meter.",
    ),
  },
  market: {
    name: "Market Vendor",
    emoji: "🛒",
    prompt: buildScenarioPrompt(
      "a friendly vegetable vendor at a Mumbai local market",
      "Help the user practice shopping for vegetables. Topics: vegetables, prices, bargaining, quantities, freshness.",
    ),
  },
  restaurant: {
    name: "Restaurant Waiter",
    emoji: "🍽️",
    prompt: buildScenarioPrompt(
      "a friendly waiter at a Maharashtrian restaurant",
      "Help the user practice ordering food. Topics: menu items, ordering, asking for bill, complimenting food.",
    ),
  },
  neighbour: {
    name: "New Neighbour",
    emoji: "👋",
    prompt: buildScenarioPrompt(
      "a friendly Marathi-speaking neighbour",
      "Help the user practice everyday conversation. Topics: greetings, introductions, weather, daily life, family.",
    ),
  },
  doctor: {
    name: "Doctor Visit",
    emoji: "🏥",
    prompt: buildScenarioPrompt(
      "a friendly doctor at a Mumbai clinic",
      "Help the user practice medical conversations. Topics: symptoms, body parts, medicines, prescriptions, appointments.",
    ),
  },
  directions: {
    name: "Asking Directions",
    emoji: "🗺️",
    prompt: buildScenarioPrompt(
      "a helpful local person in Mumbai",
      "Help the user practice asking for directions. Topics: locations, landmarks, distance, left/right/straight.",
    ),
  },
  shopkeeper: {
    name: "Clothing Shop",
    emoji: "👕",
    prompt: buildScenarioPrompt(
      "a friendly clothing shopkeeper in Mumbai",
      "Help the user practice clothes shopping. Topics: sizes, colors, prices, trying on clothes, bargaining.",
    ),
  },
  train: {
    name: "Train Station",
    emoji: "🚂",
    prompt: buildScenarioPrompt(
      "a helpful ticket counter person at Mumbai railway station",
      "Help the user practice buying train tickets. Topics: destinations, ticket types, platform numbers, timings.",
    ),
  },
};

// ─────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────
const chat = async (req, res) => {
  const { scenario, messages } = req.body;

  if (!scenario || !messages) {
    return res
      .status(400)
      .json({ message: "Scenario and messages are required" });
  }

  const selectedScenario = scenarios[scenario];
  if (!selectedScenario) {
    return res.status(400).json({ message: "Invalid scenario" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, // Forces pure JSON output
      messages: [
        { role: "system", content: selectedScenario.prompt },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const rawReply = completion.choices[0].message.content;

    // Log for debugging — check your backend terminal
    console.log(
      "\n=== RAW GROQ REPLY ===\n",
      rawReply,
      "\n======================\n",
    );

    const parsed = extractJSON(rawReply);

    // Safety: if JSON parse totally failed, send raw text as marathi
    if (
      !parsed ||
      typeof parsed.marathi !== "string" ||
      !parsed.marathi.trim()
    ) {
      console.warn("⚠️  Could not parse JSON. Sending raw as marathi.");
      return res.status(200).json({
        reply: { marathi: rawReply, translation: "", feedback: "", hint: "" },
      });
    }

    console.log(
      "=== PARSED OK ===\n",
      JSON.stringify(parsed, null, 2),
      "\n=================\n",
    );

    res.status(200).json({ reply: parsed });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────
// GET SCENARIOS
// ─────────────────────────────────────────
const getScenarios = async (req, res) => {
  const scenarioList = Object.entries(scenarios).map(([key, value]) => ({
    id: key,
    name: value.name,
    emoji: value.emoji,
  }));
  res.status(200).json(scenarioList);
};

// ─────────────────────────────────────────
// EVALUATE PRONUNCIATION
// ─────────────────────────────────────────
const evaluatePronunciation = async (req, res) => {
  const { transcribed_text, expected_text } = req.body;

  if (!transcribed_text || !expected_text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a Marathi pronunciation coach. Respond ONLY with a JSON object — no extra text.
{
  "score": <number 0-100>,
  "feedback": "<brief specific English feedback>",
  "correct_pronunciation": "<romanized pronunciation guide>",
  "encouragement": "<short encouraging line>"
}`,
        },
        {
          role: "user",
          content: `Expected: "${expected_text}"\nUser said: "${transcribed_text}"\nEvaluate the pronunciation.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const rawText = completion.choices[0].message.content;
    const evaluation = extractJSON(rawText);
    if (!evaluation)
      throw new Error("Could not parse pronunciation evaluation");
    res.status(200).json(evaluation);
  } catch (err) {
    console.error("Evaluation error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────
// TRANSCRIBE AUDIO
// ─────────────────────────────────────────
// const transcribeAudio = async (req, res) => {
//   const { audio_base64 } = req.body;

//   if (!audio_base64) {
//     return res.status(400).json({ message: "No audio provided" });
//   }

//   const tempPath = path.join(__dirname, `../../temp_${Date.now()}.m4a`);

//   try {
//     const audioBuffer = Buffer.from(audio_base64, "base64");
//     fs.writeFileSync(tempPath, audioBuffer);

//     // Use fetch-based approach compatible with all Node versions
//     const FormData = require("form-data");
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(tempPath), {
//       filename: "recording.m4a",
//       contentType: "audio/mp4",
//     });
//     formData.append("model", "whisper-large-v3");
//     formData.append("language", "mr");

//     const fetch = require("node-fetch");
//     const response = await fetch(
//       "https://api.groq.com/openai/v1/audio/transcriptions",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//           ...formData.getHeaders(),
//         },
//         body: formData,
//       },
//     );

//     const result = await response.json();

//     if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

//     if (!response.ok) {
//       throw new Error(result.error?.message || "Transcription failed");
//     }

//     res.status(200).json({ text: result.text });
//   } catch (err) {
//     if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
//     console.error("Transcription error full:", err);
//     console.error("Transcription error message:", err.message);
//     console.error("Transcription error stack:", err.stack);
//     res.status(500).json({ error: err.message, details: err.stack });
//   }
// };

const transcribeAudio = async (req, res) => {
  const { audio_base64 } = req.body;

  if (!audio_base64) {
    return res.status(400).json({ message: "No audio provided" });
  }

  const tempPath = path.join(__dirname, `../../temp_${Date.now()}.m4a`);

  try {
    const audioBuffer = Buffer.from(audio_base64, "base64");
    fs.writeFileSync(tempPath, audioBuffer);

    const FormData = require("form-data");
    const fetch = require("node-fetch");

    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempPath), {
      filename: "recording.m4a",
      contentType: "audio/mp4",
    });
    formData.append("model", "whisper-large-v3");
    formData.append("language", "mr");
    formData.append("response_format", "json");

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData,
      },
    );

    const result = await response.json();

    // Always clean up temp file
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    if (!response.ok) {
      console.error("Groq API error:", result);
      throw new Error(result.error?.message || "Transcription failed");
    }

    if (!result.text) {
      throw new Error("No transcription text returned");
    }

    res.status(200).json({ text: result.text });
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error("Transcription error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { chat, getScenarios, evaluatePronunciation, transcribeAudio };
