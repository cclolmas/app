import React from 'react';
import { logError } from './debugTools';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para que a próxima renderização mostre a UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Registra o erro no sistema de logs
    logError(
      `Erro capturado em ${this.props.componentName || 'componente'}`, 
      error, 
      { 
        component: this.props.componentName, 
        errorInfo: errorInfo 
      }
    );
  }

  render() {
    if (this.state.hasError) {
      // Renderiza uma UI alternativa
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Algo deu errado.</h2>
          {process.env.NODE_ENV !== 'production' && (
            <>
              <details>
                <summary>Ver detalhes do erro</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
              </details>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="error-boundary-retry"
              >
                Tentar novamente
              </button>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// HOC para envolver componentes com ErrorBoundary
export const withErrorBoundary = (Component, fallback, componentName = null) => {
  return (props) => (
    <ErrorBoundary fallback={fallback} componentName={componentName || Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );
};
