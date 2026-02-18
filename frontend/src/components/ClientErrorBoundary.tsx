'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

export default function ClientErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
