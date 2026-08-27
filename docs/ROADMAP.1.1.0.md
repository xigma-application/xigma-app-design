# xigma — Roadmap 1.1.0

Kontynuacja [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) w tym samym duchu — małe, osobne porcje pracy,
checkboxy zaznaczane w miarę postępu — ale osobny plik, bo to praca poza samą historią "odtwarzania
Figmy krok po kroku" z 1.0.0 (ten plik zamyka się na konkretnej, już zaimplementowanej historii) i
poza dużym, wielosesyjnym etapem performance z [ROADMAP.2.0.0.md](./ROADMAP.2.0.0.md). 1.1.0 zbiera
kolejne malutkie funkcje UI/narzędziowe w tym samym stylu co 1.0.0.

## Etap 1 — Color Sampler (eyedropper) w ColorPicker

Przeniesiony z x-design — "lupka" śledząca kursor z podglądem siatki 7×7 px, klik wybiera kolor pod
środkowym pikselem. Kolor czytany realnie z WebGL (`gl.readPixels` w render loopie, nie
`html2canvas` jak w x-design), przez generyczny rejestr (`colorPixelSamplerRegistry.ts`) bez
zależności Design↔ColorPicker w żadną stronę. Sampler chowa się poprawnie nad panelami/popoverem
(hit-test po `document.elementFromPoint`, nie po geometrii canvasu). Zamyka się na Escape i po
kliknięciu.

- [ ] **e2e odłożone** — brak dziś realnego wejścia do ColorPickera w aplikacji; pokryte na razie
      tylko jednostkowo (100%).
- [ ] **Limitacje v1** — próbkuje tylko z `<canvas>`, nic poza WebGL-em; natywny `window.EyeDropper`
      świadomie poza scope.

## Etap 2 — Enter: edycja tekstu / konwersja kształtu na wektor

Enter na Text/Text-on-path wchodzi w edycję karetki (jak dwuklik). Enter na
Rectangle/Ellipse/Line/Arrow/Polygon/Star zamienia kształt na `NodeType.vector` (nowy `replaceNode`
reducer, `utils/canvas/vectorNetwork/convertShapeToVector/`, geometria jako realne krzywe Béziera)
i od razu otwiera Vector Edit Mode, jednym krokiem undo. Grot strzałki — świadomie utracony, brak
odpowiednika na wektorze. e2e: `enter-shape-to-vector.spec.ts` + `edit-text.spec.ts`.

## Related

[[canvas-rendering-pipeline]] — kontekst renderloopu i kontraktu `WEBGL_CONTEXT_ATTRIBUTES`, do
którego dopięty jest `resolveColorSampleRequest`.
