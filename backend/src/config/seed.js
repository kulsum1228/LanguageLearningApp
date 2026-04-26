const pool = require("./db");

const seedData = async () => {
  try {
    console.log("Clearing old data...");
    await pool.query("DELETE FROM exercises");
    await pool.query("DELETE FROM vocabulary");
    await pool.query("DELETE FROM lessons");

    console.log("Seeding lessons...");
    await pool.query(`
      INSERT INTO lessons (title, description, level, order_number) VALUES
      ('Greetings & Introductions', 'Learn how to greet people and introduce yourself', 'Beginner', 1),
      ('Numbers & Counting', 'Learn numbers 1-20', 'Beginner', 2),
      ('Colors', 'Learn basic colors', 'Beginner', 3),
      ('Daily Routine', 'Learn words for daily activities', 'Beginner', 4),
      ('Food & Drinks', 'Learn common food and drink vocabulary', 'Beginner', 5),
      ('Family Members', 'Learn words for family relationships', 'Beginner', 6),
      ('Body Parts', 'Learn names of body parts', 'Beginner', 7),
      ('Animals', 'Learn names of common animals', 'Beginner', 8)
    `);

    console.log("Seeding vocabulary...");

    // Lesson 1 — Greetings
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (1, 'नमस्कार', 'Namaskar', 'Hello/Greetings', 'नमस्कार, तुम्ही कसे आहात?'),
      (1, 'धन्यवाद', 'Dhanyavaad', 'Thank you', 'तुमच्या मदतीबद्दल धन्यवाद'),
      (1, 'माफ करा', 'Maaf kara', 'Sorry/Excuse me', 'माफ करा, मला मराठी येत नाही'),
      (1, 'हो', 'Ho', 'Yes', 'हो, मला समजले'),
      (1, 'नाही', 'Naahi', 'No', 'नाही, मला माहीत नाही'),
      (1, 'कसे आहात?', 'Kase aahat?', 'How are you?', 'नमस्कार, कसे आहात?'),
      (1, 'मी ठीक आहे', 'Mi theek aahe', 'I am fine', 'मी ठीक आहे, धन्यवाद'),
      (1, 'माझे नाव', 'Mazhe naav', 'My name is', 'माझे नाव उम्मे आहे')
    `);

    // Lesson 2 — Numbers
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (2, 'एक', 'Ek', 'One', 'एक माणूस'),
      (2, 'दोन', 'Don', 'Two', 'दोन मुले'),
      (2, 'तीन', 'Teen', 'Three', 'तीन फळे'),
      (2, 'चार', 'Chaar', 'Four', 'चार घरे'),
      (2, 'पाच', 'Paach', 'Five', 'पाच रुपये'),
      (2, 'सहा', 'Saha', 'Six', 'सहा दिवस'),
      (2, 'सात', 'Saat', 'Seven', 'सात रंग'),
      (2, 'आठ', 'Aath', 'Eight', 'आठ वाजले'),
      (2, 'नऊ', 'Nau', 'Nine', 'नऊ मुले'),
      (2, 'दहा', 'Daha', 'Ten', 'दहा रुपये')
    `);

    // Lesson 3 — Colors
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (3, 'लाल', 'Laal', 'Red', 'हे फूल लाल आहे'),
      (3, 'निळा', 'Neela', 'Blue', 'आकाश निळे आहे'),
      (3, 'पिवळा', 'Pivla', 'Yellow', 'सूर्य पिवळा आहे'),
      (3, 'हिरवा', 'Hirva', 'Green', 'झाड हिरवे आहे'),
      (3, 'पांढरा', 'Pandhara', 'White', 'दूध पांढरे आहे'),
      (3, 'काळा', 'Kaala', 'Black', 'रात्र काळी आहे'),
      (3, 'नारंगी', 'Narangi', 'Orange', 'संत्रे नारंगी आहे'),
      (3, 'गुलाबी', 'Gulabi', 'Pink', 'गुलाब गुलाबी आहे')
    `);

    // Lesson 4 — Daily Routine
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (4, 'सकाळ', 'Sakaal', 'Morning', 'सकाळी उठणे चांगले आहे'),
      (4, 'संध्याकाळ', 'Sandhyakaal', 'Evening', 'संध्याकाळी फिरायला जातो'),
      (4, 'रात्र', 'Raatr', 'Night', 'रात्री झोपणे महत्त्वाचे आहे'),
      (4, 'जेवण', 'Jevan', 'Meal/Food', 'जेवण खूप चांगले आहे'),
      (4, 'झोप', 'Zhop', 'Sleep', 'मला झोप येत आहे'),
      (4, 'काम', 'Kaam', 'Work', 'मला काम करायचे आहे'),
      (4, 'शाळा', 'Shaala', 'School', 'मी शाळेत जातो'),
      (4, 'घर', 'Ghar', 'Home', 'मी घरी जातो')
    `);

    // Lesson 5 — Food & Drinks
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (5, 'भात', 'Bhaat', 'Rice', 'मला भात आवडतो'),
      (5, 'पाणी', 'Paani', 'Water', 'मला पाणी द्या'),
      (5, 'चहा', 'Chaha', 'Tea', 'सकाळी चहा पितो'),
      (5, 'भाकरी', 'Bhaakri', 'Bread/Roti', 'भाकरी खूप चांगली आहे'),
      (5, 'दूध', 'Doodh', 'Milk', 'दूध आरोग्यासाठी चांगले आहे'),
      (5, 'फळ', 'Phal', 'Fruit', 'फळे खाणे चांगले आहे'),
      (5, 'भाजी', 'Bhaaji', 'Vegetable', 'भाजी खूप ताजी आहे'),
      (5, 'गोड', 'God', 'Sweet', 'हे मिठाई खूप गोड आहे')
    `);

    // Lesson 6 — Family Members
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (6, 'आई', 'Aai', 'Mother', 'माझी आई खूप चांगली आहे'),
      (6, 'बाबा', 'Baba', 'Father', 'माझे बाबा डॉक्टर आहेत'),
      (6, 'भाऊ', 'Bhau', 'Brother', 'माझा भाऊ शाळेत जातो'),
      (6, 'बहीण', 'Baheen', 'Sister', 'माझी बहीण खूप हुशार आहे'),
      (6, 'आजी', 'Aaji', 'Grandmother', 'आजी घरी असते'),
      (6, 'आजोबा', 'Aajoba', 'Grandfather', 'आजोबा पेपर वाचतात'),
      (6, 'मुलगा', 'Mulga', 'Son/Boy', 'तो एक चांगला मुलगा आहे'),
      (6, 'मुलगी', 'Mulgi', 'Daughter/Girl', 'ती एक हुशार मुलगी आहे')
    `);

    // Lesson 7 — Body Parts
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (7, 'डोके', 'Doke', 'Head', 'माझे डोके दुखत आहे'),
      (7, 'डोळे', 'Dole', 'Eyes', 'त्याचे डोळे निळे आहेत'),
      (7, 'कान', 'Kaan', 'Ears', 'माझे कान दुखत आहेत'),
      (7, 'नाक', 'Naak', 'Nose', 'नाक बंद आहे'),
      (7, 'तोंड', 'Tond', 'Mouth', 'तोंड उघडा'),
      (7, 'हात', 'Haat', 'Hand', 'हात धुवा'),
      (7, 'पाय', 'Paay', 'Leg/Foot', 'पाय दुखत आहे'),
      (7, 'पोट', 'Pot', 'Stomach', 'पोट दुखत आहे')
    `);

    // Lesson 8 — Animals
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (8, 'कुत्रा', 'Kutra', 'Dog', 'कुत्रा भुंकतो'),
      (8, 'मांजर', 'Maanjar', 'Cat', 'मांजर झोपते'),
      (8, 'गाय', 'Gaay', 'Cow', 'गाय दूध देते'),
      (8, 'घोडा', 'Ghoda', 'Horse', 'घोडा धावतो'),
      (8, 'हत्ती', 'Hatti', 'Elephant', 'हत्ती मोठा आहे'),
      (8, 'वाघ', 'Vaagh', 'Tiger', 'वाघ जंगलात राहतो'),
      (8, 'माकड', 'Maakad', 'Monkey', 'माकड झाडावर आहे'),
      (8, 'पक्षी', 'Pakshi', 'Bird', 'पक्षी उडतो')
    `);

    console.log("Seeding exercises...");

    // Lesson 1 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (1, 'MCQ', 'What does "नमस्कार" mean in English?',
      '["Hello", "Goodbye", "Thank you", "Sorry"]', 'Hello'),
      (1, 'MCQ', 'How do you say "Thank you" in Marathi?',
      '["नमस्कार", "धन्यवाद", "माफ करा", "हो"]', 'धन्यवाद'),
      (1, 'MCQ', 'What does "हो" mean?',
      '["No", "Maybe", "Yes", "Hello"]', 'Yes'),
      (1, 'MCQ', 'How do you say "How are you?" in Marathi?',
      '["माझे नाव", "कसे आहात?", "मी ठीक आहे", "माफ करा"]', 'कसे आहात?'),
      (1, 'FILL', 'माझे _____ उम्मे आहे (My name is Umme)',
      NULL, 'नाव')
    `);

    // Lesson 2 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (2, 'MCQ', 'What is "Three" in Marathi?',
      '["दोन", "एक", "तीन", "चार"]', 'तीन'),
      (2, 'MCQ', 'What does "पाच" mean?',
      '["Four", "Six", "Three", "Five"]', 'Five'),
      (2, 'MCQ', 'How do you say "Ten" in Marathi?',
      '["नऊ", "दहा", "आठ", "सात"]', 'दहा'),
      (2, 'FILL', 'एक, दोन, _____ (One, Two, ?)',
      NULL, 'तीन')
    `);

    // Lesson 3 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (3, 'MCQ', 'What does "लाल" mean?',
      '["Blue", "Red", "Green", "Yellow"]', 'Red'),
      (3, 'MCQ', 'How do you say "Blue" in Marathi?',
      '["लाल", "हिरवा", "निळा", "पिवळा"]', 'निळा'),
      (3, 'MCQ', 'What color is "पांढरा"?',
      '["Black", "White", "Pink", "Orange"]', 'White'),
      (3, 'FILL', 'आकाश _____ आहे (The sky is blue)',
      NULL, 'निळे')
    `);

    // Lesson 4 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (4, 'MCQ', 'What does "सकाळ" mean?',
      '["Night", "Evening", "Morning", "Afternoon"]', 'Morning'),
      (4, 'MCQ', 'How do you say "Home" in Marathi?',
      '["शाळा", "काम", "झोप", "घर"]', 'घर'),
      (4, 'MCQ', 'What does "झोप" mean?',
      '["Work", "School", "Sleep", "Food"]', 'Sleep'),
      (4, 'FILL', 'मी _____ जातो (I go to school)',
      NULL, 'शाळेत')
    `);

    // Lesson 5 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (5, 'MCQ', 'What does "पाणी" mean?',
      '["Milk", "Tea", "Water", "Juice"]', 'Water'),
      (5, 'MCQ', 'How do you say "Rice" in Marathi?',
      '["भाजी", "भाकरी", "दूध", "भात"]', 'भात'),
      (5, 'MCQ', 'What does "गोड" mean?',
      '["Sour", "Spicy", "Bitter", "Sweet"]', 'Sweet'),
      (5, 'FILL', 'मला _____ द्या (Please give me water)',
      NULL, 'पाणी')
    `);

    // Lesson 6 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (6, 'MCQ', 'What does "आई" mean?',
      '["Father", "Sister", "Mother", "Brother"]', 'Mother'),
      (6, 'MCQ', 'How do you say "Brother" in Marathi?',
      '["बहीण", "आई", "बाबा", "भाऊ"]', 'भाऊ'),
      (6, 'MCQ', 'What does "आजी" mean?',
      '["Grandfather", "Mother", "Grandmother", "Sister"]', 'Grandmother'),
      (6, 'FILL', 'माझे _____ डॉक्टर आहेत (My father is a doctor)',
      NULL, 'बाबा')
    `);

    // Lesson 7 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (7, 'MCQ', 'What does "डोके" mean?',
      '["Hand", "Leg", "Head", "Eye"]', 'Head'),
      (7, 'MCQ', 'How do you say "Hand" in Marathi?',
      '["पाय", "डोळे", "हात", "नाक"]', 'हात'),
      (7, 'MCQ', 'What does "पोट" mean?',
      '["Head", "Stomach", "Nose", "Ear"]', 'Stomach'),
      (7, 'FILL', 'माझे _____ दुखत आहे (My head hurts)',
      NULL, 'डोके')
    `);

    // Lesson 8 exercises
    await pool.query(`
      INSERT INTO exercises (lesson_id, type, question, options, correct_answer) VALUES
      (8, 'MCQ', 'What does "कुत्रा" mean?',
      '["Cat", "Dog", "Cow", "Horse"]', 'Dog'),
      (8, 'MCQ', 'How do you say "Elephant" in Marathi?',
      '["वाघ", "घोडा", "हत्ती", "माकड"]', 'हत्ती'),
      (8, 'MCQ', 'What does "गाय" mean?',
      '["Tiger", "Bird", "Monkey", "Cow"]', 'Cow'),
      (8, 'FILL', '_____ दूध देते (Cow gives milk)',
      NULL, 'गाय')
    `);

    console.log("✅ All data seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedData();
