require('dotenv').config();
const TelegramBot = require("node-telegram-bot-api")
//const ValidarCpf = require("/.BotService") adicionar linha dps que for feito o service// 
// bot.js — Bot do Telegram: Validador de CPF
// ─────────────────────────────────────────────

const TelegramBot = require("node-telegram-bot-api");
const { validarCPF } = require("./BotService");

// ── Configuração ──────────────────────────────
// Substitua pelo token que o @BotFather te enviou
const TOKEN = "796825520:AAGrxPv1WAPMOhEcjiTK1onJidfJrSOP4ns";

// polling: o bot fica perguntando ao Telegram se chegou mensagem nova
const bot = new TelegramBot(TOKEN, { polling: true });

// ── Estado dos usuários ───────────────────────
// Guarda em qual "etapa" cada usuário está
// Chave: chat.id  |  Valor: 'aguardando_cpf' ou null
const estadoUsuario = {};

// ── Helpers de mensagem ───────────────────────

/**
 * Monta a resposta de sucesso quando o CPF é válido
 */
const mensagemValido = (resultado) => {
  return (
    `✅ *CPF válido!*\n\n` +
    `📄 *Formatado:* \`${resultado.formatado}\`\n` +
    `🔢 *Dígitos verificadores:* \`${resultado.digitos[0]}\` e \`${resultado.digitos[1]}\``
  );
};

/**
 * Monta a resposta de erro quando o CPF é inválido
 */
const mensagemInvalido = (resultado) => {
  return (
    `❌ *CPF inválido!*\n\n` +
    `⚠️ *Motivo:* ${resultado.motivo}`
  );
};

// ── Comandos ──────────────────────────────────

// /start — boas-vindas
bot.onText(/\/start/, (msg) => {
  const nome = msg.from.first_name || "usuário";

  bot.sendMessage(
    msg.chat.id,
    `Olá, *${nome}*! 👋\n\n` +
    `Eu valido CPFs usando o *Algoritmo Módulo 11* da Receita Federal.\n\n` +
    `Digite */validar* para começar, ou envie um CPF diretamente.`,
    { parse_mode: "Markdown" }
  );
});

// /ajuda — instruções de uso
bot.onText(/\/ajuda/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `*Como usar:*\n\n` +
    `• Digite */validar* e envie o CPF quando solicitado\n` +
    `• Ou envie o CPF diretamente, em qualquer formato:\n` +
    `  \`529.982.247-25\`\n` +
    `  \`52998224725\`\n\n` +
    `*Comandos disponíveis:*\n` +
    `/start — boas-vindas\n` +
    `/validar — iniciar validação\n` +
    `/ajuda — esta mensagem`,
    { parse_mode: "Markdown" }
  );
});

// /validar — pede o CPF ao usuário
bot.onText(/\/validar/, (msg) => {
  const chatId = msg.chat.id;

  // marca que esse usuário está aguardando um CPF
  estadoUsuario[chatId] = "aguardando_cpf";

  bot.sendMessage(
    chatId,
    `🔍 *Validar CPF*\n\nDigite o CPF que deseja verificar:`,
    { parse_mode: "Markdown" }
  );
});

// ── Mensagens de texto livres ─────────────────
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const texto  = msg.text || "";

  // ignora comandos (tratados acima)
  if (texto.startsWith("/")) return;

  // verifica se o texto parece um CPF
  // aceita formatos: 000.000.000-00 ou 00000000000
  const pareceCPF = /^[\d.\-\s]{11,14}$/.test(texto.trim());

  if (estadoUsuario[chatId] === "aguardando_cpf" || pareceCPF) {
    // limpa o estado
    estadoUsuario[chatId] = null;

    const resultado = validarCPF(texto.trim());

    const resposta = resultado.valido
      ? mensagemValido(resultado)
      : mensagemInvalido(resultado);

    bot.sendMessage(chatId, resposta, { parse_mode: "Markdown" });
    return;
  }

  // mensagem que não é CPF nem comando conhecido
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