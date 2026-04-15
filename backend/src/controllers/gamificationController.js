const pool = require("../config/db");

// Get user stats (XP, streak, lessons done)
const getUserStats = async (req, res) => {
  const { user_id } = req.params;
  try {
    // Get XP and streak from users table
    const user = await pool.query(
      "SELECT xp_points, streak_days FROM users WHERE id = $1",
      [user_id],
    );

    // Get lessons completed count
    const lessonsCount = await pool.query(
      "SELECT COUNT(*) FROM progress WHERE user_id = $1 AND completed = true",
      [user_id],
    );

    // Get badges
    const badges = await pool.query(
      "SELECT * FROM badges WHERE user_id = $1 ORDER BY earned_at DESC",
      [user_id],
    );

    res.status(200).json({
      xp_points: user.rows[0]?.xp_points || 0,
      streak_days: user.rows[0]?.streak_days || 0,
      lessons_done: parseInt(lessonsCount.rows[0].count),
      badges: badges.rows,
    });
  } catch (err) {
    console.error("Gamification error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Award XP after exercise completion
const awardXP = async (req, res) => {
  const { user_id, lesson_id, score, total } = req.body;
  try {
    // Calculate XP based on score
    const xpEarned = Math.round((score / total) * 100);

    // Update user XP
    const updatedUser = await pool.query(
      "UPDATE users SET xp_points = xp_points + $1 WHERE id = $2 RETURNING xp_points",
      [xpEarned, user_id],
    );

    // Update streak
    await updateStreak(user_id);

    // Check and award badges
    const newBadges = await checkBadges(user_id, updatedUser.rows[0].xp_points);

    res.status(200).json({
      xp_earned: xpEarned,
      total_xp: updatedUser.rows[0].xp_points,
      new_badges: newBadges,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update streak
const updateStreak = async (user_id) => {
  const today = new Date().toISOString().split("T")[0];

  const streak = await pool.query("SELECT * FROM streaks WHERE user_id = $1", [
    user_id,
  ]);

  if (streak.rows.length === 0) {
    // First activity
    await pool.query(
      "INSERT INTO streaks (user_id, last_activity_date, current_streak, longest_streak) VALUES ($1, $2, 1, 1)",
      [user_id, today],
    );
    await pool.query("UPDATE users SET streak_days = 1 WHERE id = $1", [
      user_id,
    ]);
  } else {
    const lastDate = streak.rows[0].last_activity_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = streak.rows[0].current_streak;

    if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak += 1;
    } else if (lastDate !== today) {
      // Streak broken
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, streak.rows[0].longest_streak);

    await pool.query(
      "UPDATE streaks SET last_activity_date = $1, current_streak = $2, longest_streak = $3 WHERE user_id = $4",
      [today, newStreak, longestStreak, user_id],
    );
    await pool.query("UPDATE users SET streak_days = $1 WHERE id = $2", [
      newStreak,
      user_id,
    ]);
  }
};

// Check and award badges
const checkBadges = async (user_id, totalXP) => {
  const newBadges = [];

  const badgeRules = [
    { xp: 50, name: "First Steps", emoji: "👶" },
    { xp: 100, name: "Getting Started", emoji: "🌱" },
    { xp: 250, name: "Learner", emoji: "📚" },
    { xp: 500, name: "Dedicated", emoji: "💪" },
    { xp: 1000, name: "Expert", emoji: "🏆" },
  ];

  for (const rule of badgeRules) {
    if (totalXP >= rule.xp) {
      // Check if badge already earned
      const existing = await pool.query(
        "SELECT * FROM badges WHERE user_id = $1 AND badge_name = $2",
        [user_id, rule.name],
      );
      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO badges (user_id, badge_name, badge_emoji) VALUES ($1, $2, $3)",
          [user_id, rule.name, rule.emoji],
        );
        newBadges.push({ name: rule.name, emoji: rule.emoji });
      }
    }
  }
  return newBadges;
};

module.exports = { getUserStats, awardXP };
