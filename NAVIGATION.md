# Busca com localização de produtos

## Preparar o mapa

1. Em Configuração, selecione a loja e o layout.
2. Cadastre as prateleiras nas posições reais e vincule os produtos às seções.
3. Abra **Terminais e caminhos**.
4. Escolha **Computador de busca**, dê um nome, clique no mapa ou informe X/Y em centímetros e salve.
5. No computador correspondente, selecione esse terminal e clique em **Usar este terminal neste navegador**.
6. Opcionalmente, cadastre um **Acesso da prateleira** para escolher uma face específica. Sem esse cadastro, a rota termina automaticamente em uma lateral livre e alcançável.
7. Cadastre **Obstáculos** para paredes, pilares e balcões.

A posição fica no banco; apenas o identificador do terminal fica no armazenamento local do navegador. A associação é específica do navegador e da origem do site (host e porta). Portanto, localhost e 127.0.0.1, portas diferentes, outro perfil ou uma janela anônima precisam de associação própria. Use **Desvincular este navegador** para retirar a associação.

## Usar a busca

- A home pesquisa por nome, marca ou SKU após 300 ms sem digitação.
- Os resultados mostram até 30 produtos, agrupando suas localizações.
- Com terminal associado, a consulta considera seu layout. Produtos sem vínculo com qualquer seção também aparecem, com indicação de que não têm localização.
- Selecione um produto para abrir o mapa e a vista frontal da prateleira.
- Quando houver várias localizações, selecione a desejada no campo Localização.
- O mapa marca o computador, o caminho e a prateleira de destino.
- A vista frontal coloca os níveis maiores acima dos menores e preserva as posições das seções, destacando a seção do produto.
- **Atualizar caminho** consulta novamente os dados salvos.

## Regras desta versão

- No máximo um ponto de acesso manual por prateleira, que tem prioridade sobre a chegada automática. O cadastro deve representar a face usada para pegar o produto. Gôndolas com duas faces independentes precisam ser representadas por prateleiras distintas nesta versão.
- O percurso usa A* em uma grade ortogonal comprimida pelas coordenadas dos obstáculos. Todos os segmentos são verificados contra colisões.
- Margem de 20 cm em relação a prateleiras, obstáculos e bordas do layout. Essa margem é um parâmetro técnico inicial, não uma certificação de acessibilidade.
- O ponto de acesso precisa ficar a até 100 cm da prateleira.
- Prateleiras e obstáculos são retângulos alinhados aos eixos, conforme o modelo atual.
- A distância é aproximada e depende das medidas cadastradas.
- Não há rastreamento do usuário em tempo real: o caminho parte do terminal associado.
- Layouts diferentes e pontos ou caminhos bloqueados geram mensagens explicativas. A ausência de acesso manual usa chegada automática.
- Mudanças na posição de prateleiras podem invalidar acessos e terminais. Corrija a configuração e atualize o caminho.
- A primeira localização da lista é selecionada inicialmente; outras localizações podem ser escolhidas manualmente.

## API

- GET /api/navigation/elements
- POST /api/navigation/elements
- PUT /api/navigation/elements/{id}
- DELETE /api/navigation/elements/{id}
- GET /api/navigation/route?terminalId={id}&shelfId={id}
- GET /api/search/suggestions?query={texto}&layoutId={id}

A migration V4 cria os elementos de navegação sem alterar os dados de produtos ou estoque.

## Validação

- Testes unitários do percurso: caminho direto, desvio, parede completa, pontos inválidos, corredor estreito e origem igual ao destino.
- Testes transacionais de integração: dois terminais, validação de obstáculos, layouts diferentes, ausência de acesso, mudança de prateleira, atualização/exclusão de terminal, acesso duplicado e busca agrupada com produtos sem localização.
- Os registros dos testes transacionais são revertidos ao final de cada teste.
- Frontend: npm run build e npm run lint.
## Configurar lojas com formato irregular

Em **Configuração → Loja → Formato e dimensões**:

1. Informe a largura e a profundidade máximas do desenho em centímetros.
2. Escolha Retângulo, Formato L ou Formato U; ou clique em Desenhar do zero.
3. No desenho livre, clique nos cantos em sequência e depois em Fechar contorno.
4. Arraste os pontos ou altere X/Y nos campos. Use + para inserir um ponto entre dois cantos e mova o novo ponto para formar a parede.
5. Clique em Salvar formato da loja.

O último ponto liga ao primeiro. São aceitos de 3 a 60 cantos, incluindo paredes inclinadas. As paredes não podem se cruzar nem repetir cantos. Pontos intermediários alinhados devem ser removidos.

A área escura da prévia está fora da loja. As prateleiras existentes aparecem sobre o desenho para facilitar o ajuste. O sistema recusa alterações que deixem prateleiras, obstáculos ou pontos de navegação fora do contorno; reposicione os elementos antes de reduzir essa área.

Restaurar salvo descarta apenas a prévia. Os modelos prontos também são apenas prévias até salvar. Layouts antigos continuam retangulares até receberem um contorno.

O contorno define o perímetro externo. Use obstáculos para pilares e áreas internas bloqueadas. O cálculo de rotas respeita tanto o contorno quanto os obstáculos, com a mesma margem de 20 cm. Paredes inclinadas usam uma grade complementar; o caminho é ortogonal e aproximado.

Testes da geometria do frontend: node --experimental-strip-types --test tests/layoutGeometry.test.mjs (executar dentro de frontend).

## Correções de posicionamento e chegada automática

- A configuração dos terminais consulta novamente o contorno salvo ao abrir.
- Cliques em posições inválidas não movem a prévia; coordenadas inválidas digitadas impedem salvar.
- O editor de formato mostra no topo as alterações ainda não salvas e as recusas de gravação. As outras telas usam o contorno persistido, nunca uma prévia descartada.
- A busca permite selecionar o computador de origem diretamente.
- Sem acesso manual, o backend calcula o menor caminho entre as opções alcançáveis ao redor da prateleira. Não assume que a lateral geometricamente mais próxima está acessível.
- A chegada fica marcada no mapa. Acesso manual continua tendo prioridade.