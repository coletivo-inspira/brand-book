# Direção A — Coletivo Inspira

Memória de interface do hub e do Brand Book. Sessões seguintes seguem estas regras.

## Fundação

- 60% claro: off-white `#F7F7F4` com malha pontilhada (1px a cada 20–24px, floresta a ~18% de opacidade).
- 30% arquitetura: verde floresta `#133824` como tinta, contorno e bloco de contraste. Menta `#A7E8C8` e lima `#B4FF33` como superfícies modulares.
- 10% ação: mostarda `#E5A93C`, laranja `#FF6B2C`, rosa `#FF3385`. Só em CTA, status, sticker e acento.

## Tipografia

- Display: Syne, leading 100–110%, alinhamento à esquerda.
- Corpo: DM Sans, leading 140–160%.
- Escala de referência no Brand Book: H1 48px, corpo 16px. O hero do portal pode ser maior, mantendo a razão display/corpo.

## Superfície

```css
--color-bg-primary: #F7F7F4;
--color-forest: #133824;
--color-lime: #B4FF33;
--color-mint: #A7E8C8;
--color-mustard: #E5A93C;
--color-orange: #FF6B2C;
--color-pink: #FF3385;
--border-hairline: 1px solid rgba(19, 56, 36, 0.16);
--shadow-inspira-soft: 4px 4px 0px rgba(19, 56, 36, 0.12);
--shadow-inspira-lime: 4px 4px 0px #B4FF33;
```

`.surface-dot-grid` usa o fundo off-white e pontos radiais. `.surface-mint-dot-grid` usa menta.

## Movimento

- Reveal no scroll, stagger do wordmark, hover tátil e rotação lenta do selo.
- `prefers-reduced-motion: reduce` desliga loops, stagger e transições longas.

## Não fazer

- Dark mode, glassmorphism, cream com serif, roxo genérico, dashboards densos.
- Cards flutuantes empilhados no hero. Um acento por região.
- Paletas Solar, Pop e Tropical são variações de projeto no Brand Book. A home do hub usa só a base clara.

## Componentes do hub

- Hero claro com foto do Rio Formoso, nós digitais sutis e um Starburst lima.
- Quatro pilares em abas de pasta.
- História com rota topográfica Bonito–BH.
- Vitrine e repositórios em grade hairline 1px, filtros em pílulas `+` / `×`.
- Métricas bipartidas. Anel de contribuidores só com contagem real da API.
- Selo “Feito com +INSPIRA” aponta para `/solucoes/`.
