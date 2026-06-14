## Visão geral

Migrar seu site do GitHub Pages para o Lovable. Seu site é um **deck de slides interativo** (12 slides full-screen) com design refinado, animações reveal, scroll-snap, navegação por teclado/toque, seletor de idioma PT/EN/ES, progress bar e dots de navegação.

## Como será feito

O Lovable usa **TanStack Start** (React + Vite), então vou reconstruir seu site como um app React moderno, preservando o design e as interações exatas:

### 1. Estrutura do projeto
- Criar `src/components/DeckPage.tsx` — componente principal com todo o conteúdo dos 12 slides
- Criar `src/lib/translations.ts` — sistema i18n PT/EN/ES
- Atualizar `src/routes/index.tsx` — rota principal apontando para o Deck
- Atualizar `src/routes/__root.tsx` — metadados (title, description, OG tags)

### 2. Design system
- Preservar paleta de cores exata (fundo bege #F8F7F4, texto #1A1916, acentos âmbar #C8853A e verde #2D5A3D)
- Preservar tipografia (Bricolage Grotesque + Fragment Mono via Google Fonts)
- Migrar todo CSS custom para `src/styles.css` com variáveis CSS
- Manter temas de slide: `dark`, `light`, `warm`

### 3. Interatividade
- Scroll-snap vertical com `IntersectionObserver` para animações reveal
- Progress bar, dots de navegação e contador de slides
- Navegação por teclado (setas, PageUp/Down, Home/End)
- Suporte a touch/swipe
- Seletor de idioma com estado React

### 4. Assets
- Extrair a foto do fundador (base64) para um arquivo de imagem em `public/`
- Preservar todos os ícones SVG inline

### 5. SEO / Meta tags
- Atualizar title, description, Open Graph e Twitter cards
- Configurar `lang` dinâmico conforme idioma selecionado

## O que será preservado
- Design visual idêntico ao original
- Todas as 12 seções/slides
- Traduções em PT/EN/ES
- Animações e transições
- Navegação completa (scroll, teclado, touch, dots)

## O que muda
- De site estático HTML para app React moderno
- Otimizado para o ecossistema Lovable (deploy automático, preview)
- Possibilidade futura de adicionar backend, formulários, analytics, etc.

## Notas técnicas
- Não será necessário banco de dados ou backend — site continua estático
- Fontes continuam carregadas do Google Fonts
- Sem dependências externas além do React e TanStack Router