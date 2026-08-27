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

## Etap 2 — Enter: edycja tekstu / konwersja kształtu na wektor

Enter na Text/Text-on-path wchodzi w edycję karetki (jak dwuklik). Enter na
Rectangle/Ellipse/Line/Arrow/Polygon/Star zamienia kształt na `NodeType.vector` (nowy `replaceNode`
reducer, `utils/canvas/vectorNetwork/convertShapeToVector/`, geometria jako realne krzywe Béziera)
i od razu otwiera Vector Edit Mode, jednym krokiem undo. Grot strzałki — świadomie utracony, brak
odpowiednika na wektorze. e2e: `enter-shape-to-vector.spec.ts` + `edit-text.spec.ts`.

## Etap 3 — Paint: własny kolor i pędzel na przeciąganie

Paint dostał realny wybór koloru (ColorPicker w toolbarze zamiast losowego hue z hasha loop-key) i
`fillColorOverrideByKey` przenoszone dalej przy Erase/Cut/Shape Builder, żeby operacja zmieniająca
geometrię nie kasowała wybranego koloru. Doszedł też tryb przeciągania — maluje (albo w trybie remove,
usuwa) każdy nowy face pod pędzlem w jednym strokeu, zamiast tylko jednego face'a na klik; drag
zaczęty na już wypełnionym face'u zawsze kończy się z tym face'em nadal wypełnionym (nie toggluje jak
pojedynczy klik). Pełny opis: `.claude/docs/vector-network.md` §67-69.

- [x] ColorPicker wpięty w przycisk narzędzia, kolor trzymany w `paintColor` (Redux)
- [x] kolor przeżywa Erase/Cut/Shape Builder zamiast wracać do losowego hue
- [x] drag maluje/usuwa wiele faces w jednym strokeu, always-paint-never-remove na starcie drag

## Related

[[canvas-rendering-pipeline]] — kontekst renderloopu i kontraktu `WEBGL_CONTEXT_ATTRIBUTES`, do
którego dopięty jest `resolveColorSampleRequest`.
