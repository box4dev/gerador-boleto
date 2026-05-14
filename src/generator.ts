import { banks as banksRegistry } from './bank/registry.js';
import { Boleto } from './boleto.js';
import { serializeBoleto } from './serializer.js';
import type { BankId, BoletoInput, BoletoJsonOutput, BoletoRuntime } from './types.js';
import { normalizeDate, utcToday } from './util/date.js';
import { randomInt } from './util/random.js';
import { capitalize, zeroPad } from './util/string.js';

/**
 * Normaliza o input bruto do usuário para o formato de runtime.
 * Centraliza a definição de valores padrão e textos informativos.
 */
function prepararInput(input: Partial<BoletoInput>): BoletoRuntime {
  const banco = input.banco || (Object.keys(banksRegistry)[0] as BankId);

  const emissao = input.dataEmissao ? normalizeDate(input.dataEmissao) : utcToday();
  let vencimento: Date;

  if (input.dataVencimento) {
    vencimento = normalizeDate(input.dataVencimento);
  } else {
    vencimento = new Date(emissao.getTime());
    vencimento.setUTCDate(vencimento.getUTCDate() + 5);
  }

  // Lógica de textos padrão: movida para o gerador por ser uma regra de negócio visual,
  // não afetando o cálculo matemático do código de barras.
  const instrucoes =
    input.instrucoesPagamento ||
    'Sr. Caixa, cobrar multa de 2% após o vencimento. Receber até 10 dias após o vencimento.';

  const local =
    input.localPagamento ||
    `Até o vencimento, preferencialmente no Banco ${capitalize(String(banco))}`;

  return {
    ...input, // Preserva campos customizados (ex: cedente, cnpj, identificadores)
    banco,
    dataEmissao: emissao,
    dataVencimento: vencimento,
    valorDocumento: input.valorDocumento ?? 0,
    nossoNumero: input.nossoNumero ?? 0,
    agencia: input.agencia ?? 0,
    codigoCedente: input.codigoCedente ?? 0,
    carteira: input.carteira ?? 0,
    localPagamento: local,
    instrucoesPagamento: instrucoes,
  } as BoletoRuntime;
}

/**
 * Cria uma instância de Boleto e a converte para um formato serializável.
 */
export function criarBoleto(input: Partial<BoletoInput>): BoletoJsonOutput {
  const runtimeInput = prepararInput(input);
  return serializeBoleto(new Boleto(runtimeInput));
}

/**
 * Configurações de carteiras por banco conforme especificações.
 */
const CARTEIRAS_POR_BANCO: Record<BankId, number[]> = {
  bradesco: [9, 4, 6, 21, 22, 25, 26, 19],
  caixa: [14, 24, 2, 1, 11, 82],
  santander: [101, 102, 201, 104],
  itau: [104, 109, 112, 175],
};

/**
 * Configurações de dígitos para carteira por banco.
 */
const DIGITOS_CARTEIRA: Record<BankId, number> = {
  bradesco: 2,
  caixa: 2,
  santander: 3,
  itau: 3,
};

/**
 * Configurações de dígitos para Nosso Número por banco.
 * Nota: Santander usa 12 dígitos + DV calculado pelo banco.
 * Nota: Itaú usa 8 dígitos + DV calculado pelo banco.
 */
const DIGITOS_NOSSO_NUMERO: Record<BankId, { min: number; max: number }> = {
  bradesco: { min: 11, max: 11 },
  caixa: { min: 15, max: 17 },
  santander: { min: 12, max: 12 },
  itau: { min: 8, max: 8 },
};

/**
 * Seleciona uma carteira aleatória válida para o banco especificado.
 */
function escolherCarteira(banco: BankId): number {
  const carteiras = CARTEIRAS_POR_BANCO[banco];
  const index = Math.floor(Math.random() * carteiras.length);
  return carteiras[index]!;
}

/**
 * Formata a carteira com zero-padding conforme o banco.
 */
function formatarCarteira(carteira: number, banco: BankId): string {
  const digitos = DIGITOS_CARTEIRA[banco];
  return zeroPad(carteira, digitos);
}

/**
 * Gera um Nosso Número com o número correto de dígitos para o banco.
 */
function gerarNossoNumero(banco: BankId): number {
  const { min, max } = DIGITOS_NOSSO_NUMERO[banco];
  const digitos = min === max ? min : randomInt(min, max);
  const minValor = 10 ** (digitos - 1);
  const maxValor = 10 ** digitos - 1;
  return randomInt(minValor, maxValor);
}

/**
 * Gera um boleto com dados aleatórios para campos não preenchidos.
 */
export function gerarBoletoAleatorio(input?: Partial<BoletoInput>): BoletoJsonOutput {
  const bankIds = Object.keys(banksRegistry) as BankId[];
  const chooseBank = (): BankId => bankIds[Math.floor(Math.random() * bankIds.length)] as BankId;

  const provided: Partial<BoletoInput> = input ?? {};
  const banco = provided.banco ?? chooseBank();

  // Valida se o banco informado existe no registro
  if (!banksRegistry[banco]) {
    throw new Error('Banco inválido.');
  }

  const defaults: Partial<BoletoInput> = {
    banco,
    valorDocumento: randomInt(1, 99_999),
    nossoNumero: gerarNossoNumero(banco),
    agencia: randomInt(1, 9_999),
    codigoCedente: randomInt(1, 9_999_999),
  };

  const merged = { ...defaults, ...provided };

  // Regra de negócio específica: carteiras variam conforme o banco
  if (merged.carteira == null) {
    const carteiraNumero = escolherCarteira(banco);
    merged.carteira = formatarCarteira(carteiraNumero, banco);
  }

  return criarBoleto(merged);
}

/**
 * Função principal exportada para o utilizador final.
 */
export function gerarBoleto(input?: Partial<BoletoInput>): BoletoJsonOutput {
  return gerarBoletoAleatorio(input);
}
