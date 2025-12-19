const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- 1. SERVER SETUP (Render ko zinda rakhne ke liye) ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('<h1>🤖 SYSTEM IDENTITY BOT IS ONLINE</h1>'));

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${port}`);
});

// --- 2. ANTI-CRASH SYSTEM (Bot kabhi band nahi hoga) ---
process.on('uncaughtException', (err) => console.log('❌ Error Ignored:', err.message));
process.on('unhandledRejection', (reason, promise) => console.log('❌ Promise Fail Ignored'));

// --- 3. BOT CONFIGURATION ---
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// Purana Webhook delete karo taaki conflict na ho
bot.deleteWebHook().then(() => console.log("🔄 Webhook cleared, Polling started."));

// --- 4. CALCULATION LOGIC ---

function getZodiacData(d, m) {
    const signs = [
        { name: "CAPRICORN", symbol: "♑", element: "EARTH [🌍]" },
        { name: "AQUARIUS", symbol: "♒", element: "AIR [💨]" },
        { name: "PISCES", symbol: "♓", element: "WATER [💧]" },
        { name: "ARIES", symbol: "♈", element: "FIRE [🔥]" },
        { name: "TAURUS", symbol: "♉", element: "EARTH [🌍]" },
        { name: "GEMINI", symbol: "♊", element: "AIR [💨]" },
        { name: "CANCER", symbol: "♋", element: "WATER [💧]" },
        { name: "LEO", symbol: "♌", element: "FIRE [🔥]" },
        { name: "VIRGO", symbol: "♍", element: "EARTH [🌍]" },
        { name: "LIBRA", symbol: "♎", element: "AIR [💨]" },
        { name: "SCORPIO", symbol: "♏", element: "WATER [💧]" },
        { name: "SAGITTARIUS", symbol: "♐", element: "FIRE [🔥]" }
    ];
    // Month-wise Birthstones
    const stones = ["Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl", "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise"];
    
    const cutoff = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= cutoff[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    
    return { ...signs[i], stone: stones[m-1] };
}

function getLevelProgress(today, birth, nextBday) {
    // Last Birthday
    let lastBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (lastBday > today) lastBday.setFullYear(today.getFullYear() - 1);

    const totalYearDays = (nextBday - lastBday) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - lastBday) / (1000 * 60 * 60 * 24);
    const percent = Math.floor((daysPassed / totalYearDays) * 100);
    
    // Bar Design
    const filled = Math.floor(percent / 10);
    const bar = "█".repeat(filled) + "░".repeat(10 - filled);
    
    return { percent, bar };
}

function calculateSystem(d, m, y, userName) {
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (birth > today || isNaN(birth.getTime())) return { error: "❌ <b>SYSTEM ERROR:</b> Invalid Date." };

    // Uptime (Exact Age)
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    let ageDays = today.getDate() - birth.getDate();
    if (ageDays < 0) { ageMonths--; ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (ageMonths < 0) { ageYears--; ageMonths += 12; }

    // Total Stats
    const diffTime = Math.abs(today - birth);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));

    // Next Birthday (XP to Level Up)
    let nextBday = new Date(today.getFullYear(), m - 1, d);
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToLevelUp = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));

    // Progress Bar
    const progress = getLevelProgress(today, birth, nextBday);

    // Milestone (Next 1000th Day)
    const nextMilestone = Math.ceil((totalDays + 1) / 1000) * 1000;
    const milestoneDate = new Date();
    milestoneDate.setDate(today.getDate() + (nextMilestone - totalDays));

    const cosmic = getZodiacData(d, m);

    return {
        name: userName.replace(/</g, "&lt;"), // Security fix
        uptime: `${ageYears}Y ${ageMonths.toString().padStart(2, '0')}M ${ageDays.toString().padStart(2, '0')}D`,
        level: ageYears,
        bar: progress.bar,
        percent: progress.percent,
        xpLeft: daysToLevelUp,
        heart: (totalMinutes * 72).toLocaleString(),
        air: (totalMinutes * 15).toLocaleString(),
        recharge: Math.floor(totalDays / 3).toLocaleString(),
        zodiacCode: cosmic.name,
        zodiacSym: cosmic.symbol,
        mode: cosmic.element,
        core: cosmic.stone,
        milestoneTarget: nextMilestone.toLocaleString(),
        milestoneDate: milestoneDate.toLocaleDateString('en-GB')
    };
}

// --- 5. MESSAGE HANDLER ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "⌬ <b>SYSTEM READY</b>\nInitialize by sending DOB: <code>DD-MM-YYYY</code>", { parse_mode: 'HTML' });
});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    
    try {
        const match = msg.text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
        if (match) {
            const d = parseInt(match[1]);
            const m = parseInt(match[2]);
            const y = parseInt(match[3]);
            
            const data = calculateSystem(d, m, y, msg.from.first_name);
            
            if (data.error) {
                bot.sendMessage(msg.chat.id, data.error, { parse_mode: 'HTML' });
                return;
            }

            const response = `
⌬ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗬: 𝗩𝗘𝗥𝗜𝗙𝗜𝗘𝗗 ⌬
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>${data.name.toUpperCase()}</b>
🧬 <b>Species:</b> Human (Legend Class)
⏳ <b>Uptime:</b> <code>${data.uptime}</code>

╭── 🔋 𝗟𝗜𝗙𝗘 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦 ───╮
│ <b>LEVEL ${data.level}</b>    [${data.bar}] ${data.percent}% │
│ 🆙 <b>XP to Lvl ${data.level + 1}:</b> <code>${data.xpLeft} Days</code>  │
╰───────────────────────╯

⚡ 𝐁𝐈𝐎𝐌𝐄𝐓𝐑𝗜𝐂 𝐓𝐄𝐋𝐄𝐌𝐄𝐓𝐑𝐘
├ 💓 <b>Heart Engine:</b> <code>${data.heart}</code>
├ 🌬️ <b>Air Intake:</b>  <code>${data.air}</code>
└ 🔋 <b>Recharge:</b>    <code>${data.recharge} Cycles</code>

🔮 𝐀𝐒𝐓𝐑𝐀𝐋 𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄
▸ 🌌 <b>Code:</b> <code>${data.zodiacCode} [${data.zodiacSym}]</code>
▸ ⚔️ <b>Mode:</b> <code>${data.mode}</code>
▸ 💠 <b>Core:</b> <code>${data.core}</code>

🏆 𝐌𝐈𝐋𝐄𝐒𝐓𝐎𝐍𝐄 𝐓𝐑𝐀𝐂𝐊𝐄𝐑
[✅] Born
[✅] System Initialized
[⏳] <b>${data.milestoneTarget} Days:</b> <code>${data.milestoneDate}</code>

━━━━━━━━━━━━━━━━━━━━━━
🛠 <b>SYSTEM ARCHITECT</b>
👨‍💻 <b>Dev:</b> Rahul Kumar Singh
🆔 <b>Ref:</b> @Rksingh192
━━━━━━━━━━━━━━━━━━━━━━
🤖 <i>Analysis Complete. Legacy Loading...</i>`;

            bot.sendChatAction(msg.chat.id, 'typing');
            setTimeout(() => {
                bot.sendMessage(msg.chat.id, response, { 
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[{ text: "📡 Share System ID", switch_inline_query: `Level ${data.level} Verified!` }]]
                    }
                });
            }, 500);
        }
    } catch (e) {
        console.log("Error handling message:", e);
    }
});
