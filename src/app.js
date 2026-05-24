require('dotenv').config();
const TelegramBot = require("node-telegram-bot-api");
const { validarCPF } = require("./botservice");

// ── Configuração ──────────────────────────────
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// ── Estado dos usuários ───────────────────────
const estadoUsuario = {};

// ── Helpers de mensagem ───────────────────────
const mensagemValido = (resultado) => {
  return (
    `✅ *CPF válido!*\n\n` +
    `📄 *Formatado:* \`${resultado.formatado}\`\n` +
    `🔢 *Dígitos verificadores:* \`${resultado.digitos[0]}\` e \`${resultado.digitos[1]}\``
  );
};

const mensagemInvalido = (resultado) => {
  return (
    `❌ *CPF inválido!*\n\n` +
    `⚠️ *Motivo:* ${resultado.motivo}`
  );
};

// ── Comandos ──────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const nome = msg.from.first_name || "usuário";
  bot.sendMessage(
    msg.chat.id,
    `Olá, *${nome}*! 👋\n\n` +
    `Eu valido CPFs usando o *Algoritmo Módulo 11* da Receita Federal.\n\n` +
    `Digite */validar* para começar, ou envie um CPF diretamente.` +
    `Ou envie diretamente o CPF em qualquer formato: \n` +
    `  \`111.111.111-00\`\n` +
    `  \`11111111100\`\n\n` +
    `*Comandos disponíveis:*\n` +
    `/start — boas-vindas\n` +
    `/validar — iniciar validação\n` +
    `/ajuda — mensagem de ajuda`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/ajuda/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `*Como usar:*\n\n` +
    `• Digite */validar* e envie o CPF quando solicitado\n` +
    `• Ou envie o CPF diretamente, em qualquer formato:\n` +
    `  \`111.111.111-00\`\n` +
    `  \`11111111100\`\n\n` +
    `*Comandos disponíveis:*\n` +
    `/start — boas-vindas\n` +
    `/validar — iniciar validação\n` +
    `/ajuda — esta mensagem`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/validar/, (msg) => {
  const chatId = msg.chat.id;
  estadoUsuario[chatId] = "aguardando_cpf";
  bot.sendMessage(
    chatId,
    `🔍 *Validar CPF*\n\nPor favor, digite o CPF que deseja verificar:`,
    { parse_mode: "Markdown" }
  );
});

// ── Mensagens de texto livres ─────────────────
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const texto  = msg.text || "";

  if (texto.startsWith("/")) return;

  const pareceCPF = /^[\d.\-\s]{11,14}$/.test(texto.trim());

  if (estadoUsuario[chatId] === "aguardando_cpf" || pareceCPF) {
    estadoUsuario[chatId] = null;

    const resultado = validarCPF(texto.trim());
    const resposta = resultado.valido
      ? mensagemValido(resultado)
      : mensagemInvalido(resultado);

    bot.sendMessage(chatId, resposta, { parse_mode: "Markdown" });
    return;
  }

  bot.sendMessage(
    chatId,
    `Não entendi 🤔\n\nEnvie um CPF para validar ou use */ajuda* para ver os comandos.`,
    { parse_mode: "Markdown" }
  );
});

// ── Erros de polling ──────────────────────────
bot.on("polling_error", (err) => {
  console.error("Erro de polling:", err.message);
});

console.log("🤖 Bot iniciado! Aguardando mensagens...");