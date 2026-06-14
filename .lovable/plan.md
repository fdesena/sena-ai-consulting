## Contexto
O header atual usa `justify-between` e o logo tem `min-w-[280px]` (necessário para o efeito TypeWriter não pular o layout). Isso faz o menu de navegação ficar deslocado para a direita, em vez de centralizado.

## Objetivo
Alinhar o menu de navegação ao centro do header, independentemente da largura do logo ou do botão CTA.

## Alterações
1. **LandingPage.tsx — Header**
   - Adicionar `relative` ao container `div` interno do `<header>`.
   - Adicionar `absolute left-1/2 -translate-x-1/2` ao `<nav>` das opções de menu.
   - Isso centraliza o menu perfeitamente na largura total do header, sem ser afetado pelos elementos laterais (logo e CTA).
   - O menu continua visível apenas em `md:flex` (o comportamento responsivo atual se mantém).

## Validação
- Verificar visualmente que as opções "O que faço", "Processo", "Cases", "Sobre" e "Área exclusiva" fiquem alinhadas ao centro da página, simétricas em relação ao logo.
- Confirmar que o botão "Fale comigo" permanece à direita.