import { parseBrlToCents } from './priceCalculator';
import { OfferPeriod, validateOfferPeriod } from './offerPeriod';

export interface ArtworkValidationInput {
  title: string;
  priceFrom?: string;
  priceTo?: string;
  offerPeriod: OfferPeriod;
  requirePrice?: boolean;
}

export function validateArtworkForExport(
  input: ArtworkValidationInput,
  today?: string
): { blockers: string[]; warnings: string[] } {
  const { blockers, warnings } = validateOfferPeriod(input.offerPeriod, today);
  const from = input.priceFrom?.trim() || '';
  const to = input.priceTo?.trim() || '';

  if (!input.title.trim()) blockers.push('Informe o nome do produto antes de exportar.');
  if (input.requirePrice && !to) blockers.push('Informe o preço do produto antes de exportar.');
  if (from && !to) blockers.push('Informe o preço promocional ou remova o preço original.');
  const currentPriceCents = to ? parseBrlToCents(to) : null;
  const originalPriceCents = from ? parseBrlToCents(from) : null;
  if (to && (currentPriceCents === null || currentPriceCents <= 0)) {
    blockers.push('O preço atual deve ser um valor positivo válido.');
  }
  if (from && (originalPriceCents === null || originalPriceCents <= 0)) {
    blockers.push('O preço original deve ser um valor positivo válido.');
  }

  if (from && to) {
    const fromCents = parseBrlToCents(from);
    const toCents = parseBrlToCents(to);
    if (fromCents !== null && toCents !== null && fromCents <= toCents) {
      blockers.push(
        fromCents === toCents
          ? 'Os preços são iguais. Remova o preço original para não anunciar um desconto inexistente.'
          : 'O preço promocional não pode ser maior que o preço original.'
      );
    }
  }

  if (to && !input.offerPeriod.endDate && !warnings.some((warning) => warning.includes('data final'))) {
    warnings.push('Considere informar a vigência final da oferta antes de divulgar a peça.');
  }

  return { blockers, warnings };
}
