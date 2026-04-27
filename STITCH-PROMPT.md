# PROMPT PARA GERAR TELAS NO STITCH - REDFLIX

## Sobre o Negócio
RedFlix é um serviço de streaming/IPTV premium que oferece filmes, séries, esportes ao vivo e canais em 4K. O site é focado em conversão rápida via Pix. A identidade visual é escura (preto/cinza) com vermelho (#E50914) como cor principal de destaque. Público brasileiro, linguagem informal e urgente.

---

## TELA 1: LANDING PAGE PRINCIPAL (Desktop + Mobile)

### Prompt Stitch:
```
Design a premium dark-themed landing page for "RedFlix", a streaming/IPTV service. 

HEADER: Sticky top bar with RedFlix logo (red text on black), a countdown timer showing "Oferta expira em XX:XX", and a CTA button "ASSINAR AGORA".

HERO SECTION: Full-width dark gradient background (#0a0a0a to #1a0202). Large bold headline "TODO O ENTRETENIMENTO. UM SÓ LUGAR." with subtitle "Filmes, Séries, Esportes ao vivo, Canais e muito mais em 4K". Show a grid of movie/series poster thumbnails with a subtle glow effect. Red CTA button "VER PLANOS".

SOCIAL PROOF BAR: Horizontal scrolling strip showing competitor logos (Netflix, HBO, Disney+, Prime, etc) with text "Inclui conteúdo de:" above.

PRICING SECTION: 3 pricing cards on dark background:
- Card 1: "1 Mês" - R$ 29,90 (was R$ 39,90) 
- Card 2 (HIGHLIGHTED with red border + "MAIS POPULAR" badge): "3 Meses" - R$ 79,90 (was R$ 89,70) - "Economize 11%"
- Card 3: "6 Meses" - R$ 149,90 (was R$ 179,40) - "Economize 16%"
Each card shows: price, period, old price crossed out, number of active users "1.257 assinantes ativos", and a red "ASSINAR" button.

FEATURES GRID: 4 feature cards with icons:
- "4K Ultra HD" - streaming quality
- "7.000+ Conteúdos" - library size  
- "Suporte 24h" - WhatsApp support
- "Acesso Instantâneo" - instant delivery after payment

TESTIMONIALS: 4 testimonial cards with:
- User avatar (initials in circle)
- Name and badge ("VERIFICADO" green badge, "MEMBRO GOLD" gold badge, "ATIVO AGORA" blue badge)
- Star rating (5 stars)
- Quote text
Dark card background (#111) with subtle border.

FAQ ACCORDION: Common questions like "Como funciona?", "Posso usar na TV?", "O pagamento é seguro?", "E se eu não gostar?".

FOOTER: Minimal dark footer with RedFlix logo, copyright, WhatsApp support link.

COLOR PALETTE: Background #0a0a0a, Cards #111111, Primary Red #E50914, Text white/gray, Accent green for badges #22c55e.
TYPOGRAPHY: Modern sans-serif (Outfit or Inter), bold headlines, clean body text.
STYLE: Premium, dark, cinematic feel. Subtle red glows and gradients. Glass morphism on cards.
```

---

## TELA 2: PÁGINA DE CHECKOUT / PIX (Desktop + Mobile)

### Prompt Stitch:
```
Design a checkout page for "RedFlix" streaming service with Pix payment.

LAYOUT: Dark background, centered card layout, minimal distractions.

STEP 1 - FORM:
- Selected plan summary at top (plan name, price, period)
- Email input (with @gmail.com validation hint)
- Phone input (Brazilian format)
- Red "GERAR PIX" button
- Trust badges below: "Pagamento Seguro", "Dados Protegidos", "Acesso Imediato"
- Countdown timer "Oferta expira em XX:XX"

STEP 2 - PIX CODE:
- QR Code displayed in center (white bg, rounded)
- "Pix Copia e Cola" text field with copy button
- Animated pulsing indicator "Aguardando pagamento..."
- Instructions: "1. Abra seu app do banco  2. Escaneie o QR Code ou cole o código  3. Confirme o pagamento"
- Price reminder in large red text "R$ 79,90"

STEP 3 - SUCCESS SCREEN:
- Large green checkmark animation
- "PAGAMENTO CONFIRMADO!" headline
- Confetti or celebration effect
- "Seu acesso será liberado em instantes" subtitle
- WhatsApp button "RESGATAR MEU ACESSO" (green)
- Email confirmation notice

STYLE: Same dark premium theme. Red #E50914 primary. Green #22c55e for success states.
```

---

## TELA 3: PÁGINA RENOVE (Desktop + Mobile)

### Prompt Stitch:
```
Design a renewal/upgrade page for "RedFlix" streaming service called "Renove".

CONCEPT: Page for existing subscribers to renew their subscription. Should feel exclusive and rewarding.

HEADER: RedFlix logo + "RENOVAÇÃO EXCLUSIVA" badge in gold.

HERO: Dark gradient with text "Sua Assinatura Merece Continuar" with subtitle "Renove agora com desconto especial para membros ativos". Show a subtle animated glow.

PRICING: Same 3 plans as main page (1 Mês R$29,90 / 3 Meses R$79,90 / 6 Meses R$149,90) but with an extra "RENOVAÇÃO" badge on each card.

BENEFITS SECTION: Why renew:
- "Sem Interrupção" - continuous access
- "Preço Especial" - member discount  
- "Prioridade no Suporte" - VIP support
- "Novos Conteúdos Primeiro" - early access

FORM + PIX: Same checkout flow as main page.
SUCCESS: Same success screen.

STYLE: Same dark theme but with subtle gold/amber accents (#f59e0b) to differentiate from main page. Premium "VIP member" feel.
```

---

## TELA 4: DASHBOARD ADMIN (Desktop)

### Prompt Stitch:
```
Design an admin dashboard for "RedFlix" streaming management.

TOP BAR: 
- Left: Toggle buttons "Dash Principal" (red active) | "Dash Renove" (blue) | "Combinado" (purple)
- Right: Period dropdown (Hoje, 7 dias, 30 dias, Tudo)

KPI CARDS ROW: 8 cards in a 4-column grid, dark background (#0d0d0d) with colored left borders:
1. "Lucro" - R$ 1.250,00 (green border, green value, subtitle "R$ 350,00 pendente")
2. "Vendas Hoje" - 12 (blue border, progress bar to goal of 20)
3. "Leads" - 847 (purple border)
4. "Novos Assinantes" - 234 (cyan border, subtitle "32 recorrentes")
5. "Renovações" - 89 (amber border)
6. "Conversão" - 28.5% (pink border)
7. "Pendentes" - R$ 2.100,00 (orange border)
8. "Assinaturas Ativas" - 456 (emerald border)
Each card: dark bg #111, bright text, colored icon, subtle glow matching border color.

TRANSACTIONS TABLE:
- Header row 1: Tab buttons "Aprovados (234)" | "Pendentes (56)" + Origin dropdown (Todas, Landing, Dash Pix, Renove) + Delete button
- Header row 2: Search input + Plan filter + Price filter
- Table columns: Email, Plano, Preço, Origem (colored badge), Data, Status (green/yellow badge), Ações
- Action buttons always visible: WhatsApp icon, Copy icon, Trash icon, Pix refresh icon
- Pagination at bottom

PIX GENERATOR PANEL (collapsible):
- Toggle between "Real" and "Anônimo" mode
- Email + Phone + Value inputs
- "GERAR PIX" red button
- QR code display area
- Success state with green checkmark

STYLE: Very dark theme (#0a0a0a bg, #111 cards), bright colored accents for each metric. Clean modern table. Professional admin feel.
```

---

## TELA 5: EMAILS (Desktop preview)

### Prompt Stitch:
```
Design 2 email templates for "RedFlix" streaming service.

EMAIL 1 - PAYMENT APPROVED:
- White background email, max 600px width
- Header: Black/dark gradient bar with RedFlix logo, red bottom border
- Body: Large green checkmark icon, "ACESSO LIBERADO!" heading, description text explaining next steps
- Info box: Gray background with numbered steps (1. Click support, 2. Receive credentials, 3. Enjoy 4K content)  
- Red CTA button "RESGATAR MEU ACESSO"
- Footer: Light gray bar with copyright

EMAIL 2 - PAYMENT PENDING:
- Same layout structure
- Yellow/orange clock icon instead of checkmark
- "PEDIDO PENDENTE" heading
- Large price display "R$ 79,90" in red
- Description about completing payment
- Red CTA button "FALAR COM SUPORTE"
- Footer: Same

STYLE: Clean, professional, white background. Red #E50914 for buttons and accents. Modern typography.
```

---

## NOTAS GERAIS PARA TODAS AS TELAS

- **Fonte principal**: Outfit (Google Fonts) - moderna, geométrica
- **Cores**: Fundo #0a0a0a, Cards #111111, Vermelho #E50914, Verde #22c55e, Azul #3b82f6, Amarelo #f59e0b
- **Bordas**: Arredondadas (8-12px), sutis (1px solid #222)
- **Efeitos**: Glows suaves coloridos, gradientes escuros, glass morphism leve
- **Responsivo**: Todas as telas devem ter versão mobile
- **Tom**: Premium, exclusivo, urgente (countdown timers, badges de escassez)
