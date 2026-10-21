/**
 * Parser semântico inteligente para extração de preços e condições de pagamento
 * a partir de comandos e descrições de produtos agrícolas em português.
 *
 * Tratamento robusto de ambiguidades:
 * 1. Ausência de vírgulas: valores sem vírgula são tratados estritamente como inteiros
 *    (ex: 1992 -> 1.992,00 | 1575 -> 1.575,00 | 480 -> 480,00).
 * 2. Presença de vírgula: mantém o valor decimal exato com centavos informados
 *    (ex: 1575,50 -> 1.575,50 | 45,90 -> 45,90).
 * 3. Descrições com múltiplos valores: isola e descarta especificações técnicas
 *    (ex: 2HP, 220V, 30L, 50kg, 16 pol, 3500rpm, TR30, XP16, ano 2024).
 * 4. 'De / Por' invertidos ou na ordem inversa:
 *    A diferenciação de 'preço de' e 'preço por' é realizada por contexto semântico
 *    (palavras-chave como "era", "antes", "de tabela", "por", "apenas", "sai por")
 *    e validada pela regra de coerência comercial (o preço original DE é sempre superior ao POR).
 */

export interface ExtractedPriceInfo {
  hasPrice: boolean;
  valorDe?: string;
  valorPor?: string;
  condicoes?: string;
}

interface PriceCandidate {
  raw: string;
  normalizedBrl: string;
  floatValue: number;
  hasComma: boolean;
  startIndex: number;
  endIndex: number;
  semanticRole: 'DE' | 'POR' | 'PARCELA' | 'NEUTRO';
  deScore: number;
  porScore: number;
  isInstallment: boolean;
}

/**
 * Converte qualquer representação de preço BRL em número float para cálculo e ordenação.
 */
export function parsePriceToFloat(priceStr?: string | null): number {
  if (!priceStr || typeof priceStr !== 'string') return 0;
  const clean = priceStr
    .replace(/r\$\s*/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}

/**
 * Normaliza valores de preço seguindo a regra estrita da Coagro:
 * - Sem vírgula: considera como inteiro com ,00 no final (ex: 1992 -> 1.992,00 | 3890 -> 3.890,00 | 39 -> 39,00)
 * - Com vírgula: considera o valor decimal exato (ex: 3190,50 -> 3.190,50 | 45,9 -> 45,90)
 */
export function normalizeAgroPrice(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const str = raw.trim().replace(/^r\$\s*/i, '').trim();
  if (!str) return '';

  // 1. Caso possua vírgula: mantém o valor decimal exato com 2 casas
  if (str.includes(',')) {
    const parts = str.split(',');
    const intDigits = parts[0].replace(/\D/g, '');
    let decDigits = parts[1].replace(/\D/g, '');

    if (decDigits.length === 0) decDigits = '00';
    else if (decDigits.length === 1) decDigits = decDigits + '0';
    else decDigits = decDigits.slice(0, 2);

    const intNum = Number(intDigits || 0);
    const formattedInt = intNum.toLocaleString('pt-BR');
    return `${formattedInt},${decDigits}`;
  }

  // 2. Caso possua ponto sem vírgula:
  if (str.includes('.')) {
    const parts = str.split('.');
    // Ponto como decimal americano explícito (ex: 1575.50 ou 45.9)
    if (parts.length === 2 && parts[1].length <= 2 && Number(parts[0]) < 100000) {
      const intDigits = parts[0].replace(/\D/g, '');
      let decDigits = parts[1].replace(/\D/g, '');
      if (decDigits.length === 1) decDigits = decDigits + '0';
      if (decDigits.length === 0) decDigits = '00';

      const formattedInt = Number(intDigits || 0).toLocaleString('pt-BR');
      return `${formattedInt},${decDigits}`;
    }

    // Ponto como milhar em PT-BR (ex: 1.992 ou 3.890) -> tratado como INTEIRO com ,00
    const allDigits = str.replace(/\D/g, '');
    if (!allDigits) return '';
    const formattedInt = Number(allDigits).toLocaleString('pt-BR');
    return `${formattedInt},00`;
  }

  // 3. Caso NÃO possua vírgula nem ponto: tratado estritamente como INTEIRO com ,00
  const allDigits = str.replace(/\D/g, '');
  if (!allDigits) return '';
  const formattedInt = Number(allDigits).toLocaleString('pt-BR');
  return `${formattedInt},00`;
}

/**
 * Cria uma máscara de caracteres para substituir tokens técnicos e de modelo por espaços,
 * mantendo o comprimento exato da string para que os índices posicionais permaneçam válidos.
 */
function maskNonPriceSegments(text: string): string {
  let masked = text;

  // 1. Unidades técnicas e grandezas físicas (ex: 2HP, 2 HP, 220V, 30L, 50kg, 16L, 3500rpm, etc.)
  const techRegex = /\b\d+(?:[.,]\d+)?\s*(?:hp|cv|w|kw|v|volts|kg|g|t|ton|l|litros|ml|mm|cm|m|metros|km|pol|polegadas|rpm|bar|psi|doses|un|unidades|peças|bicos|facas|martelos|sacas|sc|ha|hectares|kg\/h|l\/min|km\/h|meses|dias|anos|horas|min)\b/gi;
  masked = masked.replace(techRegex, (match) => ' '.repeat(match.length));

  // 2. Códigos e referências de modelo (ex: TR30, TR-30, XP16, GT50, B4T, PRO20, etc.)
  const modelCodeRegex = /\b[a-z]{1,4}[-_]?\d{1,4}[a-z]?\b/gi;
  masked = masked.replace(modelCodeRegex, (match) => ' '.repeat(match.length));

  // 3. Relações/dosagens de fertilizante e químicos (ex: 04-14-08, 20-00-20).
  // DEFEITO CORRIGIDO: sem esta máscara, "Fertilizante 04-14-08 saco 50kg"
  // gerava valorDe "14,00" / valorPor "8,00" — os dígitos da dosagem NPK viravam
  // preço promocional na arte.
  const npkRegex = /\b\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2}\b/g;
  masked = masked.replace(npkRegex, (match) => ' '.repeat(match.length));

  // 4. Prefixos explícitos de modelo (ex: modelo 2024, mod 30, ref 15)
  const modelPrefixRegex = /\b(?:modelo|mod|ref|tipo|c[oó]digo|vers[aã]o|s[eé]rie)\s*[:#-]?\s*\d+\b/gi;
  masked = masked.replace(modelPrefixRegex, (match) => ' '.repeat(match.length));

  // 5. Anos de fabricação ou safras (ex: ano 2024, 2023/2024, safra 24)
  const yearRegex = /\b(?:ano|fabrica[cç][aã]o|safra)\s*[:#-]?\s*(?:19|20)\d{2}\b/gi;
  masked = masked.replace(yearRegex, (match) => ' '.repeat(match.length));

  // 6. Multiplicadores de parcelamento (ex: "10x", "10x de", "12 x sem juros").
  //
  // DEFEITO CORRIGIDO: o multiplicador NÃO é preço. Sem esta máscara, em
  // "10x de 180" o parser descartava corretamente o VALOR da parcela (180, via
  // `installmentPrice`) mas promovia o MULTIPLICADOR (10) a preço principal —
  // produzindo "valorPor: 10,00", um preço inexistente no texto.
  //
  // O valor da parcela continua sendo extraído por `extractPaymentConditions`
  // para compor a condição ("EM 10X DE R$ 180,00").
  const installmentMultiplierRegex = /\b\d{1,2}\s*[xX](?:\s*de)?\b/gi;
  masked = masked.replace(installmentMultiplierRegex, (match) => ' '.repeat(match.length));

  return masked;
}

/**
 * Extrai condições de pagamento (ex: "em até 10x sem juros", "10x de R$ 175", "à vista no pix").
 */
function extractPaymentConditions(text: string): { condicoes?: string; installmentPrice?: number } {
  let condicoes = '';
  let installmentPrice: number | undefined;

  // Parcelamento com valor (ex: "10x de 175" ou "10x de R$ 175,00")
  const instWithValMatch = text.match(/(?:em\s+)?(\d+\s*x)\s+de\s+(?:r\$)?\s*([\d]+(?:[.,]\d{1,2})?)/i);
  if (instWithValMatch) {
    const times = instWithValMatch[1].toUpperCase().trim();
    const instVal = normalizeAgroPrice(instWithValMatch[2]);
    installmentPrice = parsePriceToFloat(instVal);
    condicoes = `EM ${times} DE R$ ${instVal}`;
    if (/sem\s+juros/i.test(text)) condicoes += ' SEM JUROS';
    return { condicoes, installmentPrice };
  }

  // Parcelamento sem valor explícito (ex: "em até 10x sem juros" ou "em 6x no cartão")
  const instMatch = text.match(/(?:em\s+)?(?:at[ée]\s+)?\d+\s*x(?:\s+sem\s+juros|\s+no\s+cart[ãa]o)?/i);
  if (instMatch) {
    condicoes = instMatch[0].toUpperCase().trim();
    return { condicoes };
  }

  // Condições à vista / pix
  const vistaMatch = text.match(/[aà]\s*vista(?:\s+no\s+dinheiro|\s+no\s+pix|\s+no\s+boleto)?|no\s+pix/i);
  if (vistaMatch) {
    condicoes = vistaMatch[0].toUpperCase().trim();
    return { condicoes };
  }

  return {};
}

/**
 * Extrai preços e diferencia semântica entre "preço de" e "preço por".
 */
export function extractPriceFromText(text?: string | null): ExtractedPriceInfo {
  if (!text || typeof text !== 'string') {
    return { hasPrice: false };
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return { hasPrice: false };
  }

  // 1. Extração de Condições de Pagamento e identificação do valor da parcela
  const { condicoes, installmentPrice } = extractPaymentConditions(cleanText);

  // 2. Máscara de grandezas e modelos para isolar números que realmente são preços
  const maskedText = maskNonPriceSegments(cleanText);

  // 3. Varredura semântica de todos os números candidatos no texto mascarado
  // Ignora se estiver imediatamente seguido por % ou OFF%
  //
  // ORDEM DAS ALTERNATIVAS IMPORTA (defeito corrigido):
  // a alternativa de milhar vem primeiro para casar "1.992,00" por inteiro;
  // a de dígitos simples vem depois para casar "1992" por inteiro.
  // Antes, `\d{1,3}(?:\.\d{3})*…` (com `*`) casava apenas "199" de "1992" e a
  // segunda alternativa nunca era tentada — truncando todo valor de 4+ dígitos
  // sem separador de milhar. Ex.: "de 1575 por 1992" produzia 157/199.
  const candidateRegex = /(?:r\$\s*)?((?:\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?|\d{1,9}(?:[.,]\d{1,2})?)(?!\s*%)/gi;
  let match: RegExpExecArray | null;
  const candidates: PriceCandidate[] = [];

  while ((match = candidateRegex.exec(maskedText)) !== null) {
    const rawMatch = match[1];
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    // Regra estrita de vírgula: se não tem vírgula, trata como inteiro
    const hasComma = rawMatch.includes(',');
    const normalizedBrl = normalizeAgroPrice(rawMatch);
    const floatValue = parsePriceToFloat(normalizedBrl);

    if (floatValue <= 0) continue;

    // Se o valor coincidir exatamente com o valor de uma parcela (ex: 180 em "10x de 180"), descarta
    if (installmentPrice && Math.abs(floatValue - installmentPrice) < 0.05) {
      continue;
    }

    // Janela semântica ao redor do número: 35 caracteres antes e 25 depois
    const windowBefore = cleanText.slice(Math.max(0, startIndex - 35), startIndex).toLowerCase();
    const windowAfter = cleanText.slice(endIndex, Math.min(cleanText.length, endIndex + 25)).toLowerCase();

    let deScore = 0;
    let porScore = 0;

    // DEFEITO CORRIGIDO — marcador IMEDIATO tem precedência absoluta.
    // Em "Oferta: de R$ 1.992,00 por R$ 1.575,00" a palavra "oferta" ficava a
    // ~20 caracteres do primeiro valor e somava +15 no score "POR", enquanto o
    // "de R$" logo à esquerda somava só +10 — o primeiro valor era classificado
    // como POR e a arte saía com R$ 1.992,00 como preço promocional (26% acima
    // do real). O marcador colado no número é inambíguo e decide sozinho.
    const immediateDe = /\bde\b\s*[:]?\s*(?:r\$)?\s*$/.test(windowBefore);
    const immediatePor = /\bpor\b\s*[:]?\s*(?:r\$)?\s*$/.test(windowBefore);

    if (immediateDe) {
      deScore += 20;
    } else if (immediatePor) {
      porScore += 20;
    } else {
      // Marcadores Semânticos de Preço Original ("DE"):
      // Forte: "era", "custava", "antes", "de tabela", "tabela", "original"
      if (/\b(?:era|custava|antes|de\s+tabela|tabela|original|pre[çc]o\s+antigo|pre[çc]o\s+normal)\b/.test(windowBefore)) {
        deScore += 15;
      } else if (/\bde\b/.test(windowBefore)) {
        deScore += 5;
      }

      // Marcadores Semânticos de Preço Promocional ("POR"):
      // Forte: "sai por", "agora", "apenas", "promoção", "promocional", "à vista", "no pix", "pague"
      if (/\b(?:sai\s+por|agora|apenas|promo[çc][ãa]o|promocional|oferta|[aà]\s*vista|no\s+pix|pague\s+apenas|desconto)\b/.test(windowBefore)) {
        porScore += 15;
      } else if (/\bpor\b/.test(windowBefore)) {
        porScore += 5;
      }
    }

    // Marcadores no sufixo pós-número (ex: "1575 à vista", "1992 de tabela")
    if (/^[,\s]*(?:[aà]\s*vista|no\s+pix|apenas|promocional)/.test(windowAfter)) {
      porScore += 10;
    }
    if (/^[,\s]*(?:de\s+tabela|original)/.test(windowAfter)) {
      deScore += 10;
    }

    let semanticRole: 'DE' | 'POR' | 'PARCELA' | 'NEUTRO' = 'NEUTRO';
    if (deScore > porScore && deScore >= 5) semanticRole = 'DE';
    else if (porScore > deScore && porScore >= 5) semanticRole = 'POR';

    candidates.push({
      raw: rawMatch,
      normalizedBrl,
      floatValue,
      hasComma,
      startIndex,
      endIndex,
      semanticRole,
      deScore,
      porScore,
      isInstallment: false,
    });
  }

  if (candidates.length === 0) {
    return { hasPrice: false };
  }

  // 4. Resolução de Papéis ('DE' vs 'POR'):
  if (candidates.length >= 2) {
    const explicitPor = candidates.find((c) => c.semanticRole === 'POR');
    const explicitDe = candidates.find((c) => c.semanticRole === 'DE');
    const sorted = [...candidates].sort((a, b) => b.floatValue - a.floatValue);

    let finalPor = explicitPor;
    let finalDe = explicitDe;

    // Pareamento auxiliar: só quando um lado é explícito e existe um candidato
    // verdadeiramente compatível. DEFEITO CORRIGIDO: antes, `finalDe = sorted[0]`
    // podia apontar para o MESMO candidato de `finalPor` (ou para um número de
    // modelo como "XP 20"), e o par resultante virava um preço inventado.
    if (!finalDe && finalPor) {
      finalDe = sorted.find((c) => c !== finalPor && c.floatValue > finalPor!.floatValue);
    }
    if (!finalPor && finalDe) {
      finalPor = sorted.find((c) => c !== finalDe && c.floatValue < finalDe!.floatValue);
    }

    // Nenhum marcador semântico: assume os 2 maiores distintos (comportamento histórico).
    if (!finalDe && !finalPor) {
      finalDe = sorted[0];
      finalPor = sorted.find((c) => c.floatValue !== finalDe!.floatValue) || sorted[1];
    }

    if (finalDe && finalPor && finalDe !== finalPor && finalDe.floatValue !== finalPor.floatValue) {
      // Regra de Coerência Comercial:
      // O maior valor é SEMPRE o preço original ("DE") e o menor é SEMPRE o promocional ("POR")
      const isHigherDe = finalDe.floatValue > finalPor.floatValue;
      const higher = isHigherDe ? finalDe.normalizedBrl : finalPor.normalizedBrl;
      const lower = isHigherDe ? finalPor.normalizedBrl : finalDe.normalizedBrl;

      return {
        hasPrice: true,
        valorDe: higher,
        valorPor: lower,
        condicoes: condicoes || undefined,
      };
    }
  }

  // Cenário C: Apenas um preço comercial identificado.
  // DEFEITO CORRIGIDO: usava `candidates[0]` (o primeiro número na ORDEM DO TEXTO),
  // então "Pulverizador Jacto XP 20 de 20 litros por R$ 1575,00" devolvia
  // valorPor "20,00" — o "20" do modelo, e não o preço. Agora o candidato com
  // papel semântico tem prioridade sobre a posição no texto.
  const single =
    candidates.find((c) => c.semanticRole === 'POR') ||
    candidates.find((c) => c.semanticRole === 'DE') ||
    candidates[0];
  if (single) {
    return {
      hasPrice: true,
      valorDe: undefined,
      valorPor: single.normalizedBrl,
      condicoes: condicoes || undefined,
    };
  }

  return { hasPrice: false };
}
