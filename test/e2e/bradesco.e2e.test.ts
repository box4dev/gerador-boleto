import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { gerarBoleto } from '../../src/index.js';
import {
  BRADESCO_COMPLETO,
  BRADESCO_EXAMPLE,
  BRADESCO_MASSA_ESPECIFICA,
} from '../fixtures/boleto-fixtures.js';
import {
  validarCodigoBarras,
  validarConsistenciaBoletoCompleto,
  validarLinhaDigitavel,
} from '../helpers/febraban-validator.js';

describe('E2E › Bradesco', () => {
  // ─── Testes Positivos ─────────────────────────────────

  describe('Cenários positivos', () => {
    it('deve gerar boleto com dados completos e output determinístico (Golden Master)', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);

      assert.equal(out.codigoBanco, BRADESCO_COMPLETO.expected.codigoBanco);
      assert.equal(out.codigoBarras, BRADESCO_COMPLETO.expected.codigoBarras);
      assert.equal(out.linhaDigitavel, BRADESCO_COMPLETO.expected.linhaDigitavel);
    });

    it('deve gerar boleto com massa de dados específica e validar todos os campos', () => {
      const out = gerarBoleto(BRADESCO_MASSA_ESPECIFICA.input);

      assert.equal(out.codigoBanco, BRADESCO_MASSA_ESPECIFICA.expected.codigoBanco);
      assert.equal(out.codigoBarras, BRADESCO_MASSA_ESPECIFICA.expected.codigoBarras);
      assert.equal(out.linhaDigitavel, BRADESCO_MASSA_ESPECIFICA.expected.linhaDigitavel);
      assert.equal(out.nossoNumero, BRADESCO_MASSA_ESPECIFICA.input.nossoNumero);
      assert.equal(out.nossoNumeroDv, BRADESCO_MASSA_ESPECIFICA.expected.nossoNumeroDv);
    });

    it('deve produzir código de barras matematicamente válido (mod11)', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      const result = validarCodigoBarras(String(out.codigoBarras));

      assert.ok(
        result.valido,
        `DV inválido: informado=${result.dvInformado}, calculado=${result.dvCalculado}`,
      );
    });

    it('deve produzir linha digitável matematicamente válida (mod10 campos + mod11 geral)', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      const result = validarLinhaDigitavel(String(out.linhaDigitavel));

      assert.ok(
        result.campo1.valido,
        `Campo 1 inválido: dv=${result.campo1.dv}, calc=${result.campo1.calculado}`,
      );
      assert.ok(
        result.campo2.valido,
        `Campo 2 inválido: dv=${result.campo2.dv}, calc=${result.campo2.calculado}`,
      );
      assert.ok(
        result.campo3.valido,
        `Campo 3 inválido: dv=${result.campo3.dv}, calc=${result.campo3.calculado}`,
      );
      assert.ok(
        result.dvGeral.valido,
        `DV geral inválido: dv=${result.dvGeral.dv}, calc=${result.dvGeral.calculado}`,
      );
    });

    it('deve manter consistência entre código de barras e linha digitável', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      const result = validarConsistenciaBoletoCompleto(
        String(out.codigoBarras),
        String(out.linhaDigitavel),
      );

      assert.ok(result.barrasValido, 'Código de barras com DV inválido');
      assert.ok(result.linhaValida, 'Linha digitável com DV inválido');
      assert.ok(result.consistente, 'Linha digitável não corresponde ao código de barras');
    });

    it('deve preservar campos customizados no output (cedente, cnpj, etc)', () => {
      const out = gerarBoleto(BRADESCO_EXAMPLE.input);

      assert.equal(out.cedente, 'Empresa Teste LTDA');
      assert.equal(out.cedenteCnpj, '18727053000174');
      assert.equal(out.numeroDocumento, '8888888');
      assert.equal(out.localPagamento, 'Local Teste');
      assert.equal(out.instrucoesPagamento, 'Instrução Teste');
    });

    it('deve gerar código de barras com exatamente 44 caracteres', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      assert.equal(String(out.codigoBarras).length, 44);
    });

    it('deve gerar linha digitável com exatamente 54 caracteres (com formatação)', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      assert.equal(String(out.linhaDigitavel).length, 54);
    });

    it('deve iniciar código de barras com código do banco 237', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      assert.ok(String(out.codigoBarras).startsWith('237'));
    });

    it('deve retornar código do banco formatado como 237-2', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);
      assert.equal(out.codigoBanco, '237-2');
    });

    it('deve aceitar nossoNumero como string e como número', () => {
      const outString = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        nossoNumero: '12345678901',
      });
      const outNumber = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        nossoNumero: 12345678901,
      });

      assert.equal(outString.codigoBarras, outNumber.codigoBarras);
      assert.equal(outString.linhaDigitavel, outNumber.linhaDigitavel);
    });

    it('deve aceitar agência como string e como número', () => {
      const outString = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        agencia: '1229',
      });
      const outNumber = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        agencia: 1229,
      });

      assert.equal(outString.codigoBarras, outNumber.codigoBarras);
    });

    it('deve serializar datas como ISO string no output', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);

      assert.ok(typeof out.dataEmissao === 'string');
      assert.ok(typeof out.dataVencimento === 'string');
      assert.ok(String(out.dataEmissao).startsWith('2026-05-10'));
      assert.ok(String(out.dataVencimento).startsWith('2026-05-17'));
    });

    it('deve gerar textos padrão quando instrucoesPagamento e localPagamento não são fornecidos', () => {
      const out = gerarBoleto(BRADESCO_COMPLETO.input);

      assert.equal(out.localPagamento, 'Até o vencimento, preferencialmente no Banco Bradesco');
      assert.equal(
        out.instrucoesPagamento,
        'Sr. Caixa, cobrar multa de 2% após o vencimento. Receber até 10 dias após o vencimento.',
      );
    });

    it('deve produzir boleto válido com massa de dados do segundo fixture', () => {
      const out = gerarBoleto(BRADESCO_MASSA_ESPECIFICA.input);
      const result = validarConsistenciaBoletoCompleto(
        String(out.codigoBarras),
        String(out.linhaDigitavel),
      );

      assert.ok(result.barrasValido && result.linhaValida && result.consistente);
    });
  });

  // ─── Testes Negativos ─────────────────────────────────

  describe('Cenários negativos', () => {
    it('deve gerar boleto válido mesmo com valorDocumento = 0', () => {
      const out = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        valorDocumento: 0,
      });

      assert.equal(String(out.codigoBarras).length, 44);
      const result = validarCodigoBarras(String(out.codigoBarras));
      assert.ok(result.valido, 'DV do código de barras inválido para valor 0');
    });

    it('deve gerar boleto válido com valor muito grande', () => {
      const out = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        valorDocumento: 9999999999,
      });

      assert.equal(String(out.codigoBarras).length, 44);
      const result = validarCodigoBarras(String(out.codigoBarras));
      assert.ok(result.valido, 'DV do código de barras inválido para valor máximo');
    });

    it('deve aceitar data em formato ISO string (sem objeto Date)', () => {
      const out = gerarBoleto({
        ...BRADESCO_COMPLETO.input,
        dataVencimento: '2026-05-17',
      });

      assert.ok(typeof out.dataVencimento === 'string');
      assert.ok(String(out.dataVencimento).startsWith('2026-05-17'));
    });

    it('deve lançar erro para data inválida como string', () => {
      assert.throws(
        () =>
          gerarBoleto({
            banco: 'bradesco',
            dataVencimento: 'data-invalida-xyz',
            valorDocumento: 1000,
            nossoNumero: '12345678901',
            agencia: '1234',
            codigoCedente: '1234567',
            carteira: '25',
          }),
        (err) => {
          assert.ok(err instanceof Error);
          assert.match(err.message, /Data inválida/);
          return true;
        },
      );
    });
  });
});
