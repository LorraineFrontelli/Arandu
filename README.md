# Arandu — Direito à Cultura

Revista web tridimensional com as 20 páginas de **Revista 1440×1024**, preservadas a partir do arquivo do Figma. Começa fechada, sobre uma mesa de madeira, vista de cima. O modelo tem folhas com frente e verso. A leitura acompanha uma face por vez: esquerda → direita → virada da folha. O leitor funciona como site estático e está preparado para GitHub Pages.

Este é o projeto completo: os códigos estão em `src/`, os recursos originais em `public/`, e a configuração de publicação em `.github/`. Não é necessário copiar trechos de uma conversa para montar o site.

## Abrir no VS Code

1. Extraia o ZIP.
2. No VS Code, escolha **Arquivo → Abrir Pasta** e selecione `revista-direito-a-cultura` — a pasta que contém `package.json`.
3. Instale o **Node.js 24** caso ainda não esteja instalado.
4. Abra **Terminal → Novo Terminal** no VS Code e execute:

```sh
npm install
npm run dev
```

Abra o endereço que aparecer no terminal. Não abra `index.html` por duplo clique: os módulos e recursos da revista devem ser servidos por HTTP, como acontece no GitHub Pages.

Para reproduzir exatamente as dependências já verificadas, você também pode usar `npm ci` no lugar de `npm install`.

## Gerar e conferir a versão publicável

```sh
npm run verify
npm run build
npm run preview
```

O build gera `dist/`, contendo o HTML, CSS, JavaScript, páginas, imagens e fontes. O comando `preview` serve esse build localmente. Node.js é necessário apenas para desenvolver e gerar o build; os leitores precisam somente de um navegador.

## Publicar no GitHub Pages

O projeto já inclui `.github/workflows/deploy.yml`. A publicação acontece na sua conta quando você enviar os arquivos e habilitar o Pages. Nenhum conteúdo foi enviado ao GitHub durante a preparação deste projeto.

1. Entre no GitHub e crie um repositório. Uma opção é chamá-lo `revista-direito-a-cultura`.
2. Para usar o GitHub Pages no plano gratuito, escolha um repositório público.
3. Envie os arquivos do projeto. Inclua a pasta oculta `.github`, o arquivo `.gitignore`, `package-lock.json` e todos os recursos de `public/`.
4. Não envie `node_modules/`. A pasta `dist/` também não precisa ser enviada: o workflow a gera automaticamente.
5. No repositório, abra **Settings → Pages**.
6. Em **Build and deployment → Source**, escolha **GitHub Actions**.
7. Abra **Actions → Publicar revista no GitHub Pages**. Aguarde o build e a publicação terminarem. Se o primeiro envio aconteceu antes de configurar o Pages, execute **Run workflow** nessa tela.
8. O link público aparece no resultado da etapa de publicação e em **Settings → Pages**. Ele normalmente terá o formato `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`.

Se preferir enviar pelo terminal do VS Code, substitua `SEU_USUARIO` e o nome do repositório pelos valores da sua conta:

```sh
git init -b main
git add .
git commit -m "Adicionar revista Arandu"
git remote add origin https://github.com/SEU_USUARIO/revista-direito-a-cultura.git
git push -u origin main
```

O Git pode solicitar a autenticação da sua conta do GitHub. O workflow de publicação usa o `GITHUB_TOKEN` fornecido automaticamente pelo próprio GitHub; não é necessário criar ou inserir um token pessoal no projeto.

### Nome do repositório e caminhos

No GitHub Actions, o nome e o caminho do site são detectados por `actions/configure-pages` e enviados para o Vite por `BASE_PATH`. Não é necessário escrever seu usuário ou repositório no código.

O workflow está configurado para a branch `main`. Se você usar outra branch, altere `branches: [main]` em `.github/workflows/deploy.yml`.

Fora do GitHub Actions, o build usa `/` por padrão. Para simular manualmente um repositório chamado `revista-teste`, use:

macOS/Linux:

```sh
BASE_PATH=/revista-teste/ npm run build
BASE_PATH=/revista-teste/ npm run preview
```

PowerShell:

```powershell
$env:BASE_PATH="/revista-teste/"
npm run build
npm run preview
Remove-Item Env:BASE_PATH
```

Abra o endereço exibido pelo terminal com `/revista-teste/` ao final. Depois, gere novamente sem `BASE_PATH` se quiser voltar à configuração local padrão.

### Atualizar a revista publicada

Edite os arquivos, confira com `npm run verify` e `npm run build`, e envie um novo commit à branch `main`. O GitHub Actions gera e publica a nova versão. Não é necessário reenviar uma pasta `dist` manualmente.

## Como usar o leitor

- Uma visita sem fragmento começa na capa fechada. Clique nela ou no botão abaixo para abrir. Se houver uma leitura anterior salva, **Continuar na página…** oferece retomá-la sem pular a capa automaticamente.
- O modelo físico tem **20 faces impressas em 10 folhas**. A sequência é: capa `1`; aberturas `2–3`, `4–5`, `6–7`, `8–9`, `10–11`, `12–13`, `14–15`, `16–17`, `18–19`; contracapa `20`.
- A frente da folha 1 é a página 1 e seu verso é a 2; a frente da folha 2 é a página 3 e seu verso é a 4, e assim por diante. Os quadros não foram fundidos nem redesenhados: cada um continua sendo uma página de 1440×1024.
- Os botões originais **ANTERIOR**, **PRÓXIMA**, **SUMÁRIO** e **CAPA** funcionam nos locais do Figma. **PRÓXIMA percorre uma página por vez**: a capa abre na 2 (esquerda); o próximo comando move a câmera para a 3 (direita), sem virar a folha; somente o seguinte vira a folha e abre a 4 (esquerda). A sequência continua `4 → 5 → virada → 6`. O retorno faz a sequência inversa, sem pular a face direita da abertura anterior.
- Os itens do sumário levam às respectivas páginas.
- A página ativa é ajustada inteira ao espaço disponível, também no celular, sem mudar a proporção de fotos, gráficos ou textos. A folha vizinha pode aparecer parcialmente nas bordas, como contexto do modelo físico. **Não há botões de ampliar esquerda/direita**: a própria navegação move o enquadramento.
- O ícone de revista com um `x` na barra fecha a revista e retorna à capa. Na contracapa, tanto o botão original **CAPA ↺** quanto **Voltar à capa** viram o objeto fechado para revelar a capa frontal, sem rebobinar as páginas internas. Clicar na área superior da contracapa ou usar Anterior reabre na página 19.
- Arraste a folha ou seus cantos com o mouse; no celular, deslize para navegar. Para selecionar texto com o mouse, comece o arraste sobre o próprio texto.
- A barra inferior oferece navegação, seleção direta de página, miniaturas, pesquisa, marcadores, zoom, compartilhamento e tela cheia.
- Clique em uma imagem, gráfico ou diagrama para abrir seu recorte editorial em um **pop-up central limpo**, sem cabeçalho ou rodapé fixos. O X circular usa o vermelho e os tons de papel da revista. Os pequenos controles de `+`, `−` e ajuste flutuam abaixo do conteúdo; roda, pinça e arraste continuam disponíveis. Feche pelo X, por Escape ou clicando fora.
- Um deslize sobre uma imagem navega pela revista; um clique sem arraste abre sua ampliação. Isso evita abrir um pop-up por engano ao virar a página.
- Nos gráficos, o botão de lista abre os valores e textos originais. Passe o mouse, use o foco do teclado ou toque em um item para destacá-lo.
- Referências com um endereço abrem diretamente o link original. Referências com mais de um endereço abrem um painel para você escolher entre todos os links citados. E-mails mantêm os endereços do original.
- A pesquisa ignora diferenças de maiúsculas e acentos. Os resultados levam à página e destacam os trechos por alguns segundos.
- Marcadores, última página e visibilidade dos controles ficam salvos somente no navegador do leitor, quando o armazenamento local estiver disponível.
- O botão de olho oculta os controles para uma leitura mais limpa; use-o novamente para restaurar a barra.
- O compartilhamento copia um endereço como `#pagina=13`. Ele funciona ao abrir diretamente e ao atualizar a página, sem criar rotas que dependam de um servidor. Nesse exemplo, o modelo abre `12–13` com o enquadramento e a leitura na face `13`. O seletor **IR À** permite escolher qualquer face.

### Teclado e acessibilidade

- `←` e `→`: página anterior e próxima, alternando movimento da leitura e virada da folha.
- `Home` e `End`: capa e contracapa.
- `S`: pesquisar. `Z`: ampliar a página.
- `Escape`: fechar um painel ou visualização ampliada.
- `Tab`: percorrer os controles e os elementos interativos.

Os diálogos usam o comportamento modal nativo, retornam o foco ao controle anterior e têm botões identificados. O texto original também está disponível em uma camada acessível para leitores de tela. A preferência `prefers-reduced-motion` elimina a animação automática da navegação por controles. Atalhos não interceptam campos de edição nem combinações com teclas modificadoras.

## Tecnologias utilizadas

| Tecnologia | Função |
| --- | --- |
| React e TypeScript | Componentes e estados do leitor com tipos explícitos. |
| Vite | Desenvolvimento e build estático, com caminho configurável para o Pages. |
| CSS 3D | Modelo sobre a mesa: perspectiva superior, planos laterais perpendiculares, espessura do miolo, lombada, sombra de contato e reposicionamento ao abrir/fechar. |
| StPageFlip (`page-flip`) | Folhas com frente/verso, duas páginas lado a lado, capa/contracapa isoladas e virada com dobra, sombras e arraste. |
| SVG com texto | Geometria, recortes, vetores e posições de texto exportados do original. |
| Pointer Events | Ampliação, deslocamento e gesto de pinça nas visualizações ampliadas. |
| Lucide React | Ícones apenas na interface adicional de leitura. |
| GitHub Actions | Build e publicação automática da pasta `dist`. |

As fontes estão incluídas localmente: Playfair variável normal e itálica, Barlow Condensed nos pesos usados e Bodoni Moda. As licenças das fontes estão em `public/assets/fonts/`.

### Como foi feito o 3D

O objeto é construído no navegador com planos CSS usando `perspective`, `transform-style: preserve-3d`, `translateZ`, `rotateX` e `rotateY`. `BookVolume.tsx` monta as laterais e a espessura das pilhas de folhas; essa espessura muda conforme a leitura avança. A mesa é um SVG procedural local, não uma imagem editorial substituída.

`PageTurner.tsx` mantém as faces como HTML/SVG vivo no motor StPageFlip, configurado com `showCover: true` e `usePortrait: false`. A biblioteca calcula a dobra durante o arraste, a face posterior, a sombra e o retorno de um gesto incompleto. A transição do objeto sobre a mesa acompanha a abertura da capa. Não é apenas uma imagem que desliza, nem uma única rotação rígida nas folhas internas.

`useBookGestures.ts` coordena mouse, toque e Pointer Events sobre o DOM das páginas. A câmera se move entre as faces da mesma abertura; a biblioteca só vira a folha quando a leitura cruza para outra abertura. `CoverTurnover.tsx` representa os dois lados da revista fechada para o retorno físico da contracapa à capa.

Esta é uma representação tridimensional interativa em CSS/DOM; não é um arquivo de modelagem `.blend` ou `.glb`, nem uma simulação física de fibras do papel. Essa implementação mantém texto selecionável, links e gráficos acionáveis diretamente sobre as páginas, sem exigir WebGL ou plugins. A capa tem comportamento mais rígido que o miolo.

As 33 imagens foram convertidas de PNG para WebP **sem perda**, com comparação dos pixels decodificados; a conversão reduziu aproximadamente 10,9 MB. Não foram substituídas por outras imagens. Páginas próximas são preparadas antecipadamente, e as páginas visitadas são mantidas prontas para navegação. A preparação inicial e os saltos aguardam as imagens das duas faces da abertura de destino.

A preparação usa `Image.decode()`. Se a página solicitada mudar durante o carregamento inicial, `prepareLatest.ts` prepara a nova seleção antes de revelar a revista. Isso evita abrir a capa com a prontidão de outra página e exibir fotos ainda vazias. A barra de navegação só fica interativa após a preparação; falhas de imagem mantêm a página anterior com opção de tentar novamente.

Não há API, token do Figma, credencial ou banco de dados no site entregue. As requisições de leitura carregam apenas arquivos do próprio site. Links de referência podem abrir os sites citados quando o leitor os aciona.

## Arquitetura e edição

A listagem completa dos arquivos entregues está em [ARQUITETURA.txt](./ARQUITETURA.txt).

```text
revista-direito-a-cultura/
├── .github/workflows/deploy.yml
├── public/assets/
│   ├── fonts/        # Fontes e suas licenças
│   ├── images/       # Imagens originais, em WebP sem perda
│   ├── pages/        # Os 20 SVGs editoriais com texto selecionável
│   ├── previews/     # Miniaturas das 20 páginas
│   └── scene/        # oak-table.svg: mesa procedural local
├── scripts/
│   ├── verify-content.mjs
│   ├── verify-book.mjs
│   └── build-notices.mjs
├── src/
│   ├── content/      # Conteúdo, metadados e resolução de caminhos
│   ├── components/   # Leitor, navegação, painéis e gráficos
│   ├── hooks/        # Navegação e gestos
│   ├── styles/       # Fontes, cores, interface e interações
│   ├── types/        # Tipos do conteúdo e do motor de páginas
│   ├── utils/        # bookGeometry.ts: folhas/aberturas; storage.ts: memória
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig*.json
└── dist/             # Build gerado; não é necessário enviar ao Git
```

### Onde alterar cada coisa

- **Texto, vetores e composição visível de uma página:** `public/assets/pages/page-01.svg` até `page-20.svg`. As camadas mantêm os identificadores `data-node-id` do Figma.
- **Pesquisa, texto acessível, títulos e áreas interativas:** `src/content/magazine.json`. Ao editar um texto visível no SVG, atualize também o texto correspondente nesse JSON. `npm run verify` confere sua correspondência.
- **Carregamento e caminhos de recursos:** `src/content/magazine.ts`.
- **Cores e fontes da interface adicional:** `src/styles/tokens.css` e `fonts.css`.
- **Ajuste às telas e barra de leitura:** `src/styles/magazine.css`.
- **Mesa, volume 3D, laterais, luz, sombra e posição aberta/fechada:** `src/styles/desk.css`, `src/components/BookVolume.tsx` e `public/assets/scene/oak-table.svg`.
- **Frente/verso e quais páginas ficam lado a lado:** `src/utils/bookGeometry.ts`. A sequência é verificada por `scripts/verify-book.mjs`.
- **Painéis, zoom e estados interativos:** `src/styles/interactions.css`.
- **Virada de páginas e preparação das folhas:** `src/components/PageTurner.tsx`.
- **Gestos e distinção entre clique em imagens e deslize:** `src/hooks/useBookGestures.ts`.
- **Virar a revista fechada da contracapa para a capa:** `src/components/CoverTurnover.tsx`.
- **Botões originais e áreas clicáveis:** `src/components/MagazinePage.tsx` e os `hotspots` do JSON.
- **Zoom e destaque dos gráficos:** `ZoomDialog.tsx`, `InteractiveChart.tsx` e `useZoomGestures.ts`.
- **Publicação:** `.github/workflows/deploy.yml` e `vite.config.ts`.

Os SVGs contêm o marcador `__ASSET_BASE__` nos caminhos de imagem. O leitor o resolve para o caminho público correto. Preserve esse marcador ao editar os recursos.

## Fidelidade e verificações

- Foram usadas as 20 páginas atuais de 1440×1024; a versão A4 antiga não foi usada como conteúdo da revista.
- Foram conferidas automaticamente 326 camadas editoriais de texto contra a representação SVG, além da existência das imagens e fontes locais e dos destinos de navegação.
- Foram capturadas e comparadas visualmente as 20 páginas no navegador, com a área editorial em 1440×1024.
- As imagens WebP foram verificadas com igualdade de pixels em relação aos PNGs originais.
- O build passou na verificação do TypeScript e do Vite.
- O teste automático do livro físico conferiu as 20 faces, as 10 folhas, as 11 posições, as duas direções de navegação e a correspondência de links para faces ímpares.
- Um teste de regressão simula a seleção mudando da página 7 para a capa durante a preparação e confirma que a capa também é preparada antes de ser exibida.
- Nesta revisão, as 20 páginas foram capturadas em 390×844. O enquadramento de cada face foi conferido, incluindo fotos, gráficos, capa e contracapa.
- Foram conferidos os passos `2 → 3` sem virada e `3 → 4` com virada, tanto pelos botões originais quanto por arraste. O retorno da página 4 à 3 e da 3 à 2 também foi exercitado.
- O botão original **CAPA ↺** da contracapa foi acionado: apareceram as duas superfícies do objeto durante a animação e, ao terminar, a capa frontal ficou ativa.
- O pop-up foi conferido sem `.dialog-heading` ou rodapé; fechamento, zoom e distinção entre arraste e clique em imagens foram exercitados.
- Foram testados arrastes nos dois sentidos e um arraste que não cruzou a lombada, retornando à abertura original.
- Foram exercitados botões originais, navegação direta, sumário, busca, destaques, marcadores, miniaturas, ampliação, pan, restauração e fechamento por Escape.
- Uma instalação limpa com `npm ci` foi executada, seguida de novo build.
- Foram conferidos os tamanhos 320×568, 390×844, 768×1024, 1024×768, 852×393, 1920×1080 e 320×393, incluindo redimensionamento sem recarregar. Fotos da página 7 e gráficos da página 13 permaneceram com a face ativa inteira dentro da tela, sem rolagem horizontal da interface.
- O build 3D foi servido também em `/revista-teste/`: scripts, CSS, fontes, imagens e a textura da mesa carregaram com o prefixo correto. A abertura e a atualização em `#pagina=13` mantiveram a abertura `12–13`, sem erros no console.
- A sintaxe YAML do workflow, a branch de disparo, as permissões e a dependência entre build e publicação foram verificadas. O workflow não foi executado em uma conta do GitHub durante esta entrega.

O design mantém sua proporção: a face ativa é ajustada por inteiro, e a câmera acompanha a sequência de leitura. A página vizinha permanece no modelo físico, sem forçar duas miniaturas dentro da tela do celular. A ampliação adicional acontece em pop-up. Isso evita reconstruir colunas, distorcer imagens ou mudar posições do original. A interface de controles se adapta separadamente.

Não é uma promessa de igualdade de rasterização entre todos os navegadores: antialiasing e a renderização de fontes podem variar. Os testes visuais foram feitos no navegador integrado; um gesto de pinça em um aparelho físico e todos os modelos de leitor de tela não foram ensaiados. O recurso de tela cheia depende do suporte e das permissões do navegador.

## Referências técnicas

- [Publicação estática com Vite e GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [Configuração de publicação no GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [StPageFlip](https://nodlik.github.io/StPageFlip/)

As licenças de dependências usadas na versão de leitura estão em `THIRD-PARTY-NOTICES.txt`. O conteúdo editorial, as imagens e os créditos continuam sendo os do material fornecido.
