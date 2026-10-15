/**
 * @file CandidatePhoto.tsx
 * @description Foto oficial do candidato das Eleições Brasileiras com proporção oficial 3x4 do TSE,
 * suporte a fallback em cascata (repositório local -> CDN TSE -> avatar estilizado com cores da legenda),
 * badge de número de urna no padrão da Urna Eletrônica e transição suave de carregamento.
 */

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getFotoCandidato, getFotoCandidatoFallback } from '../services/electionDatasetService';

export interface CandidatePhotoProps {
  /** URL direta da foto, se conhecida */
  fotoUrl?: string;
  /** Nome ou nome de urna do candidato para acessibilidade e fallback */
  nome: string;
  /** Número eleitoral do candidato (ex: 22, 13, 70) */
  numero?: number;
  /** Sequencial do candidato no TSE (sqcand) */
  sq?: string;
  /** Cargo em disputa */
  cargo?: 'pres' | 'gov' | 'sen';
  /** Sigla da UF para candidatos estaduais */
  uf?: string | null;
  /** Cor hexadecimal oficial do partido */
  corHex?: string;
  /** Sigla do partido (ex: "PL", "PT", "AVANTE") */
  partido?: string;
  /** Tamanho predefinido */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  /** Proporção visual: 'portrait' (3x4 oficial da urna), 'square' (1x1) ou 'circle' (avatar redondo) */
  aspectRatio?: 'portrait' | 'square' | 'circle';
  /** Exibe a tarja com o número do candidato no rodapé da foto */
  showNumberBadge?: boolean;
  /** Exibe ponto com a cor da legenda partidária */
  showPartyDot?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Prioridade alta de carregamento (sem lazy load) */
  priority?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-9 text-[9px]',
  sm: 'w-10 h-13 text-[10px]',
  md: 'w-14 sm:w-16 h-[74px] sm:h-[85px] text-xs',
  lg: 'w-20 sm:w-24 h-[106px] sm:h-[128px] text-sm',
  xl: 'w-24 sm:w-28 h-[128px] sm:h-[150px] text-base',
  custom: '',
};

export const CandidatePhoto: React.FC<CandidatePhotoProps> = ({
  fotoUrl,
  nome,
  numero,
  sq,
  cargo = 'pres',
  uf,
  corHex = '#475569',
  partido,
  size = 'md',
  aspectRatio = 'portrait',
  showNumberBadge = false,
  showPartyDot = false,
  className = '',
  priority = false,
}) => {
  // Determina a URL inicial
  const initialUrl = fotoUrl || getFotoCandidato({ numero, sq, cargo, uf });
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(!initialUrl);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Sincroniza se as props mudarem
  useEffect(() => {
    const nextUrl = fotoUrl || getFotoCandidato({ numero, sq, cargo, uf });
    setCurrentSrc(nextUrl);
    setTriedFallback(false);
    setHasError(!nextUrl);
    setIsLoaded(false);
  }, [fotoUrl, numero, sq, cargo, uf]);

  // Handler de erro: tenta a CDN do TSE antes de desistir
  const handleError = () => {
    if (!triedFallback && (sq || numero)) {
      setTriedFallback(true);
      const fallbackUrl = getFotoCandidatoFallback({ sq, cargo, uf });
      if (fallbackUrl && fallbackUrl !== currentSrc) {
        setCurrentSrc(fallbackUrl);
        return;
      }
    }
    setHasError(true);
  };

  const roundedClasses =
    aspectRatio === 'circle'
      ? 'rounded-full'
      : aspectRatio === 'portrait'
      ? 'rounded-lg'
      : 'rounded-xl';

  const aspectClass =
    aspectRatio === 'circle'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : 'aspect-square';

  const sizeClass = SIZE_CLASSES[size];

  // Iniciais do candidato para o fallback editorial
  const getIniciais = (n: string) => {
    const partes = n.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className={`relative shrink-0 select-none ${className}`}
      title={`${nome}${numero ? ` · Nº ${numero}` : ''}${partido ? ` (${partido})` : ''}`}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs transition-all duration-200 ${sizeClass} ${aspectClass} ${roundedClasses}`}
        style={{
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {!hasError && currentSrc ? (
          <>
            {/* Shimmer/Placeholder sutil enquanto carrega */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-slate-200/70 animate-pulse flex items-center justify-center">
                <User className="h-1/2 w-1/2 text-slate-400 opacity-60" strokeWidth={1.5} />
              </div>
            )}

            {/* Imagem oficial do candidato */}
            <img
              src={currentSrc}
              alt={`Foto oficial de ${nome}`}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={handleError}
              className={`h-full w-full object-cover object-top transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          /* Fallback visual estilizado: iniciais com fundo sutil da cor partidária */
          <div
            className="flex h-full w-full flex-col items-center justify-center text-center p-1"
            style={{
              backgroundColor: `${corHex}15`,
            }}
          >
            <span
              className="font-extrabold uppercase tracking-tight"
              style={{ color: corHex }}
            >
              {getIniciais(nome)}
            </span>
          </div>
        )}

        {/* Tarja com o número do candidato no rodapé (estilo oficial da Urna Eletrônica) */}
        {showNumberBadge && numero !== undefined && (
          <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-center text-[10px] sm:text-[11px] font-mono font-bold text-white tracking-wider py-0.5 backdrop-blur-[2px]">
            Nº {numero}
          </span>
        )}
      </div>

      {/* Ponto indicador de cor da legenda partidária */}
      {showPartyDot && (
        <span
          className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs z-10"
          style={{ backgroundColor: corHex }}
          title={partido ? `Legenda: ${partido}` : undefined}
        />
      )}
    </div>
  );
};
