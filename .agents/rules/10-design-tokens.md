# Design rules (always on)

## Colour: single point of change
- All colours are CSS variables in `app/globals.css` (`:root` = light, `[data-theme="dark"]` = dark), exposed to Tailwind through `@theme inline`.
- Components use ONLY semantic classes: `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, status colours.
- FORBIDDEN outside `globals.css`: hex/rgb/hsl literals, Tailwind default palette classes (`bg-blue-500`, `text-slate-400`...), inline colour styles. `npm run check:tokens` enforces this.
- SVG brand elements use `currentColor` or `fill-primary`.

## Brand
- Primary electric blue `#0066FF`, navy `#0B0F17`, white, slate 100/200/400/600. Solid colours ONLY: no gradients, no glows, no blurred shadows. Depth = hard offset blocks and layering.
- Fonts: Montserrat (display 900, headings 800/700, body 500) and JetBrains Mono (labels, metadata, code). Labels: uppercase, 0.3em tracking. Loaded via `next/font`.
- Blue text on navy only at 24px+ (contrast); small text on navy is white or slate-200.

## Hexagon geometry
- Pointy-top ONLY. Angles 0/30/60/90/120 only. Clip-path: `polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)`. Width = 0.866 x height.
- Rectangular artwork is never cropped to a hex: use the chamfered-corner frame component.
- Radius base is 0 (angles, not curves), except pills/hex-capped buttons.

## Motion
- Enter along a 60-degree cut, flip like a hex tile, or scale from a vertex. No generic fade-up.
- Timing: micro 150-200ms, component 300-450ms, page 700-900ms. Easing `cubic-bezier(0.76,0,0.24,1)`.
- Heavy animation is lazy-loaded and paused off-screen. Reduced motion = instant or simple fades.
