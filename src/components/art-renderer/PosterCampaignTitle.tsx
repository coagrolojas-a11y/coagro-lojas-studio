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
      <span className="flex h-[18cqw] max-h-full max-w-[86cqw] items-center justify-center rounded-[1.5cqw] border border-black/10 bg-white px-[2cqw] py-[0.8cqw] shadow-md">
        <img
          src="/sald%C3%A3o%20coagro.png"
          alt="Saldão Coagro"
          className="max-h-[15cqw] max-w-[80cqw] object-contain"
          style={monochrome ? { filter: 'grayscale(1)' } : undefined}
        />
      </span>
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
