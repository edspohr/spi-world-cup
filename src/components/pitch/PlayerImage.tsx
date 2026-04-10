import { memo, useState, useRef, useEffect } from 'react';
import { COLORS } from '../../utils/constants';

interface Props {
  urlFoto: string;
  numero: number;
  nombre: string;
  size: number;
}

export const PlayerImage = memo(function PlayerImage({ urlFoto, numero, nombre, size }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const hasUrl = !!urlFoto && urlFoto.trim() !== '';
  const showImage = hasUrl && !failed;

  // Reset states when URL changes
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [urlFoto]);

  // Timeout: si la imagen no carga en 5s, mostrar el número de respaldo
  useEffect(() => {
    if (!showImage || loaded) return;
    timeoutRef.current = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 5000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [showImage, loaded, urlFoto]);

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
      background: COLORS.colombiaBlue,
    }}>
      {/* Número de respaldo — siempre renderizado como capa base */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: COLORS.colombiaBlue,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
        opacity: loaded ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
      }}>
        <span style={{
          fontFamily: 'Oswald, sans-serif', fontWeight: 700,
          fontSize: size * 0.38, color: '#FFFFFF', lineHeight: 1,
        }}>
          {numero}
        </span>
      </div>

      {/* Foto — se superpone encima, aparece con fade cuando carga */}
      {showImage && (
        <img
          src={urlFoto}
          alt={nombre}
          loading="lazy"
          onLoad={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setLoaded(true);
          }}
          onError={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setFailed(true);
          }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            borderRadius: '50%',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
});
