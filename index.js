const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- 1. SERVER SETUP ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('<h1>🤖 SYSTEM IDENTITY BOT ACTIVE</h1>'));

app.listen(port, '0.0.0.0', () => console.log(`🚀 System Online on port ${port}`));

// --- 2. CONFIGURATION ---
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// --- 3. SYSTEM LOGIC (CALCULATION CORE) ---

// Helpers
function isValidDate(d, m, y) {
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function getZodiacInfo(d, m) {
    const signs = [
        { name: "CAPRICORN", symbol: "♑", element: "EARTH [🌍]", core: "Garnet" },
        { name: "AQUARIUS", symbol: "♒", element: "AIR [💨]", core: "Amethyst" },
        { name: "PISCES", symbol: "♓", element: "WATER [💧]", core: "Aquamarine" },
        { name: "ARIES", symbol: "♈", element: "FIRE [🔥]", core: "Diamond" },
        { name: "TAURUS", symbol: "♉", element: "EARTH [🌍]", core: "Emerald" },
        { name: "GEMINI", symbol: "♊", element: "AIR [💨]", core: "Pearl" },
        { name: "CANCER", symbol: "♋", element: "WATER [💧]", core: "Ruby" },
        { name: "LEO", symbol: "♌", element: "FIRE [🔥]", core: "Peridot" },
        { name: "VIRGO", symbol: "♍", element: "EARTH [🌍]", core: "Sapphire" },
        { name: "LIBRA", symbol: "♎", element: "AIR [💨]", core: "Opal" },
        { name: "SCORPIO", symbol: "♏", element: "WATER [💧]", core: "Topaz" },
        { name: "SAGITTARIUS", symbol: "♐", element: "FIRE [🔥]", core: "Turquoise" }
    ];
    const cutoff = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= cutoff[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    return signs[i];
}

function getMilestone(totalDays) {
    // Pichla milestone (e.g. 6000) aur Agla (e.g. 7000)
    const nextMilestone = Math.ceil((totalDays + 1) / 1000) * 1000;
    const daysRemaining = nextMilestone - totalDays;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysRemaining);
    
    return {
        nextTarget: nextMilestone.toLocaleString(),
        date: futureDate.toLocaleDateString('en-GB') // DD/MM/YYYY format
    };
}

function getLevelProgress(d, m) {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Pichla Birthday
    let lastBday = new Date(currentYear, m - 1, d);
    if (lastBday > today) lastBday.setFullYear(currentYear - 1);
    
    // Agla Birthday
    let nextBday = new Date(lastBday.getFullYear() + 1, m - 1, d);
    
    const totalYearDays = (nextBday - lastBday) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - lastBday) / (1000 * 60 * 60 * 24);
    
    const percentage = Math.floor((daysPassed / totalYearDays) * 100);
    const daysLeft = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
    
    // Bar Logic (10 blocks)
    const filled = Math.floor(percentage / 10);
    const empty = 10 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    
    return { percent: percentage, bar: bar, daysLeft: daysLeft };
}

// Main Calculator
function calculateSystemStats(d, m, y, userName) {
    if (!isValidDate(d, m, y)) return { error: "⚠️ <b>SYSTEM ERROR:</b> Invalid Date Sequence." };
    
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (birth > today) return { error: "⚠️ <b>SYSTEM ERROR:</b> Future Timeline Detected." };

    // Uptime Calculation
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    let ageDays = today.getDate() - birth.getDate();

    if (ageDays < 0) { ageMonths--; ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (ageMonths < 0) { ageYears--; ageMonths += 12; }

    // Biometrics Math
    const diffTime = Math.abs(today - birth);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));
    
    // Data Points
    const zodiac = getZodiacInfo(d, m);
    const progress = getLevelProgress(d, m);
    const milestone = getMilestone(totalDays);
    
    return {
        name: userName,
        uptime: `${ageYears}Y ${ageMonths.toString().padStart(2, '0')}M ${ageDays.toString().padStart(2, '0')}D`,
        level: ageYears,
        percent: progress.percent,
        bar: progress.bar,
        xpToNext: progress.daysLeft,
        heart: (totalMinutes * 72).toLocaleString(), // 72 bpm avg
        air: (totalMinutes * 15).toLocaleString(),  // 15 breaths avg
        recharge: Math.floor(totalDays / 3).toLocaleString(), // Sleep cycles
        zodiacCode: zodiac.name,
        zodiacSymbol: zodiac.symbol,
        mode: zodiac.element,
        core: zodiac.core,
        nextMilestone: milestone.nextTarget,
        milestoneDate: milestone.date
    };
}

// --- 4. MESSAGE HANDLER ---

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "⌬ <b>SYSTEM READY</b>\nInitialize by sending DOB: <code>DD-MM-YYYY</code>", { parse_mode: 'HTML' });
});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    
    const dateRegex = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
    const match = msg.text.match(dateRegex);

    if (match) {
        const d = parseInt(match[1]), m = parseInt(match[2]), y = parseInt(match[3]);
        // HTML characters escape karne ke liye name clean kiya
        const cleanName = msg.from.first_name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        const data = calculateSystemStats(d, m, y, cleanName);
        
        if (data.error) {
             bot.sendMessage(msg.chat.id, data.error, { parse_mode: 'HTML' });
             return;
        }

        // --- THE PRO SYSTEM IDENTITY DESIGN ---
        const response = `
⌬ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗬: 𝗩𝗘𝗥𝗜𝗙𝗜𝗘𝗗 ⌬
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>${data.name.toUpperCase()}</b>
🧬 <b>Species:</b> Human (Legend Class)
⏳ <b>Uptime:</b> <code>${data.uptime}</code>

╭── 🔋 𝗟𝗜𝗙𝗘 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦 ───╮
│ <b>LEVEL ${data.level}</b>    [${data.bar}] ${data.percent}% │
│ 🆙 <b>XP to Lvl ${data.level + 1}:</b> <code>${data.xpToNext} Days</code>  │
╰───────────────────────╯

⚡ 𝐁𝐈𝐎𝐌𝐄𝐓𝐑𝗜𝐂 𝐓𝐄𝐋𝐄𝐌𝐄𝐓𝐑𝐘
├ 💓 <b>Heart Engine:</b> <code>${data.heart}</code>
├ 🌬️ <b>Air Intake:</b>  <code>${data.air}</code>
└ 🔋 <b>Recharge:</b>    <code>${data.recharge} Cycles</code>

🔮 𝐀𝐒𝐓𝐑𝐀𝐋 𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄
▸ 🌌 <b>Code:</b> <code>${data.zodiacCode} [${data.zodiacSymbol}]</code>
▸ ⚔️ <b>Mode:</b> <code>${data.mode}</code>
▸ 💠 <b>Core:</b> <code>${data.core}</code>

🏆 𝐌𝐈𝐋𝐄𝐒𝐓𝐎𝐍𝐄 𝐓𝐑𝐀𝐂𝐊𝐄𝐑
[✅] System Initialized (Born)
[⏳] <b>${data.nextMilestone} Days:</b> <code>${data.milestoneDate}</code>

━━━━━━━━━━━━━━━━━━━━━━
🛠 <b>SYSTEM ARCHITECT</b>
👨‍💻 <b>Dev:</b> Rahul Kumar Singh
🆔 <b>Ref:</b> @Rksingh192
━━━━━━━━━━━━━━━━━━━━━━
🤖 <i>Analysis Complete. Legacy Loading...</i>
`;

        // Typing Action (Realistic feel)
        bot.sendChatAction(msg.chat.id, 'typing');
        setTimeout(() => {
            bot.sendMessage(msg.chat.id, response, { 
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: "📡 Share System ID", switch_inline_query: `Level ${data.level} Verified!` }]]
                }
            });
        }, 800);
    }
});
