import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import Groq from 'groq-sdk'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askGroq(userText) {
    const res = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: "user", content: userText }]
    })

    console.log(res);
    const message = res.choices[0].message.content;
    console.log(message);
    return message;
}

bot.on('message', async (textMsg) => {
    const chatId = textMsg.chat.id;
    const userText = textMsg.text;

    if (!userText || userText.startsWith('/')) return;

    try {
        const groqResponse = await askGroq(userText);
        bot.sendMessage(chatId, groqResponse);
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
    }
});

console.log("bot is running...")