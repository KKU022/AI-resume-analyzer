'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          },
          success: {
            style: {
              background: '#065f46',
              borderLeft: '4px solid #10b981',
            },
          },
          error: {
            style: {
              background: '#7f1d1d',
              borderLeft: '4px solid #ef4444',
            },
          },
        }}
      />
      {children}
    </>
  );
}
