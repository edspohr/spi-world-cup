import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Error no controlado:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0A1628',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            padding: 24,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <p style={{ fontSize: 56, lineHeight: 1 }}>⚽</p>

          <h1
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 700,
              color: '#FCD116',
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}
          >
            ¡Falta técnica!
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem',
              textAlign: 'center',
              maxWidth: 380,
              lineHeight: 1.5,
            }}
          >
            Algo salió mal. Recarga la página para volver al partido.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '10px 28px',
              background: '#003893',
              border: '2px solid #FCD116',
              borderRadius: 30,
              color: '#FCD116',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
