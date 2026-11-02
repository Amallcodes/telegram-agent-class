import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import Groq from 'groq-sdk'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

bot.on('message', async (textMsg) => {
    const chatId = textMsg.chat.id;
    const userText = textMsg.text;
  
    if (!userText || userText.startsWith('/')) return;
  
    try {
      bot.sendMessage(chatId, `You said: ${userText}`);
    } catch (error) {
      console.error('Error:', error);
      bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
    }
  });

  console.log("bot is running...")