const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- SERVER SETUP (Render ke liye zaroori hai) ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is Alive!'));

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// --- BOT SETUP ---
// Token verify kar lena
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// --- CRASH ROKNE WALA CODE (Polling Error Fix) ---
bot.on("polling_error", (err) => console.log("Polling Error:", err.code));

// --- LOGIC ---
function isValidDate(d, m, y) {
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function getZodiac(d, m) {
    const signs = ["♑ Capricorn", "♒ Aquarius", "♓ Pisces", "♈ Aries", "♉ Taurus", "♊ Gemini", "♋ Cancer", "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Scorpio", "♐ Sagittarius"];
    const cutoff = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= cutoff[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    return signs[i];
}

function calculateGodMode(d, m, y) {
    if (!isValidDate(d, m, y)) return { error: "❌ Invalid Date." };
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (birth > today) return { error: "🔮 Future date not allowed!" };

    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    let ageDays = today.getDate() - birth.getDate();
    
    if (ageDays < 0) { ageMonths--; ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (ageMonths < 0) { ageYears--; ageMonths += 12; }

    const diffTime = Math.abs(today - birth);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Milestones
    const nextBig = Math.ceil((totalDays + 1) / 1000) * 1000;
    const milestoneDate = new Date();
    milestoneDate.setDate(milestoneDate.getDate() + (nextBig - totalDays));

    // Next Bday
    let nextBday = new Date(today.getFullYear(), m - 1, d);
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToBday = Math.ceil(Math.abs(nextBday - today) / (1000 * 60 * 60 * 24));

    return {
        dob: `${d}-${m}-${y}`,
        age: `${ageYears}y ${ageMonths}m ${ageDays}d`,
        totalDays: totalDays.toLocaleString(),
        zodiac: getZodiac(d, m),
        nextBday: daysToBday,
        milestoneDays: nextBig.toLocaleString(),
        milestoneDate: milestoneDate.toLocaleDateString('en-GB')
    };
}

// --- COMMANDS ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "💎 **GOD MODE ACTIVATED**\nApni DOB bhejo (e.g., `15-08-2000`)", { parse_mode: 'Markdown' });
});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    const match = msg.text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (match) {
        const data = calculateGodMode(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        if (data.error) { bot.sendMessage(msg.chat.id, data.error); return; }

        const response = `
╭━━━━━━━━━━━━━━━━━━━╮
      🧬 **LIFE PROFILE** 
╰━━━━━━━━━━━━━━━━━━━╯
📅 **Born:** ${data.dob}
🎂 **Age:** ${data.age}
🔮 **Zodiac:** ${data.zodiac}

🏆 **Next Milestone:**
${data.milestoneDays}th Day on: ${data.milestoneDate}
🎉 **B'day In:** ${data.nextBday} Days

_Designed for Legends 👑_
👨‍💻 **Developer by Rahul Kumar Singh**
`;
        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    }
});
