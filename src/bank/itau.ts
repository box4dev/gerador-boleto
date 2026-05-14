import { mod10 } from '../algorithm/checksum.js';
import { dvBarraModulo11, fatorVencimento, linhaDigitavelPadrao } from '../algorithm/febraban.js';
import type { BankModule, BoletoRuntime } from '../types.js';
import { onlyDigits, zeroPad } from '../util/string.js';

/**
 * Carteiras que usam apenas CARTEIRA/Nosso Número para cálculo do DAC
 */
const CARTEIRAS_SIMPLES = [126, 131, 146, 150, 168];



export const itau: BankModule = {
  options: { codigo: '341' },

  codBarras(boleto: BoletoRuntime): string {
    const codigoBanco = itau.options.codigo;
    const moeda = '9';

    const fator = fatorVencimento(boleto.dataVencimento);
    const valorDocumento = zeroPad(boleto.valorDocumento, 10);

    const carteira = zeroPad(onlyDigits(String(boleto.carteira ?? '')), 3);
    const carteiraNumero = Number.parseInt(carteira, 10);

    const agencia = zeroPad(onlyDigits(String(boleto.agencia ?? '')), 4);
    const conta = zeroPad(onlyDigits(String(boleto.codigoCedente ?? '')), 5).slice(-5);

    const nnStr = onlyDigits(String(boleto.nossoNumero));
    const nn = zeroPad(nnStr, 8);
    
    let baseNnDv = '';
    if (CARTEIRAS_SIMPLES.includes(carteiraNumero)) {
      baseNnDv = carteira + nn;
    } else {
      baseNnDv = agencia + conta + carteira + nn;
    }
    const nnDv = String(mod10(baseNnDv));

    const dacAgenciaConta = String(mod10(agencia + conta));

    // Campo livre para Itaú (25 dígitos)
    // Estrutura: CARTEIRA(3) + NN(8) + DV(1) + AGÊNCIA(4) + CONTA(5) + DV(1) + ZEROS(3)
    // Total: 3 + 8 + 1 + 4 + 5 + 1 + 3 = 25 dígitos
    const campoLivre = carteira + nn + nnDv + agencia + conta + dacAgenciaConta + '000';

    const barra = codigoBanco + moeda + fator + valorDocumento + campoLivre;

    const dv = dvBarraModulo11(barra);
    return barra.substring(0, 4) + String(dv) + barra.substring(4);
  },

  linhaDigitavel(codBarras: string): string {
    return linhaDigitavelPadrao(codBarras);
  },
};
