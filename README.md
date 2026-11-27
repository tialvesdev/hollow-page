# Hollow Page

Um mural de fãs para fãs, para encontrar e compartilhar artes de Hollow Knight.

Esta é a versão 2.0, refeita do zero a partir do [projeto original de 2023](https://github.com/tialvesdev/hollow-page) (primeiro projeto individual do curso de Análise e Desenvolvimento de Sistemas da SPTech). O visual segue o protótipo final, com as correções de acessibilidade da revisão de design.

## O que dá para fazer

- Criar conta, entrar e sair (senha guardada com hash bcrypt, sessão em cookie `httpOnly`).
- Completar o perfil depois do cadastro: foto, bio e um link (opcionais).
- Ver o mural em colunas, filtrar por atributos (Cavaleiro, Hornet, Vazio…) e pesquisar por título, descrição ou autor.
- Abrir uma publicação, salvar, baixar a imagem e apagar as próprias.
- Publicar uma arte com título, descrição e atributos. A imagem é convertida para WebP, sem metadados como localização.
- Perfil com capa (6 opções), publicações e estatísticas (publicações por dia, mais e menos salva). Os salvos ficam numa página própria.
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
npm run db:seed               # opcional: 7 pessoas, 24 publicações e salvos de exemplo
npm run dev                   # API em :3333 e front em http://localhost:5173
```

Os exemplos criam 7 contas (`fulano@exemplo.test`, `lira@exemplo.test` e outras; a senha de todas está em `apps/api/src/db/seed.ts`), 24 artes e salvos variados. O seed só acrescenta essas contas; `npm run db:seed -- --forcar` recria apenas elas.

Para os testes da API, crie um banco separado (`createdb hollowpage_test`) ou defina `TEST_DATABASE_URL`, e rode `npm test`.

### Bancos: desenvolvimento e produção

O projeto no Neon tem duas branches de banco:

| Branch | Para quê | Onde fica a conexão |
| --- | --- | --- |
| `production` | o site no ar | no painel do Render (e uma cópia em `.env.producao.local`) |
| `desenvolvimento` | rodar na sua máquina | `.env.local` |

A branch `desenvolvimento` nasceu como cópia da produção. Dá para criar conta, publicar e apagar à vontade sem mexer no site no ar.

- **Puxar a produção de novo:** `npm run db:atualizar` reseta a branch `desenvolvimento` a partir da produção. Tudo o que foi feito nela some. Na próxima vez que a API subir, ela reaplica as migrações que ainda não estão em produção.
- **Voltar o `.env.local` para o desenvolvimento** (por exemplo, depois de um `neon checkout` em outra branch): `npm run db:local`.
- **Imagens:** no desenvolvimento, o que você envia fica em `apps/api/uploads`. As imagens que vieram da produção são lidas do bucket de produção (`IMAGENS_PRODUCAO_URL`) só para exibir. A API local nunca grava nem apaga nada lá.
- **Trava:** a API aplica as migrações toda vez que sobe. Por isso, rodando no computador (`NODE_ENV=development`), ela se recusa a ligar na branch `production`. Para uma migração manual em produção, de propósito: `PERMITIR_PRODUCAO=1 npm run db:migrate` com as variáveis de `.env.producao.local`.

## Colocar no ar de graça

Uma combinação que cabe nos planos gratuitos:

1. **Banco e imagens: [Neon](https://neon.tech).** Crie o projeto numa região com Object Storage (por exemplo *AWS US East 2, Ohio*), ligue a pasta ao projeto com `npx neon link --project-id <id> -y` e rode `npx neon deploy`. Isso cria o bucket `hollow-page` declarado no `neon.ts` e grava no `.env.local` a `DATABASE_URL` e as credenciais `AWS_*` do bucket.
2. **Servidor: [Render](https://render.com).** Em *New › Blueprint*, aponte para este repositório (região *Ohio*, perto do banco). O `render.yaml` já define build, start e as variáveis. Copie do `.env.local` os valores de `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`.

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

As artes em `apps/api/seed` são de fãs e servem só para testar localmente. Antes de usar qualquer uma delas no site público, peça permissão e dê crédito a quem desenhou. Os itens dos estados vazios (`apps/web/public/img/itens`: pena, diários, lanterna e fragmento de máscara) são sprites oficiais do jogo, tirados da [Hollow Knight Wiki](https://hollowknight.wiki). De lá também vêm os separadores das lojas com os personagens no topo dos painéis (`apps/web/public/ornamentos/personagens`: Sly, Iselda, Salubra, Lemm, Comedor de Pernas e Besouro-cervo) e a cabeça do Knight do ícone de perfil, recortada da arte oficial.

Hollow Knight é marca da Team Cherry; este é um projeto de fã, sem fins lucrativos.

## Autor

Tiago Alves · [GitHub](https://github.com/tialvesdev) · [LinkedIn](https://www.linkedin.com/in/ti-alves) · tialves.dev@gmail.com
