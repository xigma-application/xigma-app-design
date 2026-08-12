---
name: xigma-scss-bem
description: BEM nesting convention for xigma's .module.scss files — sub-elements of a component go under `&__element` (kebab-case) inside the root class instead of separate flat top-level classes. Load before adding a second class to any .module.scss file, or reviewing one that already has more than one top-level selector.
---

# xigma SCSS BEM Convention

Project-wide rule (applies to every `.module.scss`, not just one feature): once a component's
stylesheet needs more than its own root class, nest the extra classes under the root using BEM
`&__element` syntax instead of writing them as separate flat top-level classes.

Mirrors x-design's own SCSS exactly, including casing — `ZoomBox`'s `&__background-mask`,
`&__texture-blank`; `MouseModes`' `&__button`.

## Avoid — flat top-level classes

```scss
.Canvas {
  position: absolute;
}

.texture {
  position: absolute;
}

.canvasElement {
  cursor: pointer;
}
```

## Prefer — BEM nesting under the root class, kebab-case element names

```scss
.Canvas {
  position: absolute;

  &__texture {
    position: absolute;
  }

  &__canvas-element {
    cursor: pointer;
  }
}
```

Modifiers follow the same pattern with `&--modifier` (not used yet anywhere in xigma, but this is
the convention to reach for once one is needed — matches x-design's `&--active`/`&--color-sampler`).

## JS access: bracket notation for multi-word elements

xigma's CSS Modules have **no** `camelCaseOnly` `localsConvention` configured, so the exported JS
key is the class name verbatim. A single-word element (`&__texture`, `&__button`) is still reachable
with clean dot access (`styles.Canvas__texture`), but a kebab-case multi-word element needs bracket
notation, since `Canvas__canvas-element` isn't a valid identifier:

```tsx
<div className={styles.Canvas}>
  <div className={styles.Canvas__texture} />
  <canvas className={styles['Canvas__canvas-element']} ref={canvasRef} />
</div>
```

Don't reach for a `localsConvention` transform or a differently-cased element name to dodge the
bracket access — the kebab-case class name is the convention here, matching x-design; the bracket
syntax on the JS side is the accepted cost of that, not a problem to work around.

## Related

[[xigma-component-structure]] — the root class still matches the component name exactly; BEM
nesting only governs classes *below* that root.
[[xigma-import-order]] / [[xigma-module-structure]] — unrelated axes (import grouping, file
placement) that apply independently of this rule.
