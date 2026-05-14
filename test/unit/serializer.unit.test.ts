import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Boleto } from '../../src/boleto.js';
import { serializeBoleto } from '../../src/serializer.js';

describe('Unit › Serializer', () => {
  it('deve remover a referência "bank"', () => {
    const input = {
      banco: 'bradesco',
      dataEmissao: new Date('2026-05-10T00:00:00.000Z'),
      dataVencimento: new Date('2026-05-17T00:00:00.000Z'),
      valorDocumento: 1000,
      nossoNumero: '123',
      agencia: '1',
      codigoCedente: '1',
      carteira: '25',
    } as any;

    const boleto = new Boleto(input);
    const result = serializeBoleto(boleto);

    assert.equal(result.bank, undefined);
  });

  it('deve formatar datas para ISO string', () => {
    const input = {
      banco: 'bradesco',
      dataEmissao: new Date('2026-05-10T00:00:00.000Z'),
      dataVencimento: new Date('2026-05-17T00:00:00.000Z'),
      valorDocumento: 1000,
      nossoNumero: '123',
      agencia: '1',
      codigoCedente: '1',
      carteira: '25',
    } as any;

    const boleto = new Boleto(input);
    const result = serializeBoleto(boleto);

    assert.equal(result.dataEmissao, '2026-05-10T00:00:00.000Z');
    assert.equal(result.dataVencimento, '2026-05-17T00:00:00.000Z');
  });

  it('deve preservar strings, numbers e booleans, e null', () => {
    const boletoFake = {
      texto: 'olá',
      numero: 42,
      booleano: true,
      nulo: null,
      bank: {}, // simulando a property bank
    } as any;

    const result = serializeBoleto(boletoFake);

    assert.equal(result.texto, 'olá');
    assert.equal(result.numero, 42);
    assert.equal(result.booleano, true);
    assert.equal(result.nulo, null);
    assert.equal(result.bank, undefined);
  });

  it('deve ignorar funções', () => {
    const boletoFake = {
      algumaFuncao: () => 'teste',
      valor: 1,
    } as any;

    const result = serializeBoleto(boletoFake);

    assert.equal(result.valor, 1);
    assert.equal(result.algumaFuncao, undefined);
  });

  it('deve ignorar prototype e constructor', () => {
    const boletoFake = {
      __proto__: {},
      prototype: {},
      constructor: function () {},
      valor: 1,
    } as any;

    const result = serializeBoleto(boletoFake);

    assert.equal(result.valor, 1);
    assert.equal(Object.keys(result).includes('__proto__'), false);
    assert.equal(Object.keys(result).includes('prototype'), false);
    assert.equal(Object.keys(result).includes('constructor'), false);
  });
});
