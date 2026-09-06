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
- [x] Frontend em React + TypeScript + Vite
- [x] Integracao inicial do frontend com a API
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
- [x] Criar frontend React + TypeScript + Vite
- [x] Fazer frontend chamar `GET /api/health`

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

- [x] Buscar produto por nome, codigo ou identificador
- [x] Retornar localizacao fisica do produto
- [x] Retornar dados para destaque visual no mapa
- [x] Criar filtro inicial por loja

## Fase 4 - Editor Visual

- [x] Criar area visual inicial do layout
- [x] Permitir adicionar gondolas/prateleiras
- [x] Permitir mover e redimensionar elementos
- [x] Permitir criar e remover subdivisoes
- [x] Salvar estrutura visual no backend
- [x] Carregar mapa salvo pelos endpoints do backend

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

## Progresso da Fase 3

Foi criado o endpoint inicial de busca:

- `GET /api/search/products?query=texto`
- `GET /api/search/products?query=texto&storeId=uuid-da-loja`

A busca considera nome, SKU e marca do produto. A resposta ja retorna a trilha fisica completa para o frontend destacar a posicao no mapa: loja, layout, gondola/prateleira, secao, coordenadas e dimensoes da gondola, nivel e posicao da secao.

Busca sem texto retorna erro `400 Bad Request`. Busca sem resultados retorna uma lista vazia.

## Progresso da Fase 4

Foi criada a base do frontend em React + TypeScript + Vite dentro de `frontend/`.

A primeira tela do editor visual inclui:

- status da API usando `GET /api/health`
- sidebar com contexto de loja/layout
- area visual inicial do mapa
- prateleiras selecionaveis carregadas a partir do backend
- painel de propriedades da prateleira selecionada

O Vite foi configurado com proxy para `/api`, encaminhando chamadas locais para o backend em `http://localhost:8080` durante o desenvolvimento.

A tela agora consome os CRUDs reais de `Store`, `Layout`, `Shelf` e `ShelfSection`. Tambem permite criar dados iniciais, adicionar prateleiras, editar dimensoes pelo painel, arrastar prateleiras no mapa, salvar posicoes no backend, criar secoes e remover secoes.


## Fechamento da Fase 4

A Fase 4 agora possui um fluxo demonstravel completo no frontend:

- criar dados iniciais de loja, layout e prateleira
- carregar mapa salvo a partir do backend
- adicionar, editar, mover, redimensionar e remover prateleiras
- criar, editar e remover secoes de prateleira
- cadastrar produto pela UI
- associar produto a secao selecionada
- buscar produto por texto
- destacar no mapa a prateleira e a secao onde o produto foi encontrado

As validacoes finais executadas foram:

```bash
.\mvnw.cmd test
npm.cmd run build
npm.cmd run lint
```


## Ajuste Final da Navegacao da Fase 4

A interface foi reorganizada para separar configuracao e busca:

- tela principal de `Configuracao`
- tela principal de `Busca`
- aba `Loja` para configurar o tamanho do layout
- aba `Prateleiras` para criar, selecionar, editar, mover e redimensionar prateleiras
- exibicao e edicao de secoes ao selecionar uma prateleira configurada
- aba `Vincular Produtos` para associar produtos existentes a secoes, sem editar prateleiras
- aba `Produtos` para cadastrar e listar produtos
- tela de busca separada, por enquanto sem exibir o mapa da loja
