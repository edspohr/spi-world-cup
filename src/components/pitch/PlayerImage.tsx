import { useState } from 'react';
import { COLORS } from '../../utils/constants';

interface Props {
  urlFoto: string;
  numero: number;
  nombre: string;
  size: number; // px
}

function transformDriveUrl(url: string): string {
  if (!url.includes('drive.google.com')) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
}

export function PlayerImage({ urlFoto, numero, nombre, size }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    urlFoto ? 'loading' : 'error'
  );

  const transformedUrl = urlFoto ? transformDriveUrl(urlFoto) : '';

  if (!urlFoto || status === 'error') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: COLORS.colombiaBlue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            fontSize: size * 0.38,
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        >
          {numero}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        background: COLORS.colombiaBlue,
      }}
    >
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #1A2A4A 25%, #2A3A5A 50%, #1A2A4A 75%)',
            backgroundSize: '200% 100%',
            animation: 'pulse 1.5s infinite',
          }}
        />
      )}
      <img
        src={transformedUrl}
        alt={nombre}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          display: status === 'loaded' ? 'block' : 'none',
        }}
      />
    </div>
  );
}
