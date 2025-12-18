const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// --- 1. SERVER SETUP (24/7 ONLINE RAKHNE KE LIYE) ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('<h1>🚀 Digital Age Bot Ultra is ACTIVE!</h1>');
});

// Ye line Render/Replit pe bot ko sone nahi degi
app.listen(port, '0.0.0.0', () => {
  console.log(`🤖 Server started on port ${port}`);
});

// --- 2. TELEGRAM BOT CONFIG ---
// Tumhara Token Yahan Add Kar Diya Hai 👇
const token = '8507736406:AAEatnjG-ChvUO2uqRP9MBgcfyvV3W324O4'; 
const bot = new TelegramBot(token, {polling: true});

// --- 3. HELPER FUNCTIONS (LOGIC BRAIN) ---

// Validate Date (30 Feb jaisi dates pakadne ke liye)
function isValidDate(d, m, y) {
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// Western Zodiac (Sign + Emoji)
function getZodiac(d, m) {
    const signs = [
        { name: "Capricorn (Makar)", symbol: "♑" }, { name: "Aquarius (Kumbh)", symbol: "♒" },
        { name: "Pisces (Meen)", symbol: "♓" }, { name: "Aries (Mesh)", symbol: "♈" },
        { name: "Taurus (Vrishabh)", symbol: "♉" }, { name: "Gemini (Mithun)", symbol: "♊" },
        { name: "Cancer (Kark)", symbol: "♋" }, { name: "Leo (Simha)", symbol: "♌" },
        { name: "Virgo (Kanya)", symbol: "♍" }, { name: "Libra (Tula)", symbol: "♎" },
        { name: "Scorpio (Vrishchik)", symbol: "♏" }, { name: "Sagittarius (Dhanu)", symbol: "♐" }
    ];
    const cutoff = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
    let i = (d >= cutoff[m - 1]) ? m : m - 1;
    if (i === 12) i = 0;
    return `${signs[i].symbol} ${signs[i].name}`;
}

// Chinese Zodiac
function getChineseZodiac(year) {
    const animals = ['🐵 Monkey', '🐔 Rooster', '🐶 Dog', '🐷 Pig', '🐭 Rat', '🐮 Ox', '🐯 Tiger', '🐰 Rabbit', '🐲 Dragon', '🐍 Snake', '🐴 Horse', '🐐 Goat'];
    return animals[year % 12];
}

// Generation Identifier
function getGeneration(year) {
    if (year >= 2013) return "Generation Alpha 📱";
    if (year >= 1997) return "Gen Z (Zoomer) 🚀";
    if (year >= 1981) return "Millennial (Gen Y) 💻";
    if (year >= 1965) return "Gen X 📼";
    return "Boomer / Legend 📻";
}

// Life Path Number (Numerology)
function getLifePathNumber(d, m, y) {
    const sumDigits = (n) => n.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    let num = sumDigits(d) + sumDigits(m) + sumDigits(y);
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = sumDigits(num);
    }
    return num;
}

// Progress Bar Logic
function getProgressBar(current, total) {
    const percentage = Math.round((current / total) * 10);
    // Reverse logic: kam din bache hain to bar full hona chahiye, ya decreasing dikhana hai
    // Yahan hum "Days Left" dikha rahe hain, to bar khali hota jayega
    const bar = "▓".repeat(10 - percentage) + "░".repeat(percentage); 
    return `[${bar}]`;
}

// Main Calculation Logic
function calculateDetails(day, month, year) {
    if (!isValidDate(day, month, year)) return { error: "Invalid Date! (Check Leap Year or 30/31 days)" };
    
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    if (birth > today) return { error: "Future date not allowed! Time traveler? 🕰️" };

    // Standard Age
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

    // Time Calculations
    const diffTime = Math.abs(today - birth);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    const totalWeeks = Math.floor(totalDays / 7);

    // Next Birthday Logic
    let nextBday = new Date(today.getFullYear(), month - 1, day);
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    
    const diffNextBday = Math.abs(nextBday - today);
    const daysToBirthday = Math.ceil(diffNextBday / (1000 * 60 * 60 * 24));
    
    // Progress Bar (365 days base)
    const bdayProgress = getProgressBar(daysToBirthday, 365);

    return { 
        years: ageYears, months: ageMonths, days: ageDays,
        totalWeeks: totalWeeks.toLocaleString(),
        totalDays: totalDays.toLocaleString(),
        totalHours: totalHours.toLocaleString(),
        zodiac: getZodiac(day, month),
        chinese: getChineseZodiac(year),
        generation: getGeneration(year),
        lifePath: getLifePathNumber(day, month, year),
        nextBday: daysToBirthday,
        bdayProgress: bdayProgress,
        bornDay: birth.toLocaleDateString('en-US', { weekday: 'long' })
    };
}

// --- 4. BOT EVENT HANDLERS ---

bot.onText(/\/start/, (msg) => {
    const opts = {
        parse_mode: 'Markdown',
    };
    bot.sendMessage(msg.chat.id, 
        `👋 *Welcome, ${msg.from.first_name}!* \n\n` +
        `Main hoon **Digital Age Pro Bot** 🤖\n` +
        `Apni **Date of Birth** bhejein aur magic dekhein.\n\n` +
        `📝 *Format:* DD-MM-YYYY (Example: \`15-08-2000\`)`, 
        opts
    );
});

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return; // Ignore commands
    
    // Flexible Date Regex (Supports -, /, .)
    const dateRegex = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
    const match = msg.text.match(dateRegex);

    if (match) {
        const d = parseInt(match[1]), m = parseInt(match[2]), y = parseInt(match[3]);
        const res = calculateDetails(d, m, y);
        
        if (res.error) {
             bot.sendMessage(msg.chat.id, `⚠️ *Error:* ${res.error}`, { parse_mode: 'Markdown' });
             return;
        }

        const response = `
*════════════ 👑 PRO STATS 👑 ════════════*
📅 *DOB:* ${d}-${m}-${y} | 🗓 *Day:* ${res.bornDay}

👤 *AGE DETAILS*
🔹 **${res.years}** Years, **${res.months}** Months, **${res.days}** Days
🔹 **${res.totalWeeks}** Total Weeks
🔹 **${res.totalDays}** Days Lived
🔹 **${res.totalHours}** Hours Survived

🔮 *COSMIC PROFILE*
✨ *Zodiac:* ${res.zodiac}
🐲 *Chinese:* ${res.chinese}
🧬 *Generation:* ${res.generation}
🔢 *Life Path No:* ${res.lifePath}

🎂 *BIRTHDAY COUNTDOWN*
⏳ *${res.nextBday}* Days Left
${res.bdayProgress}

*═════════════════════════════════════*
        `;
        
        const opts = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔄 Calculate Again", callback_data: "recalc" },
                        { text: "📤 Share", switch_inline_query: `My Age: ${res.years} Years!` }
                    ]
                ]
            }
        };

        // Typing effect for realism
        bot.sendChatAction(msg.chat.id, 'typing');
        setTimeout(() => {
            bot.sendMessage(msg.chat.id, response, opts);
        }, 800);
    }
});

// Handle Button Clicks
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    if (callbackQuery.data === 'recalc') {
        bot.sendMessage(msg.chat.id, "Dobara date bhejein! 📅");
    }
    bot.answerCallbackQuery(callbackQuery.id);
});
