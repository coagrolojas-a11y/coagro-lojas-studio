export interface OfferPeriod {
  startDate: string;
  endDate: string;
}

export interface OfferValidationResult {
  blockers: string[];
  warnings: string[];
}

export function getSaoPauloDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || '';

  return `${part('year')}-${part('month')}-${part('day')}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

export function formatOfferDate(value: string): string {
  if (!isValidDate(value)) return '';
  const [, year, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/) || [];
  return `${day}/${month}/${year}`;
}

export function formatOfferPeriod(period?: OfferPeriod): string {
  if (!period) return '';
  const start = period.startDate ? formatOfferDate(period.startDate) : '';
  const end = period.endDate ? formatOfferDate(period.endDate) : '';
  if (start && end) return `Oferta válida de ${start} a ${end}`;
  if (start) return `Oferta válida a partir de ${start}`;
  if (end) return `Oferta válida até ${end}`;
  return '';
}

export function validateOfferPeriod(
  period: OfferPeriod,
  today = getSaoPauloDate()
): OfferValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (period.startDate && !isValidDate(period.startDate)) {
    blockers.push('A data de início da oferta é inválida.');
  }
  if (period.endDate && !isValidDate(period.endDate)) {
    blockers.push('A data de encerramento da oferta é inválida.');
  }
  if (period.endDate && !period.startDate) {
    blockers.push('Informe a data de início para validar o encerramento da oferta.');
  }
  if (
    isValidDate(period.startDate) &&
    isValidDate(period.endDate) &&
    period.endDate < period.startDate
  ) {
    blockers.push('A data de encerramento não pode ser anterior à data de início.');
  }
  if (isValidDate(period.endDate) && period.endDate < today) {
    blockers.push('Esta oferta venceu. Atualize a data antes de exportar.');
  }
  if (period.startDate && !period.endDate && isValidDate(period.startDate)) {
    warnings.push('A oferta está sem data final; confirme que essa condição é adequada.');
  }

  return { blockers, warnings };
}
