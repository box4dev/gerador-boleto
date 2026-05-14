import { gerarBoleto as internalGerar } from './generator';

/**
 * Gera um boleto bancário de forma flexível e pronta para uso.
 * * Esta é a função principal do pacote. Ela permite criar um boleto completo fornecendo
 * todos os dados, apenas uma parte deles (preenchendo o restante aleatoriamente)
 * ou nenhum dado (geração totalmente randômica).
 * * @param {Partial<BoletoInput>} [input] - Objeto opcional com os dados do boleto.
 * Aceita campos padrões, datas em string/Date e campos customizados.
 * * @returns {BoletoJsonOutput} Objeto serializável contendo os dados calculados,
 * incluindo linha digitável e código de barras.
 * * @example
 * // 1. Geração totalmente aleatória (útil para testes rápidos de UI)
 * const boletoVazio = gerarBoleto();
 *
 * * @example
 * // 2. Geração com campos essenciais (Uso Ideal)
 * const boletoComDados = gerarBoleto({
 * banco: 'bradesco',
 * dataEmissao: '15/05/2026',
 * dataVencimento: '25/05/2026',
 * valorDocumento: 99900,
 * nossoNumero: '12345678901',
 * agencia: '1229',
 * codigoCedente: '0000469',
 * carteira: '25',
 * });
 *
 * * @example
 * // 3. Geração com campos opcionais e metadados customizados (Campos extras são preservados no output)
 * const boletoPersonalizado = gerarBoleto({
 * banco: 'santander',
 * cedente: 'Empresa Teste LTDA',
 * cedenteCnpj: '18727053000174',
 * instrucoesPagamento: 'Não receber após o vencimento',
 * meuIdInterno: 'abc-123'
 * });
 */
export const gerarBoleto = internalGerar;

// Exporta tipos essenciais para o usuário final
export type {
  BankId,
  BoletoInput,
  BoletoJsonOutput,
} from './types.js';
