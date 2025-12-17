const TelegramBot = require('node-telegram-bot-api');

// Aapka Token
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4';

// Bot ko start karte hain (polling mode me)
const bot = new TelegramBot(token, {polling: true});

// --- HELPER FUNCTIONS (Logic from your HTML) ---

function getZodiac(d, m) {
    const s = ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"];
    const c = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= c[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    return s[i];
}

function calculateDetails(day, month, year) {
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    
    // Future Date Check
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

    // Next Birthday Calculation
    let nextBday = new Date(today.getFullYear(), month - 1, day);
    if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = Math.abs(nextBday - today);
    const daysToBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Total Days Lived
    const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));

    return {
        years: ageYears,
        months: ageMonths,
        days: ageDays,
        zodiac: getZodiac(day, month),
        nextBday: daysToBirthday,
        bornDay: birth.toLocaleDateString('en-US', { weekday: 'long' }),
        totalDays: totalDays
    };
}

// --- BOT COMMANDS ---

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
        reply_markup: {
            keyboard: [
                [{ text: "🖥 Open Age Calculator App", web_app: { url: "https://your-website-url.com" } }] 
                // Upar "your-website-url.com" ki jagah apne HTML file ka live link dalein (Netlify/Vercel)
            ],
            resize_keyboard: true
        }
    };
    bot.sendMessage(chatId, "👋 Welcome! \n\nMujhe apni Date of Birth bhejein is format me:\n**DD-MM-YYYY** (Example: 15-08-2000)\n\nMain details calculate karke bataunga!", opts);
});

// Message Listener (Date calculate karne ke liye)
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore start command
    if (text === '/start') return;

    // Check Format DD-MM-YYYY or DD/MM/YYYY
    const dateRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    const match = text.match(dateRegex);

    if (match) {
        const d = parseInt(match[1]);
        const m = parseInt(match[2]);
        const y = parseInt(match[3]);

        // Validation
        if (d > 31 || m > 12) {
            bot.sendMessage(chatId, "❌ Invalid Date or Month. Please check.");
            return;
        }

        const result = calculateDetails(d, m, y);

        if (!result) {
            bot.sendMessage(chatId, "❌ Future date not allowed! Aap abhi paida nahi hue hain.");
        } else {
            const response = `
🎉 **Age Calculation Result** 🎉

📅 **Born:** ${d}-${m}-${y} (${result.bornDay})

🎂 **Your Age:**
👉 ${result.years} Years
👉 ${result.months} Months
👉 ${result.days} Days

🔮 **Zodiac:** ${result.zodiac}
⏳ **Next Birthday:** in ${result.nextBday} days
🌍 **Total Days on Earth:** ${result.totalDays.toLocaleString()}

Developed by Rahul Kumar Singh
            `;
            bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        }
    } else {
        bot.sendMessage(chatId, "⚠️ Please send date in **DD-MM-YYYY** format.\nExample: 25-12-1998");
    }
});

console.log("Bot is running...");