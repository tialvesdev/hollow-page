import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { criarRouter } from './App';
import { AcentoProvider, AvisoProvider } from './ui';
import './styles.css';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <AcentoProvider>
        <AvisoProvider>
          <RouterProvider router={criarRouter()} />
        </AvisoProvider>
      </AcentoProvider>
    </QueryClientProvider>
  </StrictMode>,
);
