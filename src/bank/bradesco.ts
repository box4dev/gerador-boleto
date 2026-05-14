import { dvBarraModulo11, fatorVencimento, linhaDigitavelPadrao } from '../algorithm/febraban.js';
import type { BankModule, BoletoRuntime } from '../types.js';
import { zeroPad } from '../util/string.js';

export const bradesco: BankModule = {
  options: { codigo: '237' },

  codBarras(boleto: BoletoRuntime): string {
    const codigoBanco = bradesco.options.codigo;
    const numMoeda = '9';

    const fator = fatorVencimento(boleto.dataVencimento);
    const valorDocumento = zeroPad(boleto.valorDocumento, 10);
    const agencia = zeroPad(String(boleto.agencia ?? ''), 4);
    const carteira = zeroPad(String(boleto.carteira ?? ''), 2);
    const codigoCedente = zeroPad(String(boleto.codigoCedente ?? ''), 7);

    const nossoNumero = carteira + zeroPad(String(boleto.nossoNumero), 11);

    const barra = `${codigoBanco}${numMoeda}${fator}${valorDocumento}${agencia}${nossoNumero}${codigoCedente}0`;

    const dv = dvBarraModulo11(barra);
    return barra.substring(0, 4) + String(dv) + barra.substring(4);
  },

  linhaDigitavel(codBarras: string): string {
    return linhaDigitavelPadrao(codBarras);
  },
};
