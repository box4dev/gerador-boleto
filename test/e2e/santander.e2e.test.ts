import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { gerarBoleto } from '../../src/index.js';
import {
  SANTANDER_COMPLETO,
  SANTANDER_EXAMPLE,
  SANTANDER_MASSA_ESPECIFICA,
} from '../fixtures/boleto-fixtures.js';
import {
  validarCodigoBarras,
  validarConsistenciaBoletoCompleto,
  validarLinhaDigitavel,
} from '../helpers/febraban-validator.js';

describe('E2E › Santander', () => {
  // ─── Testes Positivos ─────────────────────────────────

  describe('Cenários positivos', () => {
    it('deve gerar boleto com dados completos e output determinístico (Golden Master)', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);

      assert.equal(out.codigoBanco, SANTANDER_COMPLETO.expected.codigoBanco);
      assert.equal(out.codigoBarras, SANTANDER_COMPLETO.expected.codigoBarras);
      assert.equal(out.linhaDigitavel, SANTANDER_COMPLETO.expected.linhaDigitavel);
    });

    it('deve gerar boleto com massa de dados específica e validar todos os campos', () => {
      const out = gerarBoleto(SANTANDER_MASSA_ESPECIFICA.input);

      assert.equal(out.codigoBanco, SANTANDER_MASSA_ESPECIFICA.expected.codigoBanco);
      assert.equal(out.codigoBarras, SANTANDER_MASSA_ESPECIFICA.expected.codigoBarras);
      assert.equal(out.linhaDigitavel, SANTANDER_MASSA_ESPECIFICA.expected.linhaDigitavel);
      assert.equal(out.nossoNumero, SANTANDER_MASSA_ESPECIFICA.input.nossoNumero);
      assert.equal(out.nossoNumeroDv, SANTANDER_MASSA_ESPECIFICA.expected.nossoNumeroDv);
    });

    it('deve produzir código de barras matematicamente válido (mod11)', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
      const result = validarCodigoBarras(String(out.codigoBarras));

      assert.ok(
        result.valido,
        `DV inválido: informado=${result.dvInformado}, calculado=${result.dvCalculado}`,
      );
    });

    it('deve produzir linha digitável matematicamente válida (mod10 campos + mod11 geral)', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
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
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
      const result = validarConsistenciaBoletoCompleto(
        String(out.codigoBarras),
        String(out.linhaDigitavel),
      );

      assert.ok(result.barrasValido, 'Código de barras com DV inválido');
      assert.ok(result.linhaValida, 'Linha digitável com DV inválido');
      assert.ok(result.consistente, 'Linha digitável não corresponde ao código de barras');
    });

    it('deve preservar campos customizados no output (cedente, cnpj, etc)', () => {
      const out = gerarBoleto(SANTANDER_EXAMPLE.input);

      assert.equal(out.cedente, 'Empresa Teste LTDA');
      assert.equal(out.cedenteCnpj, '91886612000189');
      assert.equal(out.numeroDocumento, '654321');
      assert.equal(out.localPagamento, 'Local Teste Santander');
      assert.equal(out.instrucoesPagamento, 'Instrução Teste');
    });

    it('deve gerar código de barras com exatamente 44 caracteres', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
      assert.equal(String(out.codigoBarras).length, 44);
    });

    it('deve gerar linha digitável com exatamente 54 caracteres (com formatação)', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
      assert.equal(String(out.linhaDigitavel).length, 54);
    });

    it('deve iniciar código de barras com código do banco 033', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
      assert.ok(String(out.codigoBarras).startsWith('033'));
    });

    it('deve retornar código do banco formatado como 033-7', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);
      assert.equal(out.codigoBanco, '033-7');
    });

    it('deve aceitar nossoNumero como string e como número com mesmo resultado', () => {
      const outString = gerarBoleto({
        ...SANTANDER_COMPLETO.input,
        nossoNumero: '1234567',
      });
      const outNumber = gerarBoleto({
        ...SANTANDER_COMPLETO.input,
        nossoNumero: 1234567,
      });

      assert.equal(outString.codigoBarras, outNumber.codigoBarras);
      assert.equal(outString.linhaDigitavel, outNumber.linhaDigitavel);
    });

    it('deve gerar textos padrão quando instrucoesPagamento não é fornecido', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);

      assert.equal(out.localPagamento, 'Até o vencimento, preferencialmente no Banco Santander');
      assert.equal(
        out.instrucoesPagamento,
        'Sr. Caixa, cobrar multa de 2% após o vencimento. Receber até 10 dias após o vencimento.',
      );
    });

    it('deve serializar datas como ISO string no output', () => {
      const out = gerarBoleto(SANTANDER_COMPLETO.input);

      assert.ok(typeof out.dataEmissao === 'string');
      assert.ok(typeof out.dataVencimento === 'string');
      assert.ok(String(out.dataEmissao).startsWith('2026-05-10'));
      assert.ok(String(out.dataVencimento).startsWith('2026-05-17'));
    });

    it('deve produzir boleto válido com massa de dados do segundo fixture', () => {
      const out = gerarBoleto(SANTANDER_MASSA_ESPECIFICA.input);
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
        ...SANTANDER_COMPLETO.input,
        valorDocumento: 0,
      });

      assert.equal(String(out.codigoBarras).length, 44);
      const result = validarCodigoBarras(String(out.codigoBarras));
      assert.ok(result.valido, 'DV do código de barras inválido para valor 0');
    });

    it('deve gerar boleto válido com valor muito grande', () => {
      const out = gerarBoleto({
        ...SANTANDER_COMPLETO.input,
        valorDocumento: 9999999999,
      });

      assert.equal(String(out.codigoBarras).length, 44);
      const result = validarCodigoBarras(String(out.codigoBarras));
      assert.ok(result.valido, 'DV do código de barras inválido para valor máximo');
    });

    it('deve lançar erro para data de emissão inválida', () => {
      assert.throws(
        () =>
          gerarBoleto({
            ...SANTANDER_COMPLETO.input,
            dataEmissao: 'not-a-date',
          }),
        (err) => {
          assert.ok(err instanceof Error);
          assert.match(err.message, /Data inválida/);
          return true;
        },
      );
    });

    it('deve lançar erro para data de vencimento inválida', () => {
      assert.throws(
        () =>
          gerarBoleto({
            ...SANTANDER_COMPLETO.input,
            dataVencimento: '99/99/9999',
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
