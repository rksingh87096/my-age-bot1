const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- 1. SERVER SETUP ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('<h1>💎 GOD MODE BOT ACTIVE</h1>'));

app.listen(port, '0.0.0.0', () => console.log(`🚀 Server running on port ${port}`));

// --- 2. BOT CONFIG ---
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// --- 3. ADVANCED LOGIC BRAIN ---

// 1. Birthstone & Flower Logic
function getMysticInfo(m) {
    const stones = ["Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl", "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise"];
    const flowers = ["Carnation", "Violet", "Daffodil", "Daisy", "Lily", "Rose", "Larkspur", "Gladiolus", "Aster", "Marigold", "Chrysanthemum", "Narcissus"];
    return { stone: stones[m-1], flower: flowers[m-1] };
}

// 2. Zodiac Element (Fire, Water, Air, Earth)
function getElement(zodiacName) {
    if (zodiacName.includes("Aries") || zodiacName.includes("Leo") || zodiacName.includes("Sagittarius")) return "🔥 Fire";
    if (zodiacName.includes("Taurus") || zodiacName.includes("Virgo") || zodiacName.includes("Capricorn")) return "🌍 Earth";
    if (zodiacName.includes("Gemini") || zodiacName.includes("Libra") || zodiacName.includes("Aquarius")) return "💨 Air";
    return "💧 Water";
}

// 3. 10,000 Days Milestone Calculator
function getNextMilestone(birthDate, totalDays) {
    const nextBig = Math.ceil((totalDays + 1) / 1000) * 1000; // Next multiple of 1000
    const diff = nextBig - totalDays;
    const milestoneDate = new Date();
    milestoneDate.setDate(milestoneDate.getDate() + diff);
    return { days: nextBig, date: milestoneDate.toLocaleDateString('en-GB') };
}

// 4. Standard Helpers
function isValidDate(d, m, y) {
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function getZodiac(d, m) {
    const signs = [
        "♑ Capricorn", "♒ Aquarius", "♓ Pisces", "♈ Aries", "♉ Taurus", "♊ Gemini", 
        "♋ Cancer", "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Scorpio", "♐ Sagittarius"
    ];
    const cutoff = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= cutoff[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    return signs[i];
}

// --- MAIN CALCULATOR ---
function calculateGodMode(d, m, y) {
    if (!isValidDate(d, m, y)) return { error: "❌ Invalid Date." };
    
    const today = new Date();
    const birth = new Date(year = y, month = m - 1, day = d);
    if (birth > today) return { error: "🔮 Future date not allowed!" };

    // Basic Age
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    let ageDays = today.getDate() - birth.getDate();
    if (ageDays < 0) { ageMonths--; ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (ageMonths < 0) { ageYears--; ageMonths += 12; }

    // Advanced Stats
    const diffTime = Math.abs(today - birth);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));
    
    // Bio Stats (Averages)
    const heartbeats = (totalMinutes * 80).toLocaleString(); // Avg 80 bpm
    const breaths = (totalMinutes * 16).toLocaleString();   // Avg 16 bpm
    const sleep = Math.floor(totalDays / 3).toLocaleString(); // 1/3 of life spent sleeping

    // Milestones
    const milestone = getNextMilestone(birth, totalDays);
    const mystic = getMysticInfo(m);
    const zodiac = getZodiac(d, m);
    
    // Birthday Countdown
    let nextBday = new Date(today.getFullYear(), m - 1, d);
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToBday = Math.ceil(Math.abs(nextBday - today) / (1000 * 60 * 60 * 24));

    return {
        dob: `${d}-${m}-${y}`,
        dayName: birth.toLocaleDateString('en-US', { weekday: 'long' }),
        age: `${ageYears}y ${ageMonths}m ${ageDays}d`,
        totalDays: totalDays.toLocaleString(),
        heartbeats, breaths, sleep,
        zodiac,
        element: getElement(zodiac),
        stone: mystic.stone,
        flower: mystic.flower,
        milestoneDays: milestone.days.toLocaleString(),
        milestoneDate: milestone.date,
        nextBday: daysToBday
    };
}

// --- 4. MESSAGE HANDLERS ---

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "💎 **GOD MODE ACTIVATED**\n\nBhejo apni DOB (e.g., `31-03-2008`) aur dekho jalwa! 😎", { parse_mode: 'Markdown' });
});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    
    const dateRegex = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
    const match = msg.text.match(dateRegex);

    if (match) {
        const d = parseInt(match[1]), m = parseInt(match[2]), y = parseInt(match[3]);
        const data = calculateGodMode(d, m, y);
        
        if (data.error) {
             bot.sendMessage(msg.chat.id, data.error);
             return;
        }

        // --- THE GOD LEVEL DESIGN ---
        const response = `
╭━━━━━━━━━━━━━━━━━━━╮
      🧬 **LIFE PROFILE ANALYZER** 
╰━━━━━━━━━━━━━━━━━━━╯
📅 **Origin:** ${data.dob} (${data.dayName})
🎂 **Level:** ${data.age}

╭── ⚡ **BIOLOGICAL ENGINE** ──
│ ❤️ Heartbeats: ${data.heartbeats}
│ 🌬️ Breaths: ${data.breaths}
│ 💤 Slept for: ${data.sleep} Days
╰───────────────────────

╭── 🔮 **MYSTIC AURA** ──
│ 🌌 Zodiac: ${data.zodiac}
│ ⚔️ Element: ${data.element}
│ 💎 Gem: ${data.stone}
│ 🌸 Soul Flower: ${data.flower}
╰───────────────────────

╭── 🏆 **NEXT UNLOCKS** ──
│ 🎉 Next B'day: in **${data.nextBday}** Days
│ 🎖️ **${data.milestoneDays}th Day** on:
│ 📅 ${data.milestoneDate}
╰───────────────────────

_Designed for Legends 👑_
`;

        bot.sendChatAction(msg.chat.id, 'typing');
        setTimeout(() => {
            bot.sendMessage(msg.chat.id, response, { 
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: "📤 Share My Profile", switch_inline_query: `I am ${data.totalDays} days old!` }]]
                }
            });
        }, 1000);
    }
});
