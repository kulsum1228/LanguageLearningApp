const pool = require("./db");

const seedData = async () => {
  try {
    console.log("Clearing old data...");
    await pool.query("DELETE FROM exercises");
    await pool.query("DELETE FROM vocabulary");
    await pool.query("DELETE FROM lessons");
    await pool.query("ALTER SEQUENCE lessons_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE vocabulary_id_seq RESTART WITH 1");

    console.log("Seeding lessons...");
    await pool.query(`
      INSERT INTO lessons (title, description, level, order_number) VALUES
      ('Greetings & Introductions', 'Learn how to greet people and introduce yourself in Marathi', 'Beginner', 1),
      ('Numbers & Counting', 'Learn numbers 1-100 in Marathi', 'Beginner', 2),
      ('Colors & Shapes', 'Learn colors and basic shapes in Marathi', 'Beginner', 3),
      ('Daily Routine', 'Learn words for daily activities and time', 'Beginner', 4),
      ('Food & Drinks', 'Learn common food, drinks and restaurant vocabulary', 'Beginner', 5),
      ('Family Members', 'Learn words for family relationships', 'Beginner', 6),
      ('Body Parts & Health', 'Learn body parts and basic health vocabulary', 'Beginner', 7),
      ('Animals & Nature', 'Learn names of animals and nature vocabulary', 'Beginner', 8),
      ('Transport & Directions', 'Learn transport modes and asking directions', 'Intermediate', 9),
      ('Shopping & Money', 'Learn shopping vocabulary and numbers for money', 'Intermediate', 10)
    `);

    console.log("Seeding vocabulary...");

    // Lesson 1 — Greetings (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (1, 'नमस्कार', 'Namaskar', 'Hello/Greetings', 'नमस्कार, तुम्ही कसे आहात?'),
      (1, 'धन्यवाद', 'Dhanyavaad', 'Thank you', 'तुमच्या मदतीबद्दल धन्यवाद'),
      (1, 'माफ करा', 'Maaf kara', 'Sorry/Excuse me', 'माफ करा, मला मराठी येत नाही'),
      (1, 'हो', 'Ho', 'Yes', 'हो, मला समजले'),
      (1, 'नाही', 'Naahi', 'No', 'नाही, मला माहीत नाही'),
      (1, 'कसे आहात?', 'Kase aahat?', 'How are you?', 'नमस्कार, कसे आहात?'),
      (1, 'मी ठीक आहे', 'Mi theek aahe', 'I am fine', 'मी ठीक आहे, धन्यवाद'),
      (1, 'माझे नाव', 'Mazhe naav', 'My name is', 'माझे नाव उम्मे आहे'),
      (1, 'भेटून आनंद झाला', 'Bhetun aanand zala', 'Nice to meet you', 'भेटून आनंद झाला!'),
      (1, 'शुभ सकाळ', 'Shubh sakaal', 'Good morning', 'शुभ सकाळ! कसे आहात?'),
      (1, 'शुभ रात्री', 'Shubh raatri', 'Good night', 'शुभ रात्री, झोप चांगली'),
      (1, 'कृपया', 'Krupaya', 'Please', 'कृपया मला मदत करा'),
      (1, 'पुन्हा भेटू', 'Punha bhetu', 'See you again', 'पुन्हा भेटू, नमस्कार'),
      (1, 'तुमचे नाव काय?', 'Tumche naav kay?', 'What is your name?', 'तुमचे नाव काय आहे?'),
      (1, 'मी मुंबईत राहतो', 'Mi Mumbaeet raahto', 'I live in Mumbai', 'मी मुंबईत राहतो')
    `);

    // Lesson 2 — Numbers (20 words)
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
      (2, 'दहा', 'Daha', 'Ten', 'दहा रुपये'),
      (2, 'वीस', 'Vees', 'Twenty', 'वीस रुपये द्या'),
      (2, 'तीस', 'Tees', 'Thirty', 'तीस मिनिटे'),
      (2, 'चाळीस', 'ChaaLees', 'Forty', 'चाळीस किलो'),
      (2, 'पन्नास', 'Pannaas', 'Fifty', 'पन्नास रुपये'),
      (2, 'शंभर', 'Shambhar', 'Hundred', 'शंभर रुपये'),
      (2, 'पहिला', 'Pahila', 'First', 'पहिला नंबर'),
      (2, 'दुसरा', 'Dusra', 'Second', 'दुसरा नंबर'),
      (2, 'किती?', 'Kiti?', 'How many?', 'किती रुपये?'),
      (2, 'जास्त', 'Jaast', 'More', 'जास्त नको'),
      (2, 'कमी', 'Kami', 'Less', 'कमी द्या')
    `);

    // Lesson 3 — Colors & Shapes (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (3, 'लाल', 'Laal', 'Red', 'हे फूल लाल आहे'),
      (3, 'निळा', 'Neela', 'Blue', 'आकाश निळे आहे'),
      (3, 'पिवळा', 'Pivla', 'Yellow', 'सूर्य पिवळा आहे'),
      (3, 'हिरवा', 'Hirva', 'Green', 'झाड हिरवे आहे'),
      (3, 'पांढरा', 'Pandhara', 'White', 'दूध पांढरे आहे'),
      (3, 'काळा', 'Kaala', 'Black', 'रात्र काळी आहे'),
      (3, 'नारंगी', 'Narangi', 'Orange', 'संत्रे नारंगी आहे'),
      (3, 'गुलाबी', 'Gulabi', 'Pink', 'गुलाब गुलाबी आहे'),
      (3, 'तपकिरी', 'Tapkiri', 'Brown', 'माती तपकिरी आहे'),
      (3, 'जांभळा', 'Jaambhla', 'Purple', 'द्राक्ष जांभळे आहे'),
      (3, 'गोल', 'Gol', 'Round/Circle', 'चंद्र गोल आहे'),
      (3, 'चौकोन', 'Chaukon', 'Square', 'चौकोन चार बाजूंचा'),
      (3, 'त्रिकोण', 'Trikon', 'Triangle', 'त्रिकोण तीन बाजूंचा'),
      (3, 'मोठा', 'Motha', 'Big', 'हत्ती मोठा आहे'),
      (3, 'लहान', 'Lahaan', 'Small', 'मुंगी लहान आहे')
    `);

    // Lesson 4 — Daily Routine (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (4, 'सकाळ', 'Sakaal', 'Morning', 'सकाळी उठणे चांगले आहे'),
      (4, 'दुपार', 'Dupaar', 'Afternoon', 'दुपारी जेवण करतो'),
      (4, 'संध्याकाळ', 'Sandhyakaal', 'Evening', 'संध्याकाळी फिरायला जातो'),
      (4, 'रात्र', 'Raatr', 'Night', 'रात्री झोपणे महत्त्वाचे आहे'),
      (4, 'झोप', 'Zhop', 'Sleep', 'मला झोप येत आहे'),
      (4, 'उठणे', 'Uthne', 'Wake up', 'मी सकाळी लवकर उठतो'),
      (4, 'आंघोळ', 'Aaghol', 'Bath', 'रोज आंघोळ करावी'),
      (4, 'जेवण', 'Jevan', 'Meal', 'जेवण तयार आहे'),
      (4, 'काम', 'Kaam', 'Work', 'मला काम करायचे आहे'),
      (4, 'शाळा', 'Shaala', 'School', 'मी शाळेत जातो'),
      (4, 'घर', 'Ghar', 'Home', 'मी घरी जातो'),
      (4, 'वेळ', 'Vel', 'Time', 'वेळ किती झाली?'),
      (4, 'आज', 'Aaj', 'Today', 'आज सुट्टी आहे'),
      (4, 'उद्या', 'Udya', 'Tomorrow', 'उद्या भेटू'),
      (4, 'काल', 'Kaal', 'Yesterday', 'काल पाऊस होता')
    `);

    // Lesson 5 — Food & Drinks (18 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (5, 'भात', 'Bhaat', 'Rice', 'मला भात आवडतो'),
      (5, 'पाणी', 'Paani', 'Water', 'मला पाणी द्या'),
      (5, 'चहा', 'Chaha', 'Tea', 'सकाळी चहा पितो'),
      (5, 'भाकरी', 'Bhaakri', 'Bread/Roti', 'भाकरी खूप चांगली आहे'),
      (5, 'दूध', 'Doodh', 'Milk', 'दूध आरोग्यासाठी चांगले आहे'),
      (5, 'फळ', 'Phal', 'Fruit', 'फळे खाणे चांगले आहे'),
      (5, 'भाजी', 'Bhaaji', 'Vegetable', 'भाजी खूप ताजी आहे'),
      (5, 'गोड', 'God', 'Sweet', 'हे मिठाई खूप गोड आहे'),
      (5, 'तिखट', 'Tikhat', 'Spicy', 'हे जेवण तिखट आहे'),
      (5, 'आंबट', 'Aambat', 'Sour', 'लिंबू आंबट असते'),
      (5, 'वडापाव', 'Vadapaav', 'Vada Pav', 'वडापाव मुंबईचे खास आहे'),
      (5, 'पोळी', 'Poli', 'Chapati', 'आईने पोळी केली'),
      (5, 'डाळ', 'Daal', 'Lentils', 'डाळ भात आवडते'),
      (5, 'कॉफी', 'Coffee', 'Coffee', 'मला कॉफी आवडते'),
      (5, 'रस', 'Ras', 'Juice', 'संत्र्याचा रस प्या'),
      (5, 'भूक', 'Bhook', 'Hunger', 'मला भूक लागली आहे'),
      (5, 'तहान', 'Tahaan', 'Thirst', 'मला तहान लागली'),
      (5, 'जेवण झाले', 'Jevan zale', 'Finished eating', 'माझे जेवण झाले')
    `);

    // Lesson 6 — Family (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (6, 'आई', 'Aai', 'Mother', 'माझी आई खूप चांगली आहे'),
      (6, 'बाबा', 'Baba', 'Father', 'माझे बाबा डॉक्टर आहेत'),
      (6, 'भाऊ', 'Bhau', 'Brother', 'माझा भाऊ शाळेत जातो'),
      (6, 'बहीण', 'Baheen', 'Sister', 'माझी बहीण खूप हुशार आहे'),
      (6, 'आजी', 'Aaji', 'Grandmother', 'आजी घरी असते'),
      (6, 'आजोबा', 'Aajoba', 'Grandfather', 'आजोबा पेपर वाचतात'),
      (6, 'मुलगा', 'Mulga', 'Son/Boy', 'तो एक चांगला मुलगा आहे'),
      (6, 'मुलगी', 'Mulgi', 'Daughter/Girl', 'ती एक हुशार मुलगी आहे'),
      (6, 'नवरा', 'Navra', 'Husband', 'माझे नवरा इंजिनिअर आहेत'),
      (6, 'बायको', 'Bayko', 'Wife', 'माझी बायको शिक्षिका आहे'),
      (6, 'काका', 'Kaaka', 'Uncle (fathers brother)', 'माझे काका येणार आहेत'),
      (6, 'काकू', 'Kaaku', 'Aunt (fathers brothers wife)', 'काकू स्वयंपाक करतात'),
      (6, 'मामा', 'Mama', 'Uncle (mothers brother)', 'मामा मुंबईत राहतात'),
      (6, 'कुटुंब', 'Kutumb', 'Family', 'माझे कुटुंब मोठे आहे'),
      (6, 'मित्र', 'Mitra', 'Friend', 'माझा मित्र चांगला आहे')
    `);

    // Lesson 7 — Body Parts & Health (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (7, 'डोके', 'Doke', 'Head', 'माझे डोके दुखत आहे'),
      (7, 'डोळे', 'Dole', 'Eyes', 'त्याचे डोळे निळे आहेत'),
      (7, 'कान', 'Kaan', 'Ears', 'माझे कान दुखत आहेत'),
      (7, 'नाक', 'Naak', 'Nose', 'नाक बंद आहे'),
      (7, 'तोंड', 'Tond', 'Mouth', 'तोंड उघडा'),
      (7, 'हात', 'Haat', 'Hand', 'हात धुवा'),
      (7, 'पाय', 'Paay', 'Leg/Foot', 'पाय दुखत आहे'),
      (7, 'पोट', 'Pot', 'Stomach', 'पोट दुखत आहे'),
      (7, 'पाठ', 'Paath', 'Back', 'पाठ दुखते'),
      (7, 'छाती', 'Chhati', 'Chest', 'छातीत दुखते'),
      (7, 'ताप', 'Taap', 'Fever', 'मला ताप आला आहे'),
      (7, 'खोकला', 'Khokla', 'Cough', 'मला खोकला होत आहे'),
      (7, 'दुखणे', 'Dukhne', 'Pain/Ache', 'खूप दुखत आहे'),
      (7, 'औषध', 'Aushadh', 'Medicine', 'डॉक्टरने औषध दिले'),
      (7, 'दवाखाना', 'Davakhana', 'Hospital/Clinic', 'मला दवाखान्यात जायचे आहे')
    `);

    // Lesson 8 — Animals & Nature (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (8, 'कुत्रा', 'Kutra', 'Dog', 'कुत्रा भुंकतो'),
      (8, 'मांजर', 'Maanjar', 'Cat', 'मांजर झोपते'),
      (8, 'गाय', 'Gaay', 'Cow', 'गाय दूध देते'),
      (8, 'घोडा', 'Ghoda', 'Horse', 'घोडा धावतो'),
      (8, 'हत्ती', 'Hatti', 'Elephant', 'हत्ती मोठा आहे'),
      (8, 'वाघ', 'Vaagh', 'Tiger', 'वाघ जंगलात राहतो'),
      (8, 'माकड', 'Maakad', 'Monkey', 'माकड झाडावर आहे'),
      (8, 'पक्षी', 'Pakshi', 'Bird', 'पक्षी उडतो'),
      (8, 'मासा', 'Maasa', 'Fish', 'मासा पाण्यात राहतो'),
      (8, 'झाड', 'Zaad', 'Tree', 'झाड हिरवे आहे'),
      (8, 'फूल', 'Phool', 'Flower', 'फूल सुंदर आहे'),
      (8, 'नदी', 'Nadi', 'River', 'नदी वाहते'),
      (8, 'डोंगर', 'Dongar', 'Mountain', 'डोंगर उंच आहे'),
      (8, 'समुद्र', 'Samudra', 'Sea/Ocean', 'समुद्र खोल आहे'),
      (8, 'पाऊस', 'Paaoos', 'Rain', 'पाऊस येत आहे')
    `);

    // Lesson 9 — Transport & Directions (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (9, 'बस', 'Bus', 'Bus', 'मी बसने जातो'),
      (9, 'रिक्षा', 'Riksha', 'Auto-rickshaw', 'रिक्षाने जाऊ'),
      (9, 'रेल्वे', 'Railway', 'Train', 'रेल्वेने मुंबई जाऊ'),
      (9, 'टॅक्सी', 'Taxi', 'Taxi', 'टॅक्सी बोलवा'),
      (9, 'उजवीकडे', 'Ujvikade', 'Right side', 'उजवीकडे वळा'),
      (9, 'डावीकडे', 'Daavikade', 'Left side', 'डावीकडे जा'),
      (9, 'सरळ', 'Saral', 'Straight', 'सरळ जा'),
      (9, 'जवळ', 'Javal', 'Near', 'स्टेशन जवळ आहे'),
      (9, 'दूर', 'Door', 'Far', 'घर दूर आहे'),
      (9, 'थांबा', 'Thaamba', 'Stop', 'इथे थांबा'),
      (9, 'कुठे', 'Kuthe', 'Where', 'स्टेशन कुठे आहे?'),
      (9, 'रस्ता', 'Rasta', 'Road', 'हा रस्ता चुकीचा आहे'),
      (9, 'स्टेशन', 'Station', 'Station', 'स्टेशन किती दूर आहे?'),
      (9, 'किती वेळ', 'Kiti vel', 'How long', 'किती वेळ लागेल?'),
      (9, 'पोहोचणे', 'Pohochne', 'To reach/arrive', 'आपण पोहोचलो')
    `);

    // Lesson 10 — Shopping & Money (15 words)
    await pool.query(`
      INSERT INTO vocabulary (lesson_id, marathi_word, romanized, english_meaning, example_sentence) VALUES
      (10, 'दुकान', 'Dukaan', 'Shop', 'दुकान उघडे आहे'),
      (10, 'किंमत', 'Kimat', 'Price', 'किंमत किती आहे?'),
      (10, 'महाग', 'Mahaag', 'Expensive', 'हे खूप महाग आहे'),
      (10, 'स्वस्त', 'Svast', 'Cheap', 'हे स्वस्त आहे'),
      (10, 'सवलत', 'Savlat', 'Discount', 'सवलत मिळेल का?'),
      (10, 'पैसे', 'Paise', 'Money', 'पैसे किती झाले?'),
      (10, 'रुपये', 'Rupaye', 'Rupees', 'शंभर रुपये द्या'),
      (10, 'खरेदी', 'Kharedi', 'Shopping', 'खरेदी करायला जाऊ'),
      (10, 'घेणे', 'Ghene', 'To take/buy', 'मला हे घ्यायचे आहे'),
      (10, 'देणे', 'Dene', 'To give', 'पैसे द्या'),
      (10, 'हे द्या', 'He dya', 'Give me this', 'हे द्या'),
      (10, 'नको', 'Nako', 'Don''t want', 'मला नको'),
      (10, 'आवडले', 'Aavadle', 'Liked it', 'मला हे आवडले'),
      (10, 'परत', 'Parat', 'Return', 'मला परत करायचे आहे'),
      (10, 'बिल', 'Bill', 'Bill', 'बिल द्या')
    `);

    console.log("✅ All vocabulary seeded!");
    console.log(
      "Skipping static exercises - AI will generate them dynamically",
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedData();
