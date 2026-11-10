import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AvisoProvider } from './ui';
import { Cadastro, Entrar } from './pages/Auth';

function montar(el: JSX.Element, rota = '/') {
  const router = createMemoryRouter([{ path: '*', element: el }], { initialEntries: [rota] });
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AvisoProvider><RouterProvider router={router} /></AvisoProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as never;
  window.scrollTo = vi.fn() as never;
});

describe('cadastro', () => {
  it('mostra quantos caracteres faltam na senha enquanto a pessoa digita', async () => {
    montar(<Cadastro />);
    await userEvent.type(screen.getByLabelText('Senha'), '123');
    expect(screen.getByText('Faltam 3 caracteres (mínimo de 6).')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Senha'), '456');
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument();
  });

  it('avisa quando a confirmação não bate', async () => {
    montar(<Cadastro />);
    await userEvent.type(screen.getByLabelText('Senha'), '123456');
    await userEvent.type(screen.getByLabelText('Confirme sua senha'), '12345');
    expect(screen.getByText('As senhas não são iguais.')).toBeInTheDocument();
  });

  it('só valida o e-mail ao sair do campo', async () => {
    montar(<Cadastro />);
    const email = screen.getByLabelText('E-mail');
    await userEvent.type(email, 'fulano@');
    expect(screen.queryByText(/e-mail válido/)).not.toBeInTheDocument();
    await userEvent.tab();
    expect(screen.getByText(/Digite um e-mail válido/)).toBeInTheDocument();
  });
});

describe('entrar', () => {
  it('mostra a mensagem do servidor quando a senha está errada', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ erro: 'E-mail ou senha incorretos.' }) }) as never;
    montar(<Entrar />);
    await userEvent.type(screen.getByLabelText('E-mail'), 'fulano@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
  });
});
