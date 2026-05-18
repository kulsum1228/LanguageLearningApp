const Groq = require("groq-sdk");
const pool = require("../config/db");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateExercises = async (req, res) => {
  const { lesson_id } = req.params;
  const { score } = req.query; // For adaptive difficulty

  try {
    // Get lesson info
    const lessonRes = await pool.query("SELECT * FROM lessons WHERE id = $1", [
      lesson_id,
    ]);
    if (lessonRes.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    const lesson = lessonRes.rows[0];

    // Get vocabulary for this lesson
    const vocabRes = await pool.query(
      "SELECT * FROM vocabulary WHERE lesson_id = $1",
      [lesson_id],
    );
    const vocabulary = vocabRes.rows;

    if (vocabulary.length === 0) {
      return res.status(404).json({ message: "No vocabulary found" });
    }

    // Determine difficulty based on previous score
    const previousScore = parseInt(score) || 0;
    let difficulty = "beginner";
    let numQuestions = 5;

    if (previousScore >= 80) {
      difficulty = "advanced";
      numQuestions = 8;
    } else if (previousScore >= 50) {
      difficulty = "intermediate";
      numQuestions = 6;
    }

    // Build vocabulary list for prompt
    const vocabList = vocabulary
      .map(
        (v) =>
          `- ${v.marathi_word} (${v.romanized}) = ${v.english_meaning} | Example: ${v.example_sentence}`,
      )
      .join("\n");

    const prompt = `You are a Marathi language exercise creator. Create ${numQuestions} exercises for a ${difficulty} level student learning Marathi.

LESSON: ${lesson.title}
LEVEL: ${lesson.level}
DIFFICULTY: ${difficulty}

VOCABULARY FROM THIS LESSON:
${vocabList}

EXERCISE TYPES TO CREATE:
${
  difficulty === "beginner"
    ? "- All MCQ (Multiple Choice Questions) with 4 options each"
    : difficulty === "intermediate"
      ? "- Mix of MCQ and FILL exercises (fill in the blank)"
      : "- Mix of MCQ, FILL, and harder translation exercises"
}

RULES:
- MCQ: Question in English, options can be Marathi words OR English meanings
- FILL: Marathi sentence with one word as blank (_____)
- Vary the question types: some ask for Marathi meaning, some ask for English meaning
- For advanced: include questions that test grammar or sentence building
- Make questions progressively harder
- Use ONLY words from the vocabulary list provided
- correct_answer must exactly match one of the options for MCQ

Respond ONLY with a valid JSON array. No extra text. Example format:
[
  {
    "type": "MCQ",
    "question": "What does 'नमस्कार' mean?",
    "options": ["Hello", "Goodbye", "Thank you", "Sorry"],
    "correct_answer": "Hello"
  },
  {
    "type": "FILL",
    "question": "माझे _____ उम्मे आहे (My name is Umme)",
    "options": null,
    "correct_answer": "नाव"
  }
]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a Marathi language exercise creator. Always respond with valid JSON only. Wrap your array in an object like: {"exercises": [...]}',
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const rawResponse = completion.choices[0].message.content;
    console.log("AI Exercise Response:", rawResponse);

    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (e) {
      const match = rawResponse.match(/\[[\s\S]*\]/);
      if (match) parsed = { exercises: JSON.parse(match[0]) };
      else throw new Error("Could not parse AI response");
    }

    const exercises = parsed.exercises || parsed;

    if (!Array.isArray(exercises)) {
      throw new Error("AI did not return an array of exercises");
    }

    // Format exercises to match expected structure
    const formattedExercises = exercises.map((ex, index) => ({
      id: index + 1,
      lesson_id: parseInt(lesson_id),
      type: ex.type || "MCQ",
      question: ex.question,
      options: Array.isArray(ex.options) ? ex.options : null,
      correct_answer: ex.correct_answer,
      difficulty: difficulty,
    }));

    res.status(200).json({
      exercises: formattedExercises,
      difficulty: difficulty,
      total: formattedExercises.length,
      message: `Generated ${formattedExercises.length} ${difficulty} exercises`,
    });
  } catch (err) {
    console.error("Exercise generation error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generateExercises };
