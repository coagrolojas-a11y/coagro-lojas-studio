import React from 'react';
import { CalendarDays } from 'lucide-react';
import { OfferPeriod } from '../lib/offerPeriod';

interface OfferValidityFieldsProps {
  value: OfferPeriod;
  onChange: (value: OfferPeriod) => void;
}

export const OfferValidityFields: React.FC<OfferValidityFieldsProps> = ({
  value,
  onChange,
}) => (
  <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3">
    <div className="flex items-center gap-2">
      <CalendarDays className="h-4 w-4 text-[#004d40]" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-800">
        Oferta e vigência
      </h3>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-gray-700">
        Início da oferta
        <input
          type="date"
          value={value.startDate}
          onChange={(event) => onChange({ ...value, startDate: event.target.value })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="text-xs font-semibold text-gray-700">
        Encerramento
        <input
          type="date"
          value={value.endDate}
          min={value.startDate || undefined}
          onChange={(event) => onChange({ ...value, endDate: event.target.value })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal"
        />
      </label>
    </div>
    <p className="text-[11px] leading-relaxed text-gray-600">
      A data final é opcional. Se informada, uma oferta vencida será bloqueada para exportação.
    </p>
  </section>
);
