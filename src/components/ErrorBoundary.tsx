import { Component, ErrorInfo, ReactNode } from 'react';

import { toast } from 'sonner';

import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    toast.error('Something went wrong', {
      description: 'The application encountered an unexpected error.',
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-50">
              Oops! Something went wrong
            </h2>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
