const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- 1. SERVER SETUP (24/7 ONLINE) ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('<h1>CORE SYSTEM ONLINE 🟢</h1>'));

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${port}`);
});

// --- 2. ANTI-CRASH SYSTEM ---
process.on('uncaughtException', (err) => console.log('❌ Error Ignored:', err.message));
process.on('unhandledRejection', (reason, promise) => console.log('❌ Promise Fail Ignored'));

// --- 3. BOT CONFIGURATION ---
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// Webhook Fix
bot.deleteWebHook().then(() => console.log("🔄 Webhook cleared, Polling active."));

// --- 4. CALCULATION LOGIC ---

function getZodiacData(d, m) {
    const signs = [
        { name: "CAPRICORN", element: "EARTH", stone: "GARNET" },
        { name: "AQUARIUS", element: "AIR", stone: "AMETHYST" },
        { name: "PISCES", element: "WATER", stone: "AQUAMARINE" },
        { name: "ARIES", element: "FIRE", stone: "DIAMOND" },
        { name: "TAURUS", element: "EARTH", stone: "EMERALD" },
        { name: "GEMINI", element: "AIR", stone: "PEARL" },
        { name: "CANCER", element: "WATER", stone: "RUBY" },
        { name: "LEO", element: "FIRE", stone: "PERIDOT" },
        { name: "VIRGO", element: "EARTH", stone: "SAPPHIRE" },
        { name: "LIBRA", element: "AIR", stone: "OPAL" },
        { name: "SCORPIO", element: "WATER", stone: "TOPAZ" },
        { name: "SAGITTARIUS", element: "FIRE", stone: "TURQUOISE" }
    ];
    
    const cutoff = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= cutoff[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    
    return signs[i];
}

function calculateCoreStats(d, m, y, userName) {
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    
    if (birth > today || isNaN(birth.getTime())) return { error: "⚠️ <b>SYSTEM ALERT:</b> Invalid Timeline Detected." };

    // Exact Age
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    let ageDays = today.getDate() - birth.getDate();
    if (ageDays < 0) { ageMonths--; ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (ageMonths < 0) { ageYears--; ageMonths += 12; }

    // Stats
    const diffTime = Math.abs(today - birth);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));

    // Next Birthday
    let nextBday = new Date(today.getFullYear(), m - 1, d);
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToUpgrade = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));

    // Progress Bar
    let lastBday = new Date(today.getFullYear(), m - 1, d);
    if (lastBday > today) lastBday.setFullYear(today.getFullYear() - 1);
    const totalYearDays = (nextBday - lastBday) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - lastBday) / (1000 * 60 * 60 * 24);
    const percent = Math.floor((daysPassed / totalYearDays) * 100);
    const filled = Math.floor(percent / 10);
    const progressBar = "█".repeat(filled) + "░".repeat(10 - filled);

    // Milestone
    const nextMilestone = Math.ceil((totalDays + 1) / 1000) * 1000;
    const milestoneDate = new Date();
    milestoneDate.setDate(today.getDate() + (nextMilestone - totalDays));

    const cosmic = getZodiacData(d, m);
    const dayName = birth.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    return {
        name: userName.replace(/</g, "&lt;").toUpperCase(),
        dob: `${d}-${m}-${y}`,
        day: dayName,
        uptime: `${ageYears}Y • ${ageMonths.toString().padStart(2, '0')}M • ${ageDays.toString().padStart(2, '0')}D`,
        level: ageYears,
        percent: percent,
        bar: progressBar,
        nextUpgrade: daysToUpgrade,
        heart: (totalMinutes * 72).toLocaleString(),
        oxygen: (totalMinutes * 15).toLocaleString(),
        energy: Math.floor(totalDays / 3).toLocaleString(),
        starClass: cosmic.name,
        element: cosmic.element,
        crystal: cosmic.stone,
        milestoneTarget: nextMilestone.toLocaleString(),
        milestoneDate: milestoneDate.toLocaleDateString('en-GB').replace(/\//g, '•')
    };
}

// --- 5. MESSAGE HANDLER ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "⌬ <b>CORE SYSTEM INITIALIZED</b>\nEnter Identity Code (DOB): <code>DD-MM-YYYY</code>", { parse_mode: 'HTML' });
});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    
    try {
        const match = msg.text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
        if (match) {
            const d = parseInt(match[1]);
            const m = parseInt(match[2]);
            const y = parseInt(match[3]);
            
            const data = calculateCoreStats(d, m, y, msg.from.first_name);
            
            if (data.error) {
                bot.sendMessage(msg.chat.id, data.error, { parse_mode: 'HTML' });
                return;
            }

            // --- YAHAN DEKHO: DOB AUR AGE KO BOLD KIYA HAI ---
            const response = `
⌬⟦ 𝗖𝗢𝗥𝗘 𝗦𝗬𝗦𝗧𝗘𝗠 :: 𝗔𝗕𝗦𝗢𝗟𝗨𝗧𝗘 𝗩𝗘𝗥𝗜𝗙𝗜𝗘𝗗 ⟧⌬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 <b>IDENTITY NAME</b>     : ${data.name}
📅 <b>ORIGIN DATE</b>       : <b>${data.dob} (${data.day})</b>
🕒 <b>EXISTENCE TIME</b>   : <b>${data.uptime}</b>
🧬 <b>ENTITY FORM</b>       : HUMAN ⟮ MYTHIC LEGEND ⟯
🔐 <b>CLEARANCE LEVEL</b>  : OMEGA ∞
📡 <b>NETWORK STATUS</b>   : SECURE & LIVE

╔═══ ⚡ 𝗟𝗜𝗙𝗘 𝗘𝗩𝗢𝗟𝗨𝗧𝗜𝗢𝗡 𝗠𝗔𝗧𝗥𝗜𝗫 ═══╗
║ <b>CURRENT LEVEL</b>  : ${data.level}            ║
║ <b>PROGRESS BAR</b>   : ${data.bar} ${data.percent}%║
║ <b>NEXT UPGRADE</b>   : +${data.nextUpgrade} DAYS     ║
║ <b>EVOLUTION MODE</b> : ASCENDING ⬆️  ║
╚═══════════════════════════════╝

🧠 𝗕𝗜𝗢𝗠𝗘𝗧𝗥𝗜𝗖 + 𝗖𝗢𝗥𝗘 𝗧𝗘𝗟𝗘𝗠𝗘𝗧𝗥𝗬
├ ❤️ <b>HEART ENGINE</b>     : <code>${data.heart} BPM</code>
├ 🌬 <b>OXYGEN STREAM</b>    : <code>${data.oxygen} UNITS</code>
├ 🔋 <b>ENERGY CYCLES</b>    : <code>${data.energy}</code>
├ 🧠 <b>NEURAL SYNC</b>      : 99.9%
└ ⚙️ <b>SYSTEM HEALTH</b>   : PEAK OPTIMIZED

🌌 𝗖𝗢𝗦𝗠𝗜𝗖 / 𝗔𝗦𝗧𝗥𝗔𝗟 𝗣𝗥𝗢𝗙𝗜𝗟𝗘
├ ♈ <b>STAR CLASS</b>        : ${data.starClass}
├ 🔥 <b>ELEMENTAL MODE</b>   : ${data.element} DOMINANT
├ 💎 <b>CORE CRYSTAL</b>     : ${data.crystal}
├ 🧿 <b>AURA FREQUENCY</b>   : HIGH-VIBRATION
└ 🌠 <b>DESTINY PATH</b>    : UNLOCKED

🏆 𝗟𝗘𝗚𝗔𝗖𝗬 & 𝗠𝗜𝗟𝗘𝗦𝗧𝗢𝗡𝗘 𝗟𝗢𝗚
├ ✅ <b>BIRTH EVENT</b>            : CONFIRMED
├ ✅ <b>SYSTEM BOOT</b>            : SUCCESSFUL
├ ⏳ <b>${data.milestoneTarget} DAYS CHECKPOINT</b>  : ${data.milestoneDate}
└ 🚀 <b>LEGACY MODE</b>            : INITIALIZING…

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠 <b>CREATOR / SYSTEM ARCHITECT</b>
👨‍💻 <b>NAME</b>        : Rahul Kumar Singh
🆔 <b>DIGITAL REF</b>  : @Rksingh192
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 <b>BOT CORE STATUS</b>
⚡ ONLINE 24×7
🧠 AI-ASSISTED
🛡️ ANTI-FAIL SAFE ENABLED
🚀 BUILT FOR ELITE DIGITAL MINDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⌬⟦ 𝗘𝗡𝗗 𝗢𝗙 𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗦𝗜𝗢𝗡 ⟧⌬
`;

            bot.sendChatAction(msg.chat.id, 'typing');
            setTimeout(() => {
                bot.sendMessage(msg.chat.id, response, { 
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[{ text: "📡 TRANSMIT DATA (SHARE)", switch_inline_query: `System Verified: ${data.uptime}` }]]
                    }
                });
            }, 800);
        }
    } catch (e) {
        console.log("Error handling message:", e);
    }
});
