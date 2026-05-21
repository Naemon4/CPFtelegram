require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const validarCPF = require('./validarCPF');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '👋 Olá! Me envie um CPF para validar.\nPode ser com ou sem formatação.\nEx: 123.456.789-09'
  );
});

//bot.on('message', (msg) => {

//  } coloque o conteúdo aqui dentro pra o bot funcionar
//});

console.log('Bot rodando...');