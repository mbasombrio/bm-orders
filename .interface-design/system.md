# bm-orders — Interface Design System

## Product Context
Gestión de pedidos retail. Operadores/vendedores en móvil, entre clientes, revisando y creando pedidos.

## Direction & Feel
Profesional moderno — no AdminLTE. Trustworthy como una app bancaria pero con la fluidez de una app nativa. El gradiente de la app (`#3c8dbc → #1e4f6e`) es la identidad visual principal.

## Primary Color
- Brand: `#3c8dbc`
- Brand dark: `#2d6d94`
- Brand deeper: `#1e4f6e`
- Brand light (tint): `rgba(60, 141, 188, 0.12)`

## Depth Strategy
**Surface color shifts** — sin sombras dramáticas. Jerarquía por color de fondo:
- Canvas: `#f7f8fa`
- Cards: `#ffffff` con `border: 1px solid rgba(0,0,0,0.07)`
- Hero sections: gradiente `linear-gradient(160deg, #3c8dbc 0%, #1e4f6e 100%)`

## Typography Scale
- Hero number: 1.75rem / 800 / letter-spacing -0.03em
- Section titles: 1rem / 600
- Body: 0.88rem / 500
- Labels uppercase: 0.72rem / 700 / letter-spacing 0.08em
- Metadata: 0.72–0.8rem / normal / color ink-3

## Spacing Base
- Base unit: 8px
- Card padding: 16px
- Section gap: 20px
- Item rows: 14px vertical / 16px horizontal

## Border Radius
- Modals / large surfaces: 14–16px
- Chips / badges: 8–10px
- Pills: 20px

## Signature Patterns

### Hero Header (modales de detalle)
```html
<div class="hero"> <!-- gradient background -->
  <div class="hero-top">
    <span class="order-number">#{{ id }}</span>
    <span class="state-badge">{{ state }}</span>
  </div>
  <div class="hero-customer">{{ customer }}</div>
  <div class="hero-meta">{{ date }} · {{ branch }}</div>
</div>
<div class="body"> <!-- border-radius top, overlaps hero por -16px -->
```
Body se monta sobre el hero con `margin-top: -16px` y `border-radius: 16px 16px 0 0`.

### Item Row (lista de productos)
- Quantity chip izquierda (30×30px, brand-light bg)
- Nombre + SKU monospace center
- Subtotal + precio unitario derecha
- Sin bordes de card — contenidos en `.items-surface`

### Total Bar
- Full width, `background: var(--brand)`, `border-radius: 14px`
- Label: 0.82rem, white 75% opacity
- Amount: 1.4rem / 800 / white

### State Badge (sobre hero)
- `background: rgba(255,255,255,0.2)` base
- Semántico: warning → rgba(255,196,9,0.35) / success → rgba(45,211,111,0.35) / danger → rgba(235,68,90,0.35)

### Section Label
```scss
font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3);
```

### Toolbar en modales
- `--background: var(--brand)` — siempre azul primario
- Solo botones de navegación, sin título (el título va en el hero)

### Side Menu (app-menu)
- Fondo: `linear-gradient(170deg, #152c3e 0%, #0a1a27 100%)` — extremo oscuro del gradiente de la app
- Toolbar top: `#152c3e` — se mezcla con el gradiente del content visualmente
- Ancho: `272px`
- Brand dot: `8px`, `background: #3c8dbc`, glow con `box-shadow: 0 0 0 3px rgba(60,141,188,0.25)`
- Avatar: `42px`, `border-radius: 12px`, gradiente `#3c8dbc → #2d6d94`
- Nav items: `<a routerLink routerLinkActive="nav-item--active">` — full custom, sin ion-item
- Active pill: `background: rgba(255,255,255,0.1)`, icon wrap: `rgba(60,141,188,0.35)` / color `#6db8e0`
- Footer: `position: absolute; bottom: 0` — logout en rojo desaturado `rgba(235,100,115,0.75)`

## Token Names
```scss
--brand / --brand-dark / --brand-deeper / --brand-light
--surface / --surface-2 / --border
--ink-1 (text-primary) / --ink-2 (text-secondary) / --ink-3 (muted)
```
