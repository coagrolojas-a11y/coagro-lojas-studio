import { describe, expect, it } from 'vitest';
import { validateArtworkForExport } from '../../src/lib/artworkValidation';
import {
  formatOfferDate,
  formatOfferPeriod,
  validateOfferPeriod,
} from '../../src/lib/offerPeriod';

describe('offer period validation', () => {
  it('formats date-only values without UTC day shifts', () => {
    expect(formatOfferDate('2026-10-20')).toBe('20/10/2026');
    expect(formatOfferPeriod({ startDate: '2026-10-20', endDate: '2026-10-25' }))
      .toBe('Oferta válida de 20/10/2026 a 25/10/2026');
  });

  it('blocks invalid dates, reversed ranges, and expired offers', () => {
    expect(validateOfferPeriod(
      { startDate: '2026-02-30', endDate: '' },
      '2026-10-19'
    ).blockers).toContain('A data de início da oferta é inválida.');
    expect(validateOfferPeriod(
      { startDate: '2026-10-25', endDate: '2026-10-20' },
      '2026-10-19'
    ).blockers).toContain('A data de encerramento não pode ser anterior à data de início.');
    expect(validateOfferPeriod(
      { startDate: '2026-10-10', endDate: '2026-10-18' },
      '2026-10-19'
    ).blockers).toContain('Esta oferta venceu. Atualize a data antes de exportar.');
  });

  it('allows an offer without an end date but returns a reminder', () => {
    const result = validateArtworkForExport({
      title: 'Produto',
      priceTo: '44,00',
      offerPeriod: { startDate: '', endDate: '' },
    }, '2026-10-19');

    expect(result.blockers).toEqual([]);
    expect(result.warnings).toContain(
      'Considere informar a vigência final da oferta antes de divulgar a peça.'
    );
  });

  it('blocks inconsistent or invalid prices and missing poster prices', () => {
    const base = {
      title: 'Produto',
      offerPeriod: { startDate: '', endDate: '' },
      requirePrice: true,
    };
    expect(validateArtworkForExport({ ...base, priceFrom: '40,00', priceTo: '50,00' }).blockers)
      .toContain('O preço promocional não pode ser maior que o preço original.');
    expect(validateArtworkForExport({ ...base, priceFrom: '50,00', priceTo: '50,00' }).blockers)
      .toContain('Os preços são iguais. Remova o preço original para não anunciar um desconto inexistente.');
    expect(validateArtworkForExport({ ...base, priceTo: 'R$ 40,00abc' }).blockers)
      .toContain('O preço atual deve ser um valor positivo válido.');
    expect(validateArtworkForExport({ ...base, priceTo: '0,00' }).blockers)
      .toContain('O preço atual deve ser um valor positivo válido.');
    expect(validateArtworkForExport(base).blockers)
      .toContain('Informe o preço do produto antes de exportar.');
  });
});
