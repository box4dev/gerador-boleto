/**
 * Uso: pnpm build && node examples/test-bradesco.mjs
 */
import { gerarBoleto } from '../dist/index.js';

console.log(JSON.stringify(gerarBoleto(), null, 2));
