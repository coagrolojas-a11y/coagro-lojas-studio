"""
Gera src/data/expoagroPreset.ts a partir da tabela em PDF da Expoagro.

Origem: public/expoagro/PREÇOS_EXPOAGRO.pdf
Uso (só quando a tabela mudar):
    pip install pypdf
    python scripts/extrair-expoagro.py

O app não lê PDF em runtime: este script roda uma vez e versiona o resultado.
"""

import os
import re

from pypdf import PdfReader

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PDF_PATH = os.path.join(ROOT, 'public', 'expoagro', 'PREÇOS_EXPOAGRO.pdf')
OUT_PATH = os.path.join(ROOT, 'src', 'data', 'expoagroPreset.ts')

ROW_RE = re.compile(r'^(\d+)\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})$')


def extract_rows():
    rows = []
    reader = PdfReader(PDF_PATH)
    for page in reader.pages:
        text = page.extract_text() or ''
        for line in text.splitlines():
            match = ROW_RE.match(line.strip())
            if not match:
                continue
            codigo, titulo, preco = match.group(1), match.group(2).strip(), match.group(3)
            titulo = re.sub(r'\s+R\$$', '', titulo)
            rows.append((codigo, titulo, preco))
    return rows


def ts_string(value):
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main():
    rows = extract_rows()
    if not rows:
        raise SystemExit('Nenhum item encontrado no PDF.')

    lines = [
        '/**',
        ' * Tabela "PREÇOS EXPOAGRO" usada no preset do Lote (Simples).',
        ' *',
        ' * Origem: public/expoagro/PREÇOS_EXPOAGRO.pdf (6 páginas).',
        ' * Regenerar: python scripts/extrair-expoagro.py',
        ' */',
        "import type { OfferPeriod } from '../lib/offerPeriod';",
        '',
        'export interface ExpoagroItem {',
        '  codigo: string;',
        '  titulo: string;',
        '  valorPor: string;',
        '}',
        '',
        'export const EXPOAGRO_ITEMS: ExpoagroItem[] = [',
    ]
    for codigo, titulo, preco in rows:
        lines.append(
            f'  {{ codigo: {ts_string(codigo)}, titulo: {ts_string(titulo)}, valorPor: {ts_string(preco)} }},'
        )
    lines += [
        '];',
        '',
        "export const EXPOAGRO_HEADER_TEXT = 'EXPOAGRO';",
        '',
        '/** Vigência fixa da oferta Expoagro 2026. */',
        'export const EXPOAGRO_PERIOD: OfferPeriod = {',
        "  startDate: '2026-10-26',",
        "  endDate: '2026-11-01',",
        '};',
        '',
    ]

    with open(OUT_PATH, 'w', encoding='utf-8', newline='\n') as handle:
        handle.write('\n'.join(lines))

    print(f'{len(rows)} itens gravados em {OUT_PATH}')


if __name__ == '__main__':
    main()
