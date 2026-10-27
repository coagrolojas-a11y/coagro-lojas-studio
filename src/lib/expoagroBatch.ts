import type { BatchItem } from '../components/ExcelBatchUploader';
import { EXPOAGRO_ITEMS } from '../data/expoagroPreset';
import { sanitizeErpTitle } from './erpSanitizer';

/**
 * Converte a tabela fixa da Expoagro em itens do Lote (Simples).
 *
 * Todos entram marcados, como na importação de planilha. O código se repete em
 * alguns itens (lotes diferentes), por isso o `id` é pelo índice da linha.
 */
export function buildExpoagroBatchItems(sanitizeTitles: boolean): BatchItem[] {
  return EXPOAGRO_ITEMS.map((item, index) => ({
    id: `expoagro-${index + 1}`,
    codigo: item.codigo,
    rawTitulo: item.titulo,
    titulo: sanitizeTitles ? sanitizeErpTitle(item.titulo) : item.titulo,
    valorDe: '',
    valorPor: item.valorPor,
    selected: true,
  }));
}
