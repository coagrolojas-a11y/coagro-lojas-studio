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

  return <>{badge}</>;
};
