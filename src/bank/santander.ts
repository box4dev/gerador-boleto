import { mod11 } from '../algorithm/checksum.js';
import { dvBarraModulo11, fatorVencimento, linhaDigitavelPadrao } from '../algorithm/febraban.js';
import type { BankModule, BoletoRuntime } from '../types.js';
import { zeroPad } from '../util/string.js';

export const santander: BankModule = {
  options: { codigo: '033' },

  codBarras(boleto: BoletoRuntime): string {
    const codigoBanco = santander.options.codigo;
    const numMoeda = '9';
    const fixo = '9';
    const ios = '0';

    const fator = fatorVencimento(boleto.dataVencimento);
    const valorDocumento = zeroPad(boleto.valorDocumento, 10);
    const carteira = zeroPad(String(boleto.carteira ?? ''), 3);
    const codigoCedente = zeroPad(String(boleto.codigoCedente ?? ''), 7);

    const nnStr = String(boleto.nossoNumero);
    const nossoNumero = zeroPad(nnStr, 12) + mod11(nnStr);

    const barra = `${codigoBanco}${numMoeda}${fator}${valorDocumento}${fixo}${codigoCedente}${nossoNumero}${ios}${carteira}`;

    const dv = dvBarraModulo11(barra);
    return barra.substring(0, 4) + String(dv) + barra.substring(4);
  },

  linhaDigitavel(codBarras: string): string {
    return linhaDigitavelPadrao(codBarras);
  },
};
