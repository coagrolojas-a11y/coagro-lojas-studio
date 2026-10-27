import { EXPOAGRO_PERIOD } from '../data/expoagroPreset';
import type { OfferPeriod } from './offerPeriod';

/**
 * A vigência da Expoagro só é aplicada automaticamente quando o período ainda
 * está livre (sem data final) ou quando já é exatamente o da Expoagro.
 * Assim, uma data personalizada pelo usuário nunca é sobrescrita.
 */
export function shouldApplyExpoagroPeriod(period: OfferPeriod): boolean {
  if (!period.endDate) return true;
  return (
    period.startDate === EXPOAGRO_PERIOD.startDate &&
    period.endDate === EXPOAGRO_PERIOD.endDate
  );
}
