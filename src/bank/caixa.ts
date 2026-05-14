import { mod10, mod11 } from '../algorithm/checksum.js';
import { dvBarraModulo11, fatorVencimento, linhaDigitavelPadrao } from '../algorithm/febraban.js';
import type { BankModule, BoletoRuntime } from '../types.js';
import { onlyDigits, zeroPad } from '../util/string.js';

/** DV do código do beneficiário (6 posições) — Anexo VI SIGCB */
function dvCodigoBeneficiario(codigo6: string): number {
  return mod11(onlyDigits(codigo6), 9, 0);
}

/** DV do campo livre (24 posições sem o DV) — pesos fixos SIGCB */
function dvCampoLivre(campo24: string): number {
  const indices = '987654329876543298765432';
  let soma = 0;
  for (let i = 0; i < 24; i++) {
    soma += Number.parseInt(campo24[i]!, 10) * Number.parseInt(indices[i]!, 10);
  }
  const resto = soma % 11;
  let digito = 11 - resto;
  if (digito > 9) {
    digito = 0;
  }
  return digito;
}

function montarCampoLivre(cedente6: string, dvCedente: number, nossoNumero17: string): string {
  const nn = nossoNumero17;
  const campo =
    cedente6 +
    String(dvCedente) +
    nn.substring(2, 5) +
    nn.substring(0, 1) +
    nn.substring(5, 8) +
    nn.substring(1, 2) +
    nn.substring(8, 17);
  return campo + String(dvCampoLivre(campo));
}

export const caixa: BankModule = {
  options: { codigo: '104' },

  codBarras(boleto: BoletoRuntime): string {
    const codigoBanco = caixa.options.codigo;
    const moeda = '9';
    const fator = fatorVencimento(boleto.dataVencimento);
    const valorDocumento = zeroPad(boleto.valorDocumento, 10);

    const rawCodigo =
      boleto.codigoCedente != null ? boleto.codigoCedente : boleto.codigo_beneficiario;
    const codigoBenef = zeroPad(onlyDigits(String(rawCodigo ?? '')), 6).slice(-6);

    let carteira = onlyDigits(String(boleto.carteira ?? '1'));
    carteira = carteira.length > 0 ? carteira.charAt(0)! : '1';

    let identEmissao = onlyDigits(String(boleto.identificadorEmissao ?? '4'));
    identEmissao = identEmissao.length > 0 ? identEmissao.charAt(0)! : '4';

    const nnDigits = onlyDigits(String(boleto.nossoNumero));
    const nn17 =
      nnDigits.length >= 17
        ? nnDigits.slice(-17)
        : carteira + identEmissao + zeroPad(nnDigits, 15).slice(-15);

    const dvBenef = dvCodigoBeneficiario(codigoBenef);
    const campoLivre25 = montarCampoLivre(codigoBenef, dvBenef, nn17);

    const semDv = codigoBanco + moeda + fator + valorDocumento + campoLivre25;
    const dvGeral = dvBarraModulo11(semDv.substring(0, 4) + semDv.substring(4));

    return semDv.substring(0, 4) + String(dvGeral) + semDv.substring(4);
  },

  linhaDigitavel(codBarras: string): string {
    const padrao = linhaDigitavelPadrao(codBarras);

    const campo1 =
      codBarras.substring(0, 3) + codBarras.substring(3, 4) + codBarras.substring(19, 24);
    const campo1Dv = String(mod10(campo1));
    const campo1Fmt = `${(campo1 + campo1Dv).substring(0, 5)}.${(campo1 + campo1Dv).substring(5)}`;

    return `${campo1Fmt}${padrao.substring(padrao.indexOf(' '))}`;
  },
};
