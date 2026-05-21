// ─────────────────────────────────────────────
// BotService.js — Lógica de validação de CPF
// ─────────────────────────────────────────────

/**
 * Remove tudo que não for dígito da string
 * "529.982.247-25" → "52998224725"
 */
const limparCPF = (cpf) => {
  return cpf.replace(/\D/g, "");
};

/**
 * Aplica a máscara 000.000.000-00
 * "52998224725" → "529.982.247-25"
 */
const formatarCPF = (cpf) => {
  const d = limparCPF(cpf);
  if (d.length !== 11) return d;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

/**
 * Rejeita sequências repetidas: 000.000.000-00, 111.111.111-11 etc.
 * Essas passariam no cálculo matemático, mas são inválidas pela Receita Federal.
 */
const ehSequenciaInvalida = (cpf) => {
  return /^(\d)\1{10}$/.test(cpf);
};

/**
 * Calcula um dígito verificador pelo Algoritmo Módulo 11
 *
 * @param {string} cpf         - CPF com 11 dígitos (só números)
 * @param {number} pesoInicial - 10 para o 1º dígito, 11 para o 2º
 * @returns {number}           - o dígito verificador calculado
 */
const calcularDigito = (cpf, pesoInicial) => {
  const qtdDigitos = pesoInicial - 1;

  const soma = cpf
    .slice(0, qtdDigitos)
    .split("")
    .reduce((acc, digito, i) => {
      const peso = pesoInicial - i;
      return acc + Number(digito) * peso;
    }, 0);

  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

/**
 * Valida o CPF e retorna um objeto com detalhes do resultado
 *
 * @param {string} cpf - CPF em qualquer formato
 * @returns {object}   - { valido, motivo, formatado, digitos }
 */
const validarCPF = (cpf) => {
  const limpo = limparCPF(cpf);

  if (limpo.length !== 11)
    return { valido: false, motivo: "Tamanho inválido — o CPF deve ter 11 dígitos." };

  if (ehSequenciaInvalida(limpo))
    return { valido: false, motivo: "Sequência repetida (ex: 111.111.111-11) não é um CPF válido." };

  const d1 = calcularDigito(limpo, 10);
  if (d1 !== Number(limpo[9]))
    return { valido: false, motivo: "1º dígito verificador incorreto." };

  const d2 = calcularDigito(limpo, 11);
  if (d2 !== Number(limpo[10]))
    return { valido: false, motivo: "2º dígito verificador incorreto." };

  return {
    valido: true,
    motivo: null,
    formatado: formatarCPF(limpo),
    digitos: [d1, d2],
  };
};

module.exports = { validarCPF, formatarCPF, limparCPF };