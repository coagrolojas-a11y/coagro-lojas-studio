import { describe, it, expect } from 'vitest';
import { extractPriceFromText } from '../../src/lib/priceParser';

/**
 * Regressões de LACUNAS DE LÓGICA encontradas na validação prática real
 * (sonda reports/probes/probe-logic.ts + respostas HTTP de /api/generate-content).
 *
 * Todos os cenários abaixo retornavam preço ERRADO antes da correção — e o preço
 * sai impresso no cartaz do cliente, então são falhas de negócio, não cosméticas.
 */
describe('extractPriceFromText — regressões da validação real', () => {
  it('não usa o número do modelo como preço quando há preço explícito', () => {
    // ANES: valorPor "20,00" (o "20" de "XP 20" / "20 litros") — preço real 1575 ignorado.
    const r = extractPriceFromText('Pulverizador Jacto XP 20 de 20 litros por R$ 1575,00');
    expect(r.hasPrice).toBe(true);
    expect(r.valorPor).toBe('1.575,00');
    expect(r.valorDe).toBeUndefined();
  });

  it('mantém "de/por" corretos mesmo com marcador forte ("Oferta:") à esquerda', () => {
    // ANTES: valorPor "1.992,00" (o preço DE publicado como promocional).
    const r = extractPriceFromText('Oferta: de R$ 1.992,00 por R$ 1.575,00');
    expect(r.valorDe).toBe('1.992,00');
    expect(r.valorPor).toBe('1.575,00');
  });

  it('não transforma a dosagem de fertilizante (NPK) em preço', () => {
    // ANTES: valorDe "14,00" / valorPor "8,00" — dígitos de "04-14-08".
    const r = extractPriceFromText('Fertilizante 04-14-08 saco 50kg');
    expect(r.hasPrice).toBe(false);
  });

  it('ainda encontra o preço quando grandezas e modelo cercam o valor', () => {
    const r = extractPriceFromText('Ração Premier Pet Golden 15kg por R$ 89,90 a vista');
    expect(r.valorPor).toBe('89,90');
    expect(r.valorDe).toBeUndefined();
  });

  it('não inventa um par DE/POR a partir de número de modelo', () => {
    // ANTES: "XP 20" era promovido a "de" e R$ 1575 a "por" (par de mentira).
    const r = extractPriceFromText('Pulverizador XP 20 por R$ 1575,00');
    expect(r.valorPor).toBe('1.575,00');
    expect(r.valorDe).toBeUndefined();
  });
});
