import { describe, expect, it } from 'vitest';
import {
  EXPOAGRO_HEADER_TEXT,
  EXPOAGRO_ITEMS,
  EXPOAGRO_PERIOD,
} from '../../src/data/expoagroPreset';
import { buildExpoagroBatchItems } from '../../src/lib/expoagroBatch';
import { shouldApplyExpoagroPeriod } from '../../src/lib/expoagroOffer';
import { sanitizeErpTitle } from '../../src/lib/erpSanitizer';

describe('tabela Expoagro', () => {
  it('traz os 116 itens da tabela, com preço no formato brasileiro', () => {
    expect(EXPOAGRO_ITEMS).toHaveLength(116);
    for (const item of EXPOAGRO_ITEMS) {
      expect(item.codigo).toMatch(/^\d+$/);
      expect(item.titulo.trim()).not.toBe('');
      expect(item.valorPor).toMatch(/^\d{1,3}(?:\.\d{3})*,\d{2}$/);
    }
  });

  it('mantém códigos repetidos como linhas separadas (lotes com preços diferentes)', () => {
    const banamine = EXPOAGRO_ITEMS.filter((item) => item.codigo === '1393');
    expect(banamine).toHaveLength(2);
    expect(new Set(banamine.map((item) => item.valorPor)).size).toBe(2);
  });

  it('fixa a vigência e o título da oferta', () => {
    expect(EXPOAGRO_HEADER_TEXT).toBe('EXPOAGRO');
    expect(EXPOAGRO_PERIOD).toEqual({
      startDate: '2026-10-26',
      endDate: '2026-11-01',
    });
  });
});

describe('buildExpoagroBatchItems', () => {
  it('converte todos os itens já marcados, sem preço "De"', () => {
    const items = buildExpoagroBatchItems(true);
    expect(items).toHaveLength(116);
    expect(new Set(items.map((item) => item.id)).size).toBe(116);
    for (const item of items) {
      expect(item.selected).toBe(true);
      expect(item.valorDe).toBe('');
      expect(item.valorPor).toMatch(/,\d{2}$/);
      expect(item.rawTitulo).toBeTruthy();
    }
  });

  it('aplica a higienização de ERP só quando pedido', () => {
    const sanitized = buildExpoagroBatchItems(true);
    const raw = buildExpoagroBatchItems(false);

    expect(sanitized[0].titulo).toBe(sanitizeErpTitle(EXPOAGRO_ITEMS[0].titulo));
    expect(raw[0].titulo).toBe(EXPOAGRO_ITEMS[0].titulo);
    expect(raw[0].rawTitulo).toBe(EXPOAGRO_ITEMS[0].titulo);
  });
});

describe('shouldApplyExpoagroPeriod', () => {
  it('aplica quando a vigência ainda está em aberto', () => {
    expect(shouldApplyExpoagroPeriod({ startDate: '2026-10-27', endDate: '' })).toBe(true);
  });

  it('aplica quando já é exatamente a vigência da Expoagro', () => {
    expect(shouldApplyExpoagroPeriod({ ...EXPOAGRO_PERIOD })).toBe(true);
  });

  it('não sobrescreve uma vigência personalizada', () => {
    expect(shouldApplyExpoagroPeriod({
      startDate: '2026-10-20',
      endDate: '2026-10-25',
    })).toBe(false);
  });
});
