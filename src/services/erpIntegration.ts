/**
 * erpIntegration.ts
 * Módulo de integração e sanitização de dados de catálogo e precificação do ERP.
 * 
 * Centraliza o tratamento de entradas brutas provenientes de sistemas de gestão (ERP/NFe)
 * e planilhas de estoque, garantindo que descrições técnicas sejam convertidas para a
 * linguagem comercial padronizada do Grupo Coagro.
 */

import { sanitizeErpTitle } from '../lib/erpSanitizer';
import { formatBrlValue, formatBrlWithSymbol, calculateSavings } from '../lib/priceFormatter';

export interface ErpProductRaw {
  codigo?: string | number;
  descricao: string;
  precoDe?: string | number;
  precoPor: string | number;
  unidade?: string;
}

export interface ErpProductSanitized {
  codigo: string;
  tituloComercial: string;
  valorDe: string;
  valorPor: string;
  descontoPercentual: number;
}

export function parseNumericPrice(val?: string | number | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim().replace(/r\$\s*/gi, '');
  if (!str) return 0;
  const num = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

export function processErpProduct(raw: ErpProductRaw): ErpProductSanitized {
  const tituloComercial = sanitizeErpTitle(raw.descricao || '');
  const precoDeNum = parseNumericPrice(raw.precoDe);
  const precoPorNum = parseNumericPrice(raw.precoPor);
  
  let descontoPercentual = 0;
  if (precoDeNum > precoPorNum && precoDeNum > 0) {
    descontoPercentual = Math.round(((precoDeNum - precoPorNum) / precoDeNum) * 100);
  }

  return {
    codigo: String(raw.codigo || ''),
    tituloComercial,
    valorDe: precoDeNum > 0 ? formatBrlValue(precoDeNum) : '',
    valorPor: precoPorNum > 0 ? formatBrlValue(precoPorNum) : '',
    descontoPercentual,
  };
}

export { sanitizeErpTitle, formatBrlValue, formatBrlWithSymbol, calculateSavings };
