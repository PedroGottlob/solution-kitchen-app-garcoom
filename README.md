# Solution Kitchen — App Garçom

Frontend web (React + TypeScript + Vite) usado por garçons e gerentes no chão do restaurante — gestão de mesas, pedidos, fechamento de conta, e (pra gerente) cardápio, mesas e dashboard.

## Responsabilidades

- Autenticação via Auth0, com dois papéis (`garcom`, `gerente`) lidos de claims customizadas do token
- Visão geral das mesas, detalhe de mesa com pedidos, criação de novo pedido
- Fechamento de conta com PIX (QR Code), Cash, Crédito, Débito
- Conexão em tempo real via SignalR com o `bff-operacional` — atualização de status de pedido e confirmação de pagamento
- Telas exclusivas de gerente: gestão de cardápio, gestão de mesas, dashboard

**O que este app NÃO faz:**
- Não atende a cozinha — isso é o app `kds`, separado
- Não fala diretamente com nenhum dos 4 serviços de domínio — tudo passa pelo `bff-operacional` (exceto leituras esporádicas via `bffCozinha`, ver Arquitetura)

## Stack

- React 19 + TypeScript + Vite
- React Router (rotas protegidas por papel)
- Auth0 (`@auth0/auth0-react`)
- Zustand (stores: `tableStore`, `cartStore`, `notificationStore`)
- Axios (dois clientes HTTP, ver Arquitetura)
- `@microsoft/signalr` (client)
- Tailwind CSS

## Rodando localmente

```bash
npm install
npm run dev
```

Variáveis de ambiente esperadas (`.env` ou `.env.local`): `VITE_BFF_OPERACIONAL_URL` (default `http://localhost:5159`), `VITE_BFF_COZINHA_URL` (default `http://localhost:5164`), além das configs do Auth0 (domain, client ID — não vistas nesta sessão, conferir `main.tsx`).

Porta local: `5174` (mapeada no docker-compose; internamente servido via Nginx na porta `80`).

## Arquitetura

**Dois clientes HTTP, não um só.** `api.ts` exporta `bffOperacional` (porta 5159, usado por quase tudo) e `bffCozinha` (porta 5164). Ambos recebem o `X-Tenant-Id` via `setTenantId()`, chamado uma vez no `App.tsx` assim que o usuário autentica.

**Tenant resolvido via claim customizada do Auth0.** `App.tsx` lê `user['https://solution-kitchen.com/tenant_id']` e `user['https://solution-kitchen.com/roles']` do token. Se a claim de `tenant_id` não existir e o app estiver rodando em desenvolvimento (`import.meta.env.DEV`), cai no tenant de dev; em produção, mostra uma tela de erro em vez disso (ver Gotchas).

**Roteamento condicionado por papel.** Rotas de gerente (`/tables/manage`, `/dashboard`, `/menu`) usam `<Navigate to="/" replace />` como guarda inline caso `isGerente` seja falso — não é um componente de proteção de rota reutilizável, é checado rota por rota dentro do `<Routes>`.

**SignalR conecta uma vez, no nível do `App.tsx`.** Ao autenticar, `signalRService.setTenantId()` + `.connect()` são chamados no `useEffect` de nível superior — a conexão persiste entre navegações de página (não reconecta a cada rota).

## Cobertura desta documentação

Auditado com profundidade nesta sessão (código lido e/ou escrito): `App.tsx`, `api.ts`, `signalRService.ts`, `tableStore.ts`, `tableService.ts`, `TablesPage.tsx`, `TableCard.tsx`, `TableManagementPage.tsx`, `CloseAccountPage.tsx`, `paymentService.ts`, `MenuManagementPage.tsx`, `menuService.ts`, `types/index.ts`, `useOrders.ts`.

**Não auditado nesta sessão** (existe no repositório, conteúdo não conferido — não documentar comportamento de memória):
- Páginas: `AccountPage.tsx`, `DashboardPage.tsx`, `NotificationsPage.tsx`, `NewOrderPage.tsx`, `OrdersPage.tsx`, `ProfilePage.tsx`, `TableDetailPage.tsx`
- Componentes: `BottomNav.tsx`, `NotificationDropdown.tsx`, `OrderCard.tsx`
- Serviços/stores: `dashboardService.ts`, `orderService.ts`, `cartStore.ts`, `notificationStore.ts`
- `main.tsx` (config do Auth0 — domain, client ID, provavelmente aqui)

## Gotchas conhecidos

- **✅ Corrigido em 09/07 — fallback de tenant sem proteção de ambiente.** `api.ts` e `App.tsx` usavam o tenant de dev como fallback incondicional (não só em desenvolvimento). Corrigido: o fallback agora só existe quando `import.meta.env.DEV` é verdadeiro (build de dev via Vite). Em produção, se a claim `tenant_id` não existir no usuário Auth0, o app mostra uma tela "Conta sem restaurante vinculado" em vez de usar silenciosamente o tenant errado. Testado em dev (`npm run dev`) e em produção (build Docker via porta 5174) — comportamento normal preservado nos dois.
- **Categorias de cardápio com UUIDs fixos hardcoded no frontend.** Ver README do `menu-service` — `MenuManagementPage.tsx` espera exatamente os UUIDs `...101` a `...104`. Qualquer mudança nesse conjunto de categorias precisa acontecer nos dois lados.

## Deploy

```bash
# a partir da raiz do repositório solution-kitchen (infra)
docker-compose build --no-cache app-garcoom
docker-compose up -d --no-deps app-garcoom
```

Build multi-stage: `node:20-alpine` compila (`npm install` + `npm run build`), `nginx:alpine` serve os arquivos estáticos. Não precisa de `dotnet publish` nem passo manual — o `docker-compose build` faz tudo.

## Dependências

- `bff-operacional` e `bff-cozinha` precisam estar acessíveis (via rede Docker em produção, via `localhost` + portas mapeadas em dev)
- Conta e aplicação Auth0 configuradas com as claims customizadas (`roles`, `tenant_id`) no namespace `https://solution-kitchen.com`