import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="underline hover:text-primary"
          >
            Tentar de novo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
