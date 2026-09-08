# Sena Labs — Brand Kit 1.0

Direção final: monograma SL unido, laranja sólido, sem quadriculado. Nome em Nimbus Sans Regular com espaçamento ajustado e convertido em curvas.

## Arquivos
- `svg/`: logos horizontais, símbolos isolados e composição vertical. Todos vetoriais, com fundo transparente e letras em curvas.
- `png/`: versões transparentes em alta resolução. Para impressão/ampliação, prefira SVG.
- `motion/`: SVG animado para fundo claro ou escuro, GIF de prévia e MP4. SVG é transparente; GIF e MP4 têm fundo grafite.
- `web/`: componente React/TypeScript, tokens CSS/JSON, favicon SVG/ICO e ícone PNG.
- `guide/`: manual visual HTML, abre diretamente no navegador e funciona offline.

## Escolha da versão
`dark`: nome off-white + SL laranja, para fundo escuro.
`light`: nome grafite + SL laranja, para fundo claro.
`white`: marca inteira off-white, para fundo escuro.
`black`: marca inteira grafite, para fundo claro.

## Uso
Mantenha proporções e a margem livre incluída. Largura mínima inicial: horizontal 180px e símbolo isolado 32px. O favicon tem sua própria base grafite para funcionar em abas claras e escuras. Não estique, não aplique sombra ou gradiente ao logo básico e não recomponha o nome usando outra fonte.

## Web sem React
Use `<img src="/brand/sena-labs-horizontal-light.svg" alt="Sena Labs" width="360">`.
Copie os SVGs para sua pasta pública e ajuste o caminho. A animação pode ser usada da mesma forma com `sena-labs-animated-light.svg`.
Abra o HTML do guia no navegador após o download para ver a animação offline.

## React
Copie `web/SenaLogo.tsx`. Uso: `<SenaLogo variant="dark" width={360} animated />`.
Para símbolo: `<SenaLogo variant="dark" symbolOnly width={48} />`.
Em um link para home, use `<a href="/" aria-label="Sena Labs — início"><SenaLogo decorative /></a>`.
Não há fontes, bibliotecas de animação nem recursos externos. React é a única dependência do componente.

## Movimento
Abertura única de 1,1s: revelação horizontal do SL, seguida da entrada do nome. A marca fica completa ao final. O SVG e o componente respeitam `prefers-reduced-motion`. GIF e vídeo são prévias e não respondem à preferência do navegador.

## Cor e contraste
O laranja é cor do símbolo e de destaque. Para textos pequenos, use grafite sobre off-white ou off-white sobre grafite. Se usar botão laranja, prefira texto grafite.

## Fontes e reprodução
O wordmark foi desenhado a partir de Nimbus Sans Regular (URW Base35) e convertido em curvas. Nenhuma instalação de fonte é necessária. Os SVGs são a fonte oficial; as cores são preenchimentos exatos #FC7C34, #101112 e #F8F7F5.
