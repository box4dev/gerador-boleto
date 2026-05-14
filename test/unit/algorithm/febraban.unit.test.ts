import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  dvBarraModulo11,
  fatorVencimento,
  linhaDigitavelPadrao,
} from '../../../src/algorithm/febraban.js';

describe('Unit › FEBRABAN › dvBarraModulo11', () => {
  // ─── Testes Positivos ─────────────────────────────────

  it('deve calcular DV para código de barras do Bradesco', () => {
    // Barra sem DV: 2379144900000159901229251234567890100004690
    // Esperado: 7 (posição 5 do barras completo)
    const barra = '2379144900000159901229251234567890100004690';
    const dv = dvBarraModulo11(barra);
    assert.equal(dv, 7);
  });

  it('deve calcular DV para código de barras do Santander', () => {
    const barra = '0339144900000015009640415400000123456790102';
    const dv = dvBarraModulo11(barra);
    assert.equal(dv, 7);
  });

  it('deve calcular DV para código de barras da Caixa', () => {
    const barra = '1049144900000321120055077222133347777777771';
    const dv = dvBarraModulo11(barra);
    assert.equal(dv, 4);
  });

  it('deve retornar 1 quando resto é 0', () => {
    // Quando mod11 retorna resto 0 → DV deve ser 1
    // Precisamos encontrar um valor que produza resto 0
    // A regra é: resto 0, 1 ou 10 → retorna 1
    const dv = dvBarraModulo11('0000000000000000000000000000000000000000000');
    assert.equal(dv, 1);
  });

  it('deve retornar valor entre 1 e 9', () => {
    const testBarras = [
      '2379144900000159901229251234567890100004690',
      '0339144900000015009640415400000123456790102',
      '1049144900000321120055077222133347777777771',
    ];

    for (const barra of testBarras) {
      const dv = dvBarraModulo11(barra);
      assert.ok(dv >= 1 && dv <= 9, `DV ${dv} fora do range 1-9 para barra ${barra}`);
    }
  });
});

describe('Unit › FEBRABAN › fatorVencimento', () => {
  // ─── Regra antiga (antes de 22/02/2025) ───────────────

  describe('Regra antiga (antes de 22/02/2025)', () => {
    it('deve retornar 3242 para 23/08/2006', () => {
      assert.equal(fatorVencimento(new Date('2006-08-23T12:00:00.000Z')), '3242');
    });

    it('deve retornar 9999 para 21/02/2025 (último dia regra antiga)', () => {
      assert.equal(fatorVencimento(new Date('2025-02-21T12:00:00.000Z')), '9999');
    });

    it('deve retornar 9998 para 20/02/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-02-20T12:00:00.000Z')), '9998');
    });
  });

  // ─── Nova regra FEBRABAN (a partir de 22/02/2025) ─────

  describe('Nova regra FEBRABAN (a partir de 22/02/2025)', () => {
    it('deve retornar 1000 para 22/02/2025 (data de reinício)', () => {
      assert.equal(fatorVencimento(new Date('2025-02-22T12:00:00.000Z')), '1000');
    });

    it('deve retornar 1001 para 23/02/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-02-23T12:00:00.000Z')), '1001');
    });

    it('deve retornar 1006 para 28/02/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-02-28T12:00:00.000Z')), '1006');
    });

    it('deve retornar 1016 para 10/03/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-03-10T12:00:00.000Z')), '1016');
    });

    it('deve retornar 1068 para 01/05/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-05-01T12:00:00.000Z')), '1068');
    });

    it('deve retornar 1160 para 01/08/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-08-01T12:00:00.000Z')), '1160');
    });

    it('deve retornar 1252 para 01/11/2025', () => {
      assert.equal(fatorVencimento(new Date('2025-11-01T12:00:00.000Z')), '1252');
    });

    it('deve retornar 1344 para 01/02/2026', () => {
      assert.equal(fatorVencimento(new Date('2026-02-01T12:00:00.000Z')), '1344');
    });

    it('deve retornar 1449 para 17/05/2026 (fator usado nos fixtures)', () => {
      assert.equal(fatorVencimento(new Date('2026-05-17T12:00:00.000Z')), '1449');
    });
  });

  // ─── Formatos de entrada ──────────────────────────────

  describe('Formatos de entrada', () => {
    it('deve aceitar Date object', () => {
      const result = fatorVencimento(new Date('2026-05-17T00:00:00.000Z'));
      assert.equal(typeof result, 'string');
      assert.equal(result.length, 4);
    });

    it('deve aceitar ISO string', () => {
      const result = fatorVencimento('2026-05-17T00:00:00.000Z');
      assert.equal(typeof result, 'string');
      assert.equal(result.length, 4);
    });

    it('deve aceitar string curta YYYY-MM-DD', () => {
      const result = fatorVencimento('2026-05-17');
      assert.equal(typeof result, 'string');
      assert.equal(result.length, 4);
    });

    it('deve produzir mesmo resultado para Date e ISO string', () => {
      const fromDate = fatorVencimento(new Date('2026-05-17T00:00:00.000Z'));
      const fromString = fatorVencimento('2026-05-17T00:00:00.000Z');
      assert.equal(fromDate, fromString);
    });
  });

  // ─── Retorno sempre 4 dígitos ─────────────────────────

  it('deve retornar sempre string de exatamente 4 caracteres', () => {
    const dates = [
      new Date('2025-02-22T00:00:00.000Z'),
      new Date('2025-03-01T00:00:00.000Z'),
      new Date('2026-12-31T00:00:00.000Z'),
    ];
    for (const d of dates) {
      const result = fatorVencimento(d);
      assert.equal(result.length, 4, `fator "${result}" não tem 4 dígitos para ${d.toISOString()}`);
    }
  });

  it('deve retornar apenas dígitos (sem letras ou caracteres especiais)', () => {
    const result = fatorVencimento(new Date('2026-05-17T00:00:00.000Z'));
    assert.match(result, /^\d{4}$/);
  });
});

describe('Unit › FEBRABAN › linhaDigitavelPadrao', () => {
  // ─── Testes Positivos ─────────────────────────────────

  it('deve formatar linha digitável corretamente para Bradesco', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);

    assert.equal(resultado, '23791.22928 51234.567892 01000.046902 7 14490000015990');
  });

  it('deve formatar linha digitável corretamente para Santander', () => {
    const codBarras = '03397144900000015009640415400000123456790102';
    const resultado = linhaDigitavelPadrao(codBarras);

    assert.equal(resultado, '03399.64041 15400.000129 34567.901029 7 14490000001500');
  });

  it('deve produzir linha com exatamente 54 caracteres', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);

    assert.equal(resultado.length, 54);
  });

  it('deve conter exatamente 4 espaços separando 5 campos', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);
    const campos = resultado.split(' ');

    assert.equal(campos.length, 5);
  });

  it('deve conter exatamente 3 pontos (separadores dos 3 primeiros campos)', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);
    const dots = (resultado.match(/\./g) || []).length;

    assert.equal(dots, 3);
  });

  it('campo 4 deve ser o DV geral (posição 5 do código de barras)', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);
    const campos = resultado.split(' ');

    assert.equal(campos[3], '7');
  });

  it('campo 5 deve conter fator de vencimento + valor (14 dígitos)', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);
    const campos = resultado.split(' ');

    assert.equal(campos[4]!.length, 14);
    assert.match(campos[4]!, /^\d{14}$/);
  });

  it('os 3 primeiros campos devem ter formato XXXXX.YYYYY (5+5 com ponto)', () => {
    const codBarras = '23797144900000159901229251234567890100004690';
    const resultado = linhaDigitavelPadrao(codBarras);
    const campos = resultado.split(' ');

    for (let i = 0; i < 3; i++) {
      assert.match(
        campos[i]!,
        /^\d{5}\.\d{5,6}$/,
        `Campo ${i + 1} com formato inválido: "${campos[i]}"`,
      );
    }
  });
});
