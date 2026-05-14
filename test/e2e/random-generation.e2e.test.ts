import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { gerarBoleto } from '../../src/index.js';
import { BANCOS_DISPONIVEIS, CODIGOS_BANCO } from '../fixtures/boleto-fixtures.js';
import {
  validarCodigoBarras,
  validarConsistenciaBoletoCompleto,
  validarLinhaDigitavel,
} from '../helpers/febraban-validator.js';

describe('E2E › Geração Aleatória', () => {
  // ─── Geração totalmente vazia ─────────────────────────

  describe('gerarBoleto() — sem argumentos', () => {
    it('deve retornar um objeto com todas as propriedades obrigatórias', () => {
      const out = gerarBoleto();

      assert.ok(out.codigoBarras, 'codigoBarras ausente');
      assert.ok(out.linhaDigitavel, 'linhaDigitavel ausente');
      assert.ok(out.codigoBanco, 'codigoBanco ausente');
      assert.ok(out.banco, 'banco ausente');
      assert.ok(out.dataEmissao, 'dataEmissao ausente');
      assert.ok(out.dataVencimento, 'dataVencimento ausente');
      assert.ok(out.valorDocumento !== undefined, 'valorDocumento ausente');
      assert.ok(out.nossoNumero !== undefined, 'nossoNumero ausente');
    });

    it('deve gerar código de barras com exatamente 44 dígitos', () => {
      const out = gerarBoleto();
      assert.equal(String(out.codigoBarras).length, 44);
    });

    it('deve gerar linha digitável com exatamente 54 caracteres', () => {
      const out = gerarBoleto();
      assert.equal(String(out.linhaDigitavel).length, 54);
    });

    it('deve selecionar um banco válido do registro', () => {
      const out = gerarBoleto();
      assert.ok(
        BANCOS_DISPONIVEIS.includes(out.banco as typeof BANCOS_DISPONIVEIS[number]),
        `Banco "${out.banco}" não está no registro de bancos disponíveis`,
      );
    });

    it('deve produzir código de barras matematicamente válido', () => {
      const out = gerarBoleto();
      const result = validarCodigoBarras(String(out.codigoBarras));
      assert.ok(result.valido, `DV inválido: informado=${result.dvInformado}, calculado=${result.dvCalculado}`);
    });

    it('deve produzir linha digitável matematicamente válida', () => {
      const out = gerarBoleto();
      const result = validarLinhaDigitavel(String(out.linhaDigitavel));

      assert.ok(result.valida, 'Linha digitável inválida em geração aleatória');
    });

    it('deve manter consistência entre barras e linha em geração aleatória', () => {
      const out = gerarBoleto();
      const result = validarConsistenciaBoletoCompleto(
        String(out.codigoBarras),
        String(out.linhaDigitavel),
      );

      assert.ok(result.barrasValido && result.linhaValida && result.consistente);
    });

    it('deve gerar vencimento no futuro (5 dias após emissão padrão)', () => {
      const out = gerarBoleto();
      const emissao = new Date(String(out.dataEmissao));
      const vencimento = new Date(String(out.dataVencimento));

      assert.ok(vencimento > emissao, 'Vencimento deve ser posterior à emissão');
    });

    it('deve gerar boletos válidos em 10 execuções consecutivas (estabilidade)', () => {
      for (let i = 0; i < 10; i++) {
        const out = gerarBoleto();
        const result = validarConsistenciaBoletoCompleto(
          String(out.codigoBarras),
          String(out.linhaDigitavel),
        );

        assert.ok(
          result.barrasValido && result.linhaValida && result.consistente,
          `Falha na iteração ${i + 1}: barras=${result.barrasValido}, linha=${result.linhaValida}, consistente=${result.consistente}`,
        );
      }
    });
  });

  // ─── Geração parcial (apenas banco) ───────────────────

  describe('gerarBoleto({ banco }) — apenas banco especificado', () => {
    for (const banco of BANCOS_DISPONIVEIS) {
      describe(`Banco: ${banco}`, () => {
        it('deve retornar o banco especificado no output', () => {
          const out = gerarBoleto({ banco });
          assert.equal(out.banco, banco);
        });

        it('deve retornar o codigoBanco correto', () => {
          const out = gerarBoleto({ banco });
          assert.equal(out.codigoBanco, CODIGOS_BANCO[banco]);
        });

        it('deve gerar código de barras iniciando com o código do banco', () => {
          const out = gerarBoleto({ banco });
          const codigoEsperado = CODIGOS_BANCO[banco]!.split('-')[0]!;
          assert.ok(
            String(out.codigoBarras).startsWith(codigoEsperado),
            `Esperado iniciar com "${codigoEsperado}", obtido "${String(out.codigoBarras).substring(0, 3)}"`,
          );
        });

        it('deve produzir boleto matematicamente válido', () => {
          const out = gerarBoleto({ banco });
          const result = validarConsistenciaBoletoCompleto(
            String(out.codigoBarras),
            String(out.linhaDigitavel),
          );

          assert.ok(
            result.barrasValido && result.linhaValida && result.consistente,
            `Boleto inválido para ${banco}`,
          );
        });

        it('deve preencher campos obrigatórios automaticamente', () => {
          const out = gerarBoleto({ banco });

          assert.ok(out.valorDocumento !== undefined, 'valorDocumento não preenchido');
          assert.ok(out.nossoNumero !== undefined, 'nossoNumero não preenchido');
          assert.ok(out.agencia !== undefined, 'agencia não preenchida');
          assert.ok(out.codigoCedente !== undefined, 'codigoCedente não preenchido');
          assert.ok(out.carteira !== undefined, 'carteira não preenchida');
        });

        it('deve ser estável em 5 execuções consecutivas', () => {
          for (let i = 0; i < 5; i++) {
            const out = gerarBoleto({ banco });
            const result = validarCodigoBarras(String(out.codigoBarras));
            assert.ok(result.valido, `Iteração ${i + 1} falhou para ${banco}`);
          }
        });
      });
    }
  });
});
