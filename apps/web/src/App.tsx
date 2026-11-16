import { Outlet, ScrollRestoration, createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import Landing from './pages/Landing';
import { Entrar, Cadastro, BoasVindas } from './pages/Auth';
import Shell from './pages/Shell';
import Feed from './pages/Feed';
import Perfil from './pages/Perfil';
import Publicar from './pages/Publicar';
import EditarPerfil from './pages/EditarPerfil';
import PostModal from './pages/PostModal';

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
    <div className="center">
      <div className="empty">
        <img src="/img/knight-crying.webp" alt="" />
        <p>Algo deu errado nesta página</p>
        <a className="btn sm" href="/">Voltar ao início</a>
      </div>
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
          { path: '/publicar', element: <Publicar /> },
          { path: '/editar-perfil', element: <EditarPerfil /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const criarRouter = () => createBrowserRouter(rotas);
