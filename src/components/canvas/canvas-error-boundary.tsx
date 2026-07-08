"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}
interface State {
  error: Error | null;
}

/**
 * WebGL error boundary. Falls back to a `<CanvasFallback>` (poster frame or
 * plain gradient) when the canvas can't mount — common on weak GPUs, in
 * privacy-preserving browsers, or when WebGL2 is disabled.
 *
 * Prevents a single 3D failure from nuking the route.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 42%, rgba(201,178,153,0.14) 0%, transparent 70%)",
            }}
          />
        )
      );
    }
    return this.props.children;
  }
}