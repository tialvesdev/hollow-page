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
    expect(screen.getByText('Faltam 5 caracteres (mínimo de 8).')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Senha'), '45678');
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument();
  });

  it('pede só nome, e-mail e senha', () => {
    montar(<Cadastro />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.queryByLabelText(/nascimento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/confirme/i)).not.toBeInTheDocument();
  });

  it('a falta de caracteres é dica enquanto digita e vira erro ao tentar enviar', async () => {
    montar(<Cadastro />);
    const senha = screen.getByLabelText('Senha');
    await userEvent.type(senha, '1234');
    expect(senha).toHaveAttribute('aria-invalid', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(senha).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Faltam 4 caracteres (mínimo de 8).')).toHaveAttribute('role', 'alert');
  });

  it('mostra e esconde a senha', async () => {
    montar(<Cadastro />);
    const senha = screen.getByLabelText('Senha');
    expect(senha).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(senha).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: 'Esconder senha' }));
    expect(senha).toHaveAttribute('type', 'password');
  });

  it('oferece entrar quando o e-mail já tem cadastro', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ erro: 'Este e-mail já tem cadastro.', campos: { email: 'Este e-mail já tem cadastro. Entre por aqui.' } }) }) as never;
    montar(<Cadastro />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Lia Moraes');
    await userEvent.type(screen.getByLabelText('E-mail'), 'lia@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '12345678');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByRole('link', { name: 'Entrar com ele' })).toHaveAttribute('href', '/entrar');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
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
    await userEvent.type(screen.getByLabelText('E-mail'), 'lia@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
  });
});
