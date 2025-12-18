const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- 1. SERVER SETUP (SABSE PEHLE START HOGA) ---
const app = express();
const port = process.env.PORT || 10000; // Render default port

app.get('/', (req, res) => {
  res.send('Digital Age Bot is ACTIVE and RUNNING! 🟢');
});

// Ye zaroori line hai Timed Out se bachne ke liye
app.listen(port, '0.0.0.0', () => {
  console.log(`Web Server started on port ${port}`);
});

// --- 2. TELEGRAM BOT LOGIC ---
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// Zodiac Logic
function getZodiac(d, m) {
    const s = ["♑ Capricorn", "♒ Aquarius", "♓ Pisces", "♈ Aries", "♉ Taurus", "♊ Gemini", "♋ Cancer", "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Scorpio", "♐ Sagittarius"];
    const c = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= c[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    return s[i];
}

function calculateDetails(day, month, year) {
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    if (birth > today) return null;

    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    let ageDays = today.getDate() - birth.getDate();

    if (ageDays < 0) {
        ageMonths--;
        ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
    }

    let nextBday = new Date(today.getFullYear(), month - 1, day);
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    
    const diffTime = Math.abs(nextBday - today);
    const daysToBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));

    return { 
        years: ageYears, 
        months: ageMonths, 
        days: ageDays, 
        zodiac: getZodiac(day, month), 
        nextBday: daysToBirthday, 
        bornDay: birth.toLocaleDateString('en-US', { weekday: 'long' }), 
        totalDays: totalDays.toLocaleString() 
    };
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "👋 **Digital Age Calculator** is Online!\n\nDate of Birth bhejein (Example: `15-08-2000`)", { parse_mode: 'Markdown' });
});

bot.on('message', async (msg) => {
    if (msg.text === '/start') return;
    const dateRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    const match = msg.text.match(dateRegex);

    if (match) {
        const d = parseInt(match[1]), m = parseInt(match[2]), y = parseInt(match[3]);
        const res = calculateDetails(d, m, y);
        if (!res) {
             bot.sendMessage(msg.chat.id, "❌ Future date not allowed.");
             return;
        }

        const response = `
*═════════════════════════*
 🚀 *Digital Age Calculator*
*═════════════════════════*
📅 *Born:* ${d}-${m}-${y}
🗓 *Day:* ${res.bornDay}

📊 *Your Age:*
➤ ${res.years} Years
➤ ${res.months} Months
➤ ${res.days} Days

💡 *Insights:*
💎 Zodiac: ${res.zodiac}
🎉 Next B'day: In ${res.nextBday} days
🌍 Total Days: ${res.totalDays}
*═════════════════════════*`;
        
        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    }
});
