import { memo, useState, useMemo } from 'react';
import { COLORS } from '../../utils/constants';

interface Props {
  urlFoto: string;
  numero: number;
  nombre: string;
  size: number;
}

/**
 * Google Drive photo URL strategy (in order of reliability):
 * 1. Thumbnail endpoint — works for publicly shared files, no CORS issues
 * 2. lh3.googleusercontent.com — sometimes works for Google Workspace files
 * 3. /uc?export=view — classic export, often blocked by virus scan interstitial
 * 4. Fallback: player number on blue background
 *
 * IMPORTANTE: Todas las fotos en el Google Sheet deben compartirse como
 * "Cualquier persona con el enlace puede ver" en Google Drive.
 */
function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return null;
}

function buildDriveUrls(originalUrl: string): string[] {
  if (!originalUrl) return [];

  // Si no es una URL de Google Drive, usarla directamente
  if (!originalUrl.includes('drive.google.com')) return [originalUrl];

  const fileId = extractDriveFileId(originalUrl);
  if (!fileId) return [originalUrl];

  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`,
    `https://lh3.googleusercontent.com/d/${fileId}=w200`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
}

export const PlayerImage = memo(function PlayerImage({ urlFoto, numero, nombre, size }: Props) {
  const urls = useMemo(() => buildDriveUrls(urlFoto), [urlFoto]);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const currentUrl = urls[attempt];
  const exhausted = !currentUrl || attempt >= urls.length;

  if (!urlFoto || exhausted) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: COLORS.colombiaBlue,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'Oswald, sans-serif', fontWeight: 700,
          fontSize: size * 0.38, color: '#FFFFFF', lineHeight: 1,
        }}>
          {numero}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
      background: COLORS.colombiaBlue,
    }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(90deg, #1A2A4A 25%, #2A3A5A 50%, #1A2A4A 75%)',
          backgroundSize: '200% 100%',
          animation: 'pulse 1.5s infinite',
        }} />
      )}
      <img
        src={currentUrl}
        alt={nombre}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setAttempt(prev => prev + 1);
        }}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          borderRadius: '50%',
          display: loaded ? 'block' : 'none',
        }}
      />
    </div>
  );
});
