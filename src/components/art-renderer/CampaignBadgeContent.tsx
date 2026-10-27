import React from 'react';

interface CampaignBadgeContentProps {
  badge?: string;
  imageClassName?: string;
}

export const CampaignBadgeContent: React.FC<CampaignBadgeContentProps> = ({
  badge,
  imageClassName = 'h-auto w-full object-contain',
}) => {
  if (badge === 'SALDÃO COAGRO') {
    return (
      <img
        src="/sald%C3%A3o%20coagro.png"
        alt="Saldão Coagro"
        className={imageClassName}
      />
    );
  }

  if (badge === 'EXPOAGRO') {
    return (
      <img
        src="/expoagro/expoagro-logo-color.png"
        alt="Promoção Exclusiva — Expoagro 2026"
        className={imageClassName}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.35))' }}
      />
    );
  }

  return <>{badge}</>;
};
