# Market Map - Roadmap e Progresso

Este arquivo acompanha o que foi planejado para o projeto e o que ja foi feito. A ideia e manter o desenvolvimento gradual, entendendo as decisoes de arquitetura antes de avancar para funcionalidades maiores.

## Visao do Produto

Market Map sera uma aplicacao para mapear layouts de lojas, mercados ou depositos. O usuario podera representar gondolas, prateleiras, subdivisoes e associar produtos a locais fisicos. Depois, sera possivel buscar um produto e visualizar onde ele esta no mapa.

No futuro, o sistema tambem podera evoluir para controle de estoque, lotes, validade e movimentacoes.

## Arquitetura Planejada

- [x] Monorepo com backend e arquivos de apoio na raiz
- [x] Backend em Java 21 com Spring Boot
- [x] API REST
- [x] PostgreSQL como banco principal
- [x] Flyway para migrations
- [x] Hibernate com `ddl-auto=validate`
- [ ] Frontend em React + TypeScript + Vite
- [ ] Integracao do frontend com a API
- [ ] Autenticacao e autorizacao
- [ ] Editor visual de mapa

## Organizacao de Dominios

Pacotes planejados no backend:

- [x] `shared`
- [x] `auth`
- [x] `store`
- [x] `layout`
- [x] `shelf`
- [x] `product`
- [x] `inventory`
- [x] `search`

Nesta fase, os pacotes existem apenas como estrutura inicial. As regras de negocio ainda serao adicionadas aos poucos.

## Fase 1 - Fundacao

- [x] Criar backend Spring Boot
- [x] Usar Java 21
- [x] Configurar endpoint `GET /api/health`
- [x] Configurar PostgreSQL via Docker Compose
- [x] Criar banco `market_map`
- [x] Configurar Flyway
- [x] Criar migration inicial sem modelo completo ainda
- [x] Configurar JPA com `ddl-auto=validate`
- [x] Criar organizacao inicial de pacotes por dominio
- [x] Criar Dockerfile do backend
- [x] Criar README inicial com instrucoes de execucao
- [x] Validar build/testes localmente
- [ ] Criar frontend React + TypeScript + Vite
- [ ] Fazer frontend chamar `GET /api/health`

## Fase 2 - Modelo Base

- [x] Definir entidade de loja ou unidade operacional
- [x] Definir entidade de layout/mapa
- [x] Definir entidade de gondola/prateleira
- [x] Definir subdivisoes dentro da prateleira
- [x] Definir produto
- [x] Associar produto a uma localizacao fisica
- [x] Criar migrations reais para o modelo base
- [x] Criar endpoints CRUD iniciais

## Fase 3 - Busca e Localizacao

- [ ] Buscar produto por nome, codigo ou identificador
- [ ] Retornar localizacao fisica do produto
- [ ] Exibir destaque visual no mapa
- [ ] Criar filtros por loja, setor ou categoria

## Fase 4 - Editor Visual

- [ ] Criar canvas ou area visual do layout
- [ ] Permitir adicionar gondolas/prateleiras
- [ ] Permitir mover e redimensionar elementos
- [ ] Permitir editar subdivisoes
- [ ] Salvar estrutura visual no backend
- [ ] Carregar mapa salvo

## Fase 5 - Estoque Futuro

- [ ] Controlar quantidade por localizacao
- [ ] Registrar lotes
- [ ] Registrar datas de validade
- [ ] Alertar produtos proximos do vencimento
- [ ] Registrar movimentacoes de entrada e saida

## O Que Ja Foi Feito

Em `F:\market-map`, ja existe um backend Spring Boot gerado dentro de `backend/backend`. A primeira base da fase 1 foi iniciada com:

- `GET /api/health` em `shared.web.HealthController`
- `application.properties` configurado para PostgreSQL, Flyway e `ddl-auto=validate`
- migration `V1__initial_baseline.sql`
- `docker-compose.yml` na raiz do projeto com PostgreSQL e backend
- `Dockerfile` para empacotar o backend
- `README.md` inicial

A validacao com Maven foi executada com sucesso usando JDK 21. O comando de verificacao atual e:

```bash
cd F:\market-map\backend\backend
.\mvnw.cmd test
```

## Proximo Passo Recomendado

A fase 2 ja tem o modelo base e a migration inicial das tabelas principais. O proximo passo recomendado e criar os endpoints CRUD iniciais, comecando por `Store`, porque `Layout`, `Shelf`, `ShelfSection` e `ProductLocation` dependem dessa base.

## Progresso da Fase 2

Foram criadas as entidades JPA principais:

- `Store`
- `Layout`
- `Shelf`
- `ShelfSection`
- `Product`
- `ProductLocation`

Tambem foi criada a migration `V2__create_base_model.sql`, contendo as tabelas:

- `stores`
- `layouts`
- `shelves`
- `shelf_sections`
- `products`
- `product_locations`

A validacao local passou com:

```bash
.\mvnw.cmd test
```

## Progresso dos Endpoints

O primeiro CRUD criado foi o de `Store`, porque ele representa a loja, mercado, deposito ou unidade operacional. Esse recurso ja possui:

- `GET /api/stores`
- `GET /api/stores/{id}`
- `POST /api/stores`
- `PUT /api/stores/{id}`
- `DELETE /api/stores/{id}`

Tambem foram criados `StoreRepository`, `StoreService`, DTOs de entrada e saida, e um handler global inicial para erros de validacao e recurso nao encontrado.

Os CRUDs principais do modelo base agora seguem a dependencia natural do dominio: `Store`, `Layout`, `Shelf`, `ShelfSection`, `Product` e `ProductLocation`.

## CRUDs da Fase 2

Foram criados CRUDs REST para todos os recursos principais do modelo base:

- `Store`: `/api/stores`
- `Layout`: `/api/layouts`
- `Shelf`: `/api/shelves`
- `ShelfSection`: `/api/shelf-sections`
- `Product`: `/api/products`
- `ProductLocation`: `/api/product-locations`

Cada recurso possui endpoints de listagem, busca por id, criacao, atualizacao e remocao. Os DTOs de entrada usam validacoes simples para campos obrigatorios, tamanhos maximos e numeros positivos quando aplicavel.
