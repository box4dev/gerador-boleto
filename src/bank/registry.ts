import type { BankId, BankModule } from '../types.js';
import { bradesco } from './bradesco.js';
import { caixa } from './caixa.js';
import { itau } from './itau.js';
import { santander } from './santander.js';

export const banks: Record<BankId, BankModule> = {
  bradesco,
  santander,
  caixa,
  itau,
};

export function getBank(id: string): BankModule | undefined {
  return banks[id as BankId];
}
