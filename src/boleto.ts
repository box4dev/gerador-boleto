import { mod11 } from './algorithm/checksum.js';
import { banks } from './bank/registry.js';
import type { BankModule, BoletoRuntime } from './types.js';

export class Boleto {
  bank: BankModule;

  codigoBarras!: string;
  linhaDigitavel!: string;

  banco!: BoletoRuntime['banco'];
  codigoBanco!: string;
  dataEmissao!: Date;
  dataVencimento!: Date;
  valorDocumento!: BoletoRuntime['valorDocumento'];
  nossoNumero!: BoletoRuntime['nossoNumero'];
  nossoNumeroDv!: number;
  agencia!: BoletoRuntime['agencia'];
  codigoCedente!: BoletoRuntime['codigoCedente'];
  carteira!: BoletoRuntime['carteira'];

  // Permite que campos extras (instrucoesPagamento, localPagamento, etc)
  // existam na raiz da instância para serialização automática.
  [key: string]: unknown;

  constructor(input: BoletoRuntime) {
    const bank = banks[input.banco];
    if (!bank) {
      throw new Error('Banco inválido.');
    }

    this.bank = bank;

    /**
     * Mescla todas as propriedades do input na instância.
     * Isso garante que campos informativos (localPagamento, instrucoesPagamento)
     * e metadados customizados sejam preservados no JSON de saída.
     */
    Object.assign(this, input);

    this._calculate();
  }

  private _calculate(): void {
    const codigo = this.bank.options.codigo;
    this.codigoBanco = `${codigo}-${mod11(codigo)}`;
    this.nossoNumeroDv = mod11(String(this.nossoNumero));

    // A instância atual agora contém todos os dados necessários para o cálculo do banco
    this.codigoBarras = this.bank.codBarras(this as unknown as BoletoRuntime);
    this.linhaDigitavel = this.bank.linhaDigitavel(this.codigoBarras);
  }
}
