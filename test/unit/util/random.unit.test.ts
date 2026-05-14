import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { randomInt } from '../../../src/util/random.js';
import type { Rng } from '../../../src/util/random.js';

describe('Unit › Util › randomInt', () => {
  // ─── Testes Positivos ─────────────────────────────────

  it('deve retornar valor dentro do range [min, max]', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(1, 10);
      assert.ok(result >= 1 && result <= 10, `${result} fora do range [1, 10]`);
    }
  });

  it('deve retornar min quando min === max', () => {
    assert.equal(randomInt(5, 5), 5);
  });

  it('deve retornar inteiro (sem decimais)', () => {
    for (let i = 0; i < 20; i++) {
      const result = randomInt(1, 100);
      assert.equal(result, Math.floor(result));
    }
  });

  it('deve aceitar valores negativos', () => {
    const result = randomInt(-10, -1);
    assert.ok(result >= -10 && result <= -1);
  });

  it('deve aceitar range cruzando zero', () => {
    const result = randomInt(-5, 5);
    assert.ok(result >= -5 && result <= 5);
  });

  it('deve aceitar Rng customizado (determinístico)', () => {
    const fakeRng: Rng = { next: () => 0.5 };
    const result = randomInt(0, 10, fakeRng);
    // Math.floor(0.5 * (10 - 0 + 1)) + 0 = Math.floor(5.5) = 5
    assert.equal(result, 5);
  });

  it('deve retornar min quando rng.next() retorna 0', () => {
    const fakeRng: Rng = { next: () => 0 };
    assert.equal(randomInt(10, 20, fakeRng), 10);
  });

  it('deve retornar max quando rng.next() retorna ~1', () => {
    const fakeRng: Rng = { next: () => 0.999999 };
    assert.equal(randomInt(10, 20, fakeRng), 20);
  });

  it('deve gerar distribuição que cobre extremos em muitas iterações', () => {
    const results = new Set<number>();
    for (let i = 0; i < 200; i++) {
      results.add(randomInt(1, 3));
    }
    // Com 200 iterações em range [1,3], todos os 3 valores devem aparecer
    assert.ok(results.has(1), 'Valor 1 nunca foi gerado');
    assert.ok(results.has(2), 'Valor 2 nunca foi gerado');
    assert.ok(results.has(3), 'Valor 3 nunca foi gerado');
  });
});
