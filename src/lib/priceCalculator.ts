/**
 * Utilitário de cálculo de desconto e economia para o Coagro Studio
 */

export interface DiscountInfo {
  percent: number;
  savingsBrl: string;
  badgeText: string;
}

export function parseBrlToCents(valStr?: string | null): number | null {
  if (!valStr?.trim()) return null;

  const clean = valStr.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
  let integerPart = '';
  let decimalPart = '';

  if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(clean) ||
      /^\d+,\d{1,2}$/.test(clean)) {
    const [integer, decimal] = clean.split(',');
    integerPart = integer.replace(/\./g, '');
    decimalPart = decimal.padEnd(2, '0');
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(clean)) {
    integerPart = clean.replace(/\./g, '');
  } else if (/^\d+(?:\.\d{1,2})?$/.test(clean)) {
    const [integer, decimal = ''] = clean.split('.');
    integerPart = integer;
    decimalPart = decimal.padEnd(2, '0');
  } else if (/^\d+$/.test(clean)) {
    integerPart = clean;
  } else {
    return null;
  }

  const cents = Number(integerPart) * 100 + Number(decimalPart || '00');
  return Number.isSafeInteger(cents) ? cents : null;
}

/**
 * Converte string de preço em formato brasileiro (ex: "58,00", "R$ 1.250,90") para número float.
 */
export function parseBrlToNumber(valStr?: string | null): number {
  const cents = parseBrlToCents(valStr);
  return cents === null ? 0 : cents / 100;
}

/**
 * Calcula percentual de desconto e valor economizado a partir dos valores DE e POR.
 */
export function calculateDiscount(valorDeStr?: string, valorPorStr?: string): DiscountInfo | null {
  const deCents = parseBrlToCents(valorDeStr);
  const porCents = parseBrlToCents(valorPorStr);

  if (deCents === null || porCents === null || deCents <= 0 || porCents <= 0 || deCents <= porCents) {
    return null;
  }

  const percent = Math.round(((deCents - porCents) / deCents) * 100);
  const savingsCents = deCents - porCents;
  const savingsInteger = Math.floor(savingsCents / 100).toLocaleString('pt-BR');
  const savingsDecimal = String(savingsCents % 100).padStart(2, '0');
  const diff = `${savingsInteger},${savingsDecimal}`;

  if (percent <= 0) return null;

  return {
    percent,
    savingsBrl: diff,
    badgeText: `${percent}% OFF`
  };
}
