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
  if (text === 'EXPOAGRO') {
    // Arte fornecida inteira: "PROMOÇÃO EXCLUSIVA" + selo Expoagro, sem recorte.
    return (
      <img
        src={
          monochrome
            ? '/expoagro/expoagro-logo-pb.png'
            : '/expoagro/expoagro-logo-color.png'
        }
        alt="Promoção Exclusiva — 76ª Expoagro 2026"
        className="max-h-[21cqw] max-w-[96cqw] object-contain"
        style={
          monochrome
            ? undefined
            : {
                // Sombra suave só para a frase branca não sumir no cabeçalho amarelo.
                filter: 'drop-shadow(0 0.35cqw 0.5cqw rgba(0,0,0,0.55))',
              }
        }
      />
    );
  }

  if (text === 'SALDÃO COAGRO') {
    if (monochrome) {
      return (
        <img
          src="/mono%20sald%C3%A3o.svg"
          alt="Saldão Coagro"
          className="max-h-[16cqw] max-w-[80cqw] object-contain"
        />
      );
    }

    return (
      <span className="flex h-[18cqw] max-h-full max-w-[86cqw] items-center justify-center rounded-[1.5cqw] border border-black/10 bg-white px-[2cqw] py-[0.8cqw] shadow-md">
        <img
          src="/sald%C3%A3o%20coagro.png"
          alt="Saldão Coagro"
          className="max-h-[15cqw] max-w-[80cqw] object-contain"
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
