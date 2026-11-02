import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import Groq from 'groq-sdk'
import { system } from './system.js';
import { timeTool, getCurrentTime } from './tools/time.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const messageHistory = [{ role: 'system', content: system }]

const tools = [
    {type: 'browser_search'},
    { type: 'mcp', server_label: 'Huggingface', server_url: 'https://huggingface.co/mcp' },
    timeTool
]

async function askGroq(userText) {
    messageHistory.push({ role: "user", content: userText });

    for (let i = 0; i < 5; i++) {
        const res = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            tools,
            messages: messageHistory
        })

        const message = res.choices[0].message;
        messageHistory.push({
            role: 'assistant',
            content: message.content || '',
            ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
        });

        // model does not ask for tool
        if (!message.tool_calls?.length) return message.content || 'Done.';

        // if the model asks for a tool, run the tool
        for (const tool of message.tool_calls) {
            console.log('Tool used:', tool.function.name);

            let result;

            if (tool.function.name === 'get_current_time') {
                result = getCurrentTime();
            }

            messageHistory.push({ role: 'tool', tool_call_id: tool.id, content: JSON.stringify(result) });
        }
    }

    return 'sorry, try again'
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