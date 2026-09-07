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

- [x] Controlar quantidade por localizacao
- [x] Registrar lotes
- [x] Registrar datas de validade
- [x] Alertar produtos proximos do vencimento
- [x] Registrar movimentacoes de entrada e saida

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

## Progresso da Fase 5

Foi criada a primeira versao do modulo de estoque:

- migration `V3__create_inventory_model.sql`
- entidades `InventoryItem`, `InventoryLot` e `InventoryMovement`
- tipo de movimentacao `InventoryMovementType` com entrada, saida e ajuste
- repositories, DTOs, services, controllers e exceptions no pacote `inventory`
- controle de saldo por `ProductLocation`
- cadastro de lotes com validade opcional
- endpoint de lotes proximos do vencimento
- registro de movimentacoes de entrada, saida e ajuste
- validacao para impedir saida maior que o saldo atual
- tela `Estoque` no frontend com abas de saldos, lotes, movimentacoes e alertas

Endpoints iniciais da Fase 5:

- `GET /api/inventory/items`
- `GET /api/inventory/items/{id}`
- `POST /api/inventory/items`
- `PUT /api/inventory/items/{id}`
- `GET /api/inventory/lots`
- `GET /api/inventory/lots/expiring?days=30`
- `GET /api/inventory/lots/{id}`
- `POST /api/inventory/lots`
- `PUT /api/inventory/lots/{id}`
- `GET /api/inventory/movements`
- `POST /api/inventory/movements`

Validacoes executadas:

```bash
cd F:\market-map\backend\backend
.\mvnw.cmd clean test -q

cd F:\market-map\frontend
npm.cmd run build
npm.cmd run lint
```

## Busca com navegação até o produto

- [x] Cadastro persistente de terminais por layout.
- [x] Associação do navegador a um terminal e opção de desvincular.
- [x] Cadastro de obstáculos e pontos de acesso das prateleiras.
- [x] Validação de posições e margem de passagem.
- [x] Serviço A* com desvios e resposta para caminhos indisponíveis.
- [x] Sugestões por nome, SKU e marca, agrupadas por produto.
- [x] Filtro pelo layout do terminal e indicação de produtos sem localização.
- [x] Seleção de produto e escolha entre múltiplas localizações.
- [x] Mapa de consulta com origem, percurso, destino e distância aproximada.
- [x] Vista frontal com níveis, posições e seção destacada.
- [x] Componentes de navegação separados da edição de prateleiras.
- [x] Testes automatizados de rotas, persistência e busca.
- [ ] Validação física dos caminhos na loja com terminais e obstáculos reais.

Guia de configuração e limites desta versão: [NAVIGATION.md](NAVIGATION.md).

## Formato irregular da loja

- [x] Contorno persistido por layout, com migração V5.
- [x] Modelos retangular, L e U.
- [x] Desenho livre e edição dos vértices por arraste ou coordenadas.
- [x] Prévia da área e das prateleiras existentes.
- [x] Validação de paredes cruzadas, pontos repetidos e limites.
- [x] Proteção contra contornos que deixem prateleiras, obstáculos ou terminais fora da loja.
- [x] Mapas de configuração e busca representam o contorno.
- [x] Rotas respeitam recortes e paredes inclinadas.
- [x] Criação de prateleiras procura uma posição inicial dentro do contorno.
- [x] Testes de geometria, persistência e rotas em formatos irregulares.

## Correções da integração entre contorno e navegação

- [x] Validar coordenadas na prévia e impedir salvar pontos inválidos.
- [x] Carregar o contorno persistido ao abrir a configuração de terminais.
- [x] Destacar prévias não salvas e erros de gravação do contorno.
- [x] Selecionar computador de origem diretamente na busca.
- [x] Calcular chegada automática quando não há acesso manual.
- [x] Preservar prioridade do acesso configurado.
- [x] Testar chegada automática em loja U e rejeição de terminal no recorte.
