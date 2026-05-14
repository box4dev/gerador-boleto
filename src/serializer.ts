import type { Boleto } from './boleto.js';
import type { BoletoJsonOutput } from './types.js';

/** Converte instância de Boleto em objeto JSON-serializável (sem referência ao módulo do banco). */
export function serializeBoleto(boleto: Boleto): BoletoJsonOutput {
  const out: BoletoJsonOutput = {};
  const raw = boleto as unknown as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (key === 'bank') {
      continue;
    }
    if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
      continue;
    }
    const v = raw[key];
    if (typeof v === 'function') {
      continue;
    }
    if (v instanceof Date) {
      out[key] = v.toISOString();
    } else if (
      v === null ||
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    ) {
      out[key] = v;
    }
  }
  return out;
}
