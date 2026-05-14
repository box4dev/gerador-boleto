/** IDs dos bancos com implementação emissor disponível */
export type BankId = 'bradesco' | 'santander' | 'caixa' | 'itau';

/** Payload mínimo compartilhado + campos específicos por banco */
export interface BoletoInputBase {
  banco: BankId;
  dataEmissao?: Date | string;
  dataVencimento?: Date | string;
  valorDocumento: number | string;
  nossoNumero: number | string;
  agencia: number | string;
  codigoCedente: number | string;
  carteira: number | string;
  [key: string]: unknown;
}

export type BoletoInput = BoletoInputBase;

/** Instância mutável usada nos cálculos (datas como Date no objeto vivo) */
export type BoletoRuntime = BoletoInputBase & {
  dataEmissao: Date;
  dataVencimento: Date;
};

/** Saída JSON-serializável (datas ISO) */
export type BoletoJsonOutput = {
  [key: string]: string | number | boolean | null | undefined;
};

export interface BankOptions {
  codigo: string;
}

export interface BankModule {
  options: BankOptions;
  codBarras: (boleto: BoletoRuntime) => string;
  linhaDigitavel: (codBarras: string) => string;
}
