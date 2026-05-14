const args = process.argv.slice(2);
const type = args[0]; // 'barras' ou 'linha'
const value = args[1];

function modulo10(str) {
  let sum = 0;
  let multiplier = 2;
  for (let i = str.length - 1; i >= 0; i--) {
    let prod = parseInt(str[i]) * multiplier;
    if (prod > 9) prod = Math.floor(prod / 10) + (prod % 10);
    sum += prod;
    multiplier = multiplier === 2 ? 1 : 2;
  }
  const mod = sum % 10;
  let res = 10 - mod;
  if (res === 10) res = 0;
  return res;
}

function modulo11Boleto(str) {
  let sum = 0;
  let multiplier = 2;
  for (let i = str.length - 1; i >= 0; i--) {
    sum += parseInt(str[i]) * multiplier;
    multiplier++;
    if (multiplier > 9) multiplier = 2;
  }
  const mod = sum % 11;
  const res = 11 - mod;
  if (res === 0 || res === 1 || res === 10 || res === 11) return 1;
  return res;
}

if (type === 'barras') {
  if (value.length !== 44) {
    console.error("Código de barras deve ter 44 caracteres.");
    process.exit(1);
  }
  const semDv = value.substring(0, 4) + value.substring(5);
  const dvCalc = modulo11Boleto(semDv);
  console.log(`Código de barras: ${value}`);
  console.log(`DV informado: ${value[4]}`);
  console.log(`DV calculado: ${dvCalc}`);
  console.log(`Válido: ${parseInt(value[4]) === dvCalc}`);
} else if (type === 'linha') {
  // validação da linha digitável (removendo pontos e espaços)
  const linha = value.replace(/[^\d]/g, '');
  if (linha.length !== 47) {
    console.error("Linha digitável deve ter 47 dígitos.");
    process.exit(1);
  }
  const campo1 = linha.substring(0, 9);
  const dv1 = parseInt(linha[9]);
  const calc1 = modulo10(campo1);

  const campo2 = linha.substring(10, 20);
  const dv2 = parseInt(linha[20]);
  const calc2 = modulo10(campo2);

  const campo3 = linha.substring(21, 31);
  const dv3 = parseInt(linha[31]);
  const calc3 = modulo10(campo3);
  
  const dvGeral = parseInt(linha[32]);
  const semDvGeral = linha.substring(0, 4) + linha.substring(32); // this logic for dvGeral might need the actual barcode string, but we can reconstruct it.
  const barcode = linha.substring(0, 3) + linha.substring(3, 4) + linha.substring(32, 33) + linha.substring(33, 47) + linha.substring(4, 9) + linha.substring(10, 20) + linha.substring(21, 31);
  const calcDvGeral = modulo11Boleto(barcode.substring(0, 4) + barcode.substring(5));

  console.log(`Linha Digitável: ${value}`);
  console.log(`Campo 1: DV=${dv1} Calc=${calc1} Válido=${dv1 === calc1}`);
  console.log(`Campo 2: DV=${dv2} Calc=${calc2} Válido=${dv2 === calc2}`);
  console.log(`Campo 3: DV=${dv3} Calc=${calc3} Válido=${dv3 === calc3}`);
  console.log(`DV Geral: DV=${dvGeral} Calc=${calcDvGeral} Válido=${dvGeral === calcDvGeral}`);
}
