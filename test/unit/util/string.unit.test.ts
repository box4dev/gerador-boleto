import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { capitalize, onlyDigits, zeroPad } from '../../../src/util/string.js';

describe('Unit › Util › zeroPad', () => {
  it('deve preencher com zeros à esquerda para atingir o comprimento', () => {
    assert.equal(zeroPad(15, 10), '0000000015');
  });

  it('deve manter o valor original quando já tem o comprimento correto', () => {
    assert.equal(zeroPad('12345', 5), '12345');
  });

  it('deve manter o valor original quando excede o comprimento', () => {
    assert.equal(zeroPad('123456', 5), '123456');
  });

  it('deve aceitar número como input', () => {
    assert.equal(zeroPad(42, 5), '00042');
  });

  it('deve aceitar string como input', () => {
    assert.equal(zeroPad('42', 5), '00042');
  });

  it('deve retornar "0" padded para valor 0', () => {
    assert.equal(zeroPad(0, 4), '0000');
  });

  it('deve retornar string de comprimento 1 para length=1', () => {
    assert.equal(zeroPad(5, 1), '5');
  });
});

describe('Unit › Util › onlyDigits', () => {
  it('deve remover caracteres não numéricos de string', () => {
    assert.equal(onlyDigits('12.345-67'), '1234567');
  });

  it('deve retornar string vazia para input sem dígitos', () => {
    assert.equal(onlyDigits('abc'), '');
  });

  it('deve manter string que já contém apenas dígitos', () => {
    assert.equal(onlyDigits('12345'), '12345');
  });

  it('deve aceitar número como input', () => {
    assert.equal(onlyDigits(12345), '12345');
  });

  it('deve remover espaços, pontos e hífens', () => {
    assert.equal(onlyDigits('123 456.789-0'), '1234567890');
  });

  it('deve retornar string vazia para input vazio', () => {
    assert.equal(onlyDigits(''), '');
  });
});

describe('Unit › Util › capitalize', () => {
  it('deve capitalizar a primeira letra', () => {
    assert.equal(capitalize('bradesco'), 'Bradesco');
  });

  it('deve manter string já capitalizada inalterada', () => {
    assert.equal(capitalize('Santander'), 'Santander');
  });

  it('deve lidar com string de um caractere', () => {
    assert.equal(capitalize('a'), 'A');
  });

  it('deve retornar string vazia para input vazio', () => {
    assert.equal(capitalize(''), '');
  });

  it('deve manter restante da string inalterado', () => {
    assert.equal(capitalize('cAIXA'), 'CAIXA');
  });
});
