import React from 'react';

interface PosterCampaignTitleProps {
  text: string;
  fontSize: string;
  monochrome?: boolean;
}

export const PosterCampaignTitle: React.FC<PosterCampaignTitleProps> = ({
  text,
  fontSize,
  monochrome = false,
}) => {
  if (text === 'SALDÃO COAGRO') {
    return (
      <img
        src="/sald%C3%A3o%20coagro.png"
        alt="Saldão Coagro"
        className="max-h-[16cqw] max-w-[76cqw] object-contain"
        style={monochrome ? { filter: 'grayscale(1)' } : undefined}
      />
    );
  }

  return (
    <h1
      className="font-exo2 font-black uppercase leading-none text-center whitespace-nowrap"
      style={{ fontSize, letterSpacing: '-0.02em' }}
    >
      {text}
    </h1>
  );
};
