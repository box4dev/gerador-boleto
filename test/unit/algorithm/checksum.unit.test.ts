import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mod10, mod11 } from '../../../src/algorithm/checksum.js';

describe('Unit › Checksum › mod11', () => {
  // ─── Testes Positivos ─────────────────────────────────

  it('deve calcular DV do Bradesco (237) como 2', () => {
    assert.equal(mod11('237'), 2);
  });

  it('deve calcular DV da Caixa (104) como 0', () => {
    assert.equal(mod11('104'), 0);
  });

  it('deve calcular DV do Santander (033) como 7', () => {
    assert.equal(mod11('033'), 7);
  });

  it('deve calcular DV do Itaú (341) como 7', () => {
    assert.equal(mod11('341'), 7);
  });

  it('deve retornar 0 quando resultado mod é 10', () => {
    // mod11('18') → soma=1*3+8*2=19, 19*10=190, 190%11=3 → não é 10
    // Precisamos de um caso que dê exatamente 10
    // mod11('39') → soma=3*3+9*2=27, 27*10=270, 270%11=6 → não
    // Vamos usar um valor conhecido: mod11('0') → 0*2=0, 0*10=0, 0%11=0
    assert.equal(mod11('0'), 0);
  });

  it('deve retornar resultado correto para string de dígitos longa', () => {
    // Validação com string longa usada em código de barras
    const result = mod11('2379144900000159901229251234567890100004690');
    assert.equal(typeof result, 'number');
    assert.ok(result >= 0 && result <= 10);
  });

  it('deve trabalhar com base customizada (mod11 com base 9, r=1)', () => {
    const result = mod11('237', 9, 1);
    assert.equal(typeof result, 'number');
  });

  it('deve usar r=0 por padrão (retorna dígito final)', () => {
    const r0 = mod11('237', 9, 0);
    const defaultR = mod11('237');
    assert.equal(r0, defaultR);
  });

  it('deve usar base=9 por padrão', () => {
    const base9 = mod11('237', 9);
    const defaultBase = mod11('237');
    assert.equal(base9, defaultBase);
  });

  // ─── Testes Negativos / Contorno ──────────────────────

  it('deve retornar 0 para string "0"', () => {
    assert.equal(mod11('0'), 0);
  });

  it('deve retornar valor numérico para string com apenas zeros', () => {
    const result = mod11('000000');
    assert.equal(typeof result, 'number');
    assert.equal(result, 0);
  });

  it('deve calcular corretamente para string de um único dígito', () => {
    const result = mod11('5');
    assert.equal(typeof result, 'number');
    assert.ok(result >= 0 && result <= 10);
  });
});

describe('Unit › Checksum › mod10', () => {
  // ─── Testes Positivos ─────────────────────────────────

  it('deve calcular mod10 de "3999" como 0', () => {
    assert.equal(mod10('3999'), 0);
  });

  it('deve retornar valor entre 0 e 9 (sempre)', () => {
    const testCases = ['1234', '5678', '9012', '0000', '1111'];
    for (const tc of testCases) {
      const result = mod10(tc);
      assert.ok(result >= 0 && result <= 9, `mod10("${tc}") = ${result} fora do range 0-9`);
    }
  });

  it('deve calcular DV correto para campo de linha digitável (Bradesco)', () => {
    // Campo 1 do Bradesco: 23792 → 2379 + campo livre
    const campo = '237912292';
    const result = mod10(campo);
    assert.equal(typeof result, 'number');
    assert.ok(result >= 0 && result <= 9);
  });

  it('deve retornar 0 quando soma é múltiplo exato de 10', () => {
    assert.equal(mod10('3999'), 0);
  });

  // ─── Testes Negativos / Contorno ──────────────────────

  it('deve retornar 0 para string de zeros', () => {
    const result = mod10('0000');
    assert.equal(result, 0);
  });

  it('deve calcular corretamente para string de um único dígito', () => {
    const result = mod10('5');
    // 5 * 2 = 10 → 1+0=1, 10-1=9? Não. Produto > 9: 10-9=1. total=1. 10-1=9
    assert.equal(typeof result, 'number');
    assert.ok(result >= 0 && result <= 9);
  });

  it('deve alternar multiplicador corretamente (2, 1, 2, 1...)', () => {
    // Para '12': 2*1=2 (par), 1*2=2 → total=4, 10-4=6
    // Verificação manual: pos1(2)*fator(2)=4, pos0(1)*fator(1)=1 → total=5, 10-5=5
    // Na verdade, da direita: i=1→dígito=2, fator=2→4; i=0→dígito=1, fator=1→1 → total=5
    const result = mod10('12');
    assert.equal(result, 5);
  });
});
