import { Outlet, ScrollRestoration, createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import Landing from './pages/Landing';
import { Entrar, Cadastro, BoasVindas } from './pages/Auth';
import Shell from './pages/Shell';
import Feed from './pages/Feed';
import Perfil from './pages/Perfil';
import Publicar from './pages/Publicar';
import EditarPerfil from './pages/EditarPerfil';
import PostModal from './pages/PostModal';
import Salvos from './pages/Salvos';
import { Vazio } from './ui';

function Raiz() {
  return (
    <>
      <Outlet />
      <PostModal />
      <ScrollRestoration />
    </>
  );
}

function Erro() {
  const e = useRouteError();
  console.error(e);
  return (
    <div className="erro-pg">
      <Vazio item="fragmento" titulo="Algo deu errado nesta página" texto="Tente recarregar. Se continuar, volte ao início." acao={<a className="btn" href="/">Voltar ao início</a>} />
    </div>
  );
}

export const rotas = [
  {
    element: <Raiz />,
    errorElement: <Erro />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/entrar', element: <Entrar /> },
      { path: '/cadastro', element: <Cadastro /> },
      { path: '/boas-vindas', element: <BoasVindas /> },
      {
        element: <Shell />,
        children: [
          { path: '/feed', element: <Feed /> },
          { path: '/perfil', element: <Perfil /> },
          { path: '/perfil/:id', element: <Perfil /> },
          { path: '/salvos', element: <Salvos /> },
          { path: '/publicar', element: <Publicar /> },
          { path: '/editar-perfil', element: <EditarPerfil /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const criarRouter = () => createBrowserRouter(rotas);
