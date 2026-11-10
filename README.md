# Hollow Page

Um mural de fãs para fãs, para encontrar e compartilhar artes de Hollow Knight.

Esta é a versão 2.0, refeita do zero a partir do [projeto original de 2023](https://github.com/tialvesdev/hollow-page) (primeiro projeto individual do curso de Análise e Desenvolvimento de Sistemas da SPTech). O visual segue o protótipo final, com as correções de acessibilidade da revisão de design.

## O que dá para fazer

- Criar conta, entrar e sair (senha guardada com hash bcrypt, sessão em cookie `httpOnly`).
- Completar o perfil depois do cadastro: foto, gênero e telefone (opcionais).
- Ver o mural em colunas, filtrar por atributos (Cavaleiro, Hornet, Vazio…) e pesquisar por título, descrição ou autor.
- Abrir uma publicação, salvar, baixar a imagem e apagar as próprias.
- Publicar uma arte com título, descrição e atributos. A imagem é convertida para WebP, sem metadados como localização.
- Perfil com capa (6 opções), abas de Posts, Salvos e Estatísticas (publicações por dia, mais e menos salva).
- Editar o perfil e excluir a conta (pede a senha).
- Trocar a cor de destaque do site inteiro (paleta do jogo).

## Tecnologias

| Parte | Escolhas |
| --- | --- |
| Front (`apps/web`) | React 18, TypeScript, Vite, React Router 6, TanStack Query |
| API (`apps/api`) | Node 22, Express, TypeScript, Drizzle ORM, PostgreSQL, Zod, sharp, jose, bcryptjs |
| Compartilhado (`packages/shared`) | Validações Zod e tipos usados nos dois lados |
| Testes | Vitest, Supertest (API contra Postgres real), Testing Library (front) |

Em produção, um único servidor Express entrega a API em `/api` e o front já compilado.

## Rodar na sua máquina

Precisa de Node 20+ e de um Postgres (o `docker-compose.yml` sobe um).

```bash
cp .env.example .env
docker compose up -d          # Postgres em localhost:5432
npm install
npm run db:migrate            # cria as tabelas
npm run db:seed               # opcional: 5 pessoas e 20 publicações de exemplo
npm run dev                   # API em :3333 e front em http://localhost:5173
```

Com os exemplos, entre com `fulano@email.com` e senha `123456`.

Para os testes da API, crie um banco separado (`createdb hollowpage_test`) ou defina `TEST_DATABASE_URL`, e rode `npm test`.

## Colocar no ar de graça

Uma combinação que cabe nos planos gratuitos:

1. **Banco: [Neon](https://neon.tech).** Crie um projeto e copie a connection string (com `?sslmode=require`).
2. **Imagens: [Cloudflare R2](https://developers.cloudflare.com/r2/).** Crie um bucket, ative o acesso público (domínio `r2.dev`) e gere uma chave de API com permissão de leitura e escrita nesse bucket.
3. **Servidor: [Render](https://render.com).** Em *New › Blueprint*, aponte para este repositório. O `render.yaml` já define build, start e as variáveis. Preencha `DATABASE_URL`, `S3_ENDPOINT` (`https://<id-da-conta>.r2.cloudflarestorage.com`), `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` e `S3_PUBLIC_URL` (o endereço `https://pub-….r2.dev`).

As tabelas são criadas sozinhas quando o servidor sobe. No plano gratuito do Render o serviço dorme depois de 15 minutos sem acesso, e a primeira visita seguinte leva alguns segundos.

## Estrutura

```
apps/
  api/   Express: rotas em src/routes, consultas em src/repo.ts, migrações SQL em src/db/migrations
  web/   React: telas em src/pages, componentes de interface em src/ui.tsx, estilos em src/styles.css
packages/
  shared/  validações e tipos compartilhados
```

## Sobre as imagens

As artes em `apps/api/seed` são de fãs e servem só para testar localmente. Antes de usar qualquer uma delas no site público, peça permissão e dê crédito a quem desenhou. Hollow Knight é marca da Team Cherry; este é um projeto de fã, sem fins lucrativos.

## Autor

Tiago Alves · [GitHub](https://github.com/tialvesdev) · [LinkedIn](https://www.linkedin.com/in/ti-alves) · tialves.dev@gmail.com
