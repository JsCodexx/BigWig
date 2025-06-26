"use client";

import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode,
};

type ErrorBoundaryState = {
  hasError: boolean,
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // You can also log this to an external error logging service
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-4 text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            Something went wrong.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please try again or report the issue.
          </p>
          <button
            onClick={this.handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
