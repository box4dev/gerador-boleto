export function mod11(num: string, base = 9, r: 0 | 1 = 0): number {
  let soma = 0;
  let fator = 2;

  for (let i = num.length - 1; i >= 0; i--) {
    const digito = Number(num[i]);
    soma += digito * fator;
    fator = fator === base ? 2 : fator + 1;
  }

  if (r === 0) {
    soma *= 10;
    const digito = soma % 11;
    return digito === 10 ? 0 : digito;
  }
  return soma % 11;
}

export function mod10(num: string): number {
  let total = 0;
  let fator = 2;

  for (let i = num.length - 1; i >= 0; i--) {
    const produto = Number(num[i]) * fator;
    total += produto > 9 ? produto - 9 : produto;
    fator = fator === 2 ? 1 : 2;
  }

  const resto = total % 10;
  return resto === 0 ? 0 : 10 - resto;
}
