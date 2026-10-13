import type { LogoVariant } from '../assets/coagroLogos';

/**
 * Identificador de escopo/marca oficial do Grupo Coagro.
 * Suporta 'AGRO' e 'PET' para controle de identidade visual e paletas.
 */
export type ScopeId = 'AGRO' | 'PET' | (string & {});

/**
 * Escopos com implementaÃ§Ã£o de marca completa (paleta prÃ³pria + regras de
 * layout). Adicionar um item aqui Ã© o primeiro passo para suportar uma marca
 * nova de ponta a ponta.
 */
export type BrandScope = 'AGRO' | 'PET';

/** Escopo assumido quando nada Ã© informado ou o valor Ã© desconhecido. */
export const DEFAULT_SCOPE: BrandScope = 'AGRO';

/**
 * Normaliza qualquer entrada de escopo para um `BrandScope` conhecido.
 *
 * Aceita variaÃ§Ãµes de caixa/ espaÃ§os ('agro', 'PET ', 'Coagro Pet' nÃ£o Ã©
 * reconhecido de propÃ³sito â€” apenas o id). Valores desconhecidos caem em
 * `DEFAULT_SCOPE` de forma silenciosa e previsÃ­vel.
 */
export function normalizeScopeId(scopeId?: ScopeId | null): BrandScope {
  if (!scopeId) return DEFAULT_SCOPE;
  const normalized = String(scopeId).trim().toUpperCase();
  if (normalized === 'PET') return 'PET';
  if (normalized === 'AGRO') return 'AGRO';
  return DEFAULT_SCOPE;
}

/** Atalho de leitura: o escopo informado Ã© o Pet? */
export function isPetScope(scopeId?: ScopeId | null): boolean {
  return normalizeScopeId(scopeId) === 'PET';
}

/**
 * Marcas que possuem logotipo prÃ³prio (componente dedicado, nÃ£o uma variante
 * da logo Coagro Agro). Quando `true`, o `ArtHeader` ignora `logoVariant` e
 * renderiza a logo da marca.
 */
export function brandHasOwnLogo(scopeId?: ScopeId | null): boolean {
  return isPetScope(scopeId);
}

export interface BrandPalette {
  titleColor: string;
  highlightColor: string;
  subtitleColor: string;
  titleFont: string;
}

/**
 * Paleta de texto por escopo.
 *
 * NOTA (Fase 4): as cores ainda estÃ£o literais aqui em vez de virem de
 * `tenant.config.json`. Centralizar nesta funÃ§Ã£o garante que a migraÃ§Ã£o para
 * configuraÃ§Ã£o por marca aconteÃ§a em UM lugar, sem tocar nos templates.
 */
export function getPalette(scopeId: ScopeId, isLight: boolean = false): BrandPalette {
  if (isPetScope(scopeId)) {
    return {
      titleColor: isLight ? 'text-[#001C71]' : 'text-[#4897D0]',
      highlightColor: 'text-[#E96C2C]',
      subtitleColor: isLight ? 'text-gray-700' : 'text-gray-100',
      titleFont: 'font-exo2 font-black tracking-tight',
    };
  }

  return {
    titleColor: isLight ? 'text-[#004d40]' : 'text-white',
    highlightColor: 'text-[#ffab00]',
    subtitleColor: isLight ? 'text-gray-700' : 'text-[#E5E7EB]',
    titleFont: 'font-exo2 font-black uppercase tracking-tight',
  };
}

/**
 * Resolve a variante da logo **da marca Coagro Agro**.
 *
 * Regra explÃ­cita de precedÃªncia:
 *   1. variante escolhida manualmente pelo operador;
 *   2. contraste do fundo (claro â†’ logo azul, escuro â†’ logo branca).
 *
 * Marcas com logotipo prÃ³prio (ver `brandHasOwnLogo`) ignoram este valor â€” o
 * `ArtHeader` usa o componente da marca.
 */
export function resolveLogoVariant(
  isLight: boolean,
  explicit?: LogoVariant
): LogoVariant {
  // REGRA DE SEGURANÃ‡A VISUAL & CONTRASTE (Grupo Coagro):
  // 1. Em fundo claro (clean-branco), NUNCA permitir logo branca (fica invisÃ­vel).
  if (isLight) {
    if (explicit === 'h-mono-branca' || explicit === 'h-branca') return 'h-azul';
    if (explicit === 'v-mono-branca' || explicit === 'v-branca') return 'v-azul';
    return explicit || 'h-azul';
  }

  // 2. Em fundo escuro ou foto, NUNCA permitir logo azul escura (perde contraste contra verde/azul escuro).
  if (explicit === 'h-azul') return 'h-mono-branca';
  if (explicit === 'v-azul') return 'v-mono-branca';

  return explicit || 'h-mono-branca';
}

/**
 * Fundo radial padrÃ£o por escopo/tema, usado quando nÃ£o hÃ¡ foto de fundo.
 * Centralizado aqui para que a Fase 4 possa trocar por cores de tenant.
 */
export function resolveBackgroundStyle(
  scopeId: ScopeId,
  isLight: boolean,
  isBlue: boolean
): { background: string } {
  if (isBlue) {
    return { background: 'radial-gradient(circle at 50% 40%, #002b82 0%, #001C71 80%)' };
  }
  if (isLight) {
    return { background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #f1f5f9 85%)' };
  }
  if (isPetScope(scopeId)) {
    return { background: 'radial-gradient(circle at 50% 40%, #001C71 0%, #001040 80%)' };
  }
  return { background: 'radial-gradient(circle at 50% 40%, #006b59 0%, #004d40 80%)' };
}
