# xigma — Roadmap 1.1.0

Kontynuacja [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) w tym samym duchu — małe, osobne porcje pracy,
checkboxy zaznaczane w miarę postępu — ale osobny plik, bo to praca poza samą historią "odtwarzania
Figmy krok po kroku" z 1.0.0 (ten plik zamyka się na konkretnej, już zaimplementowanej historii) i
poza dużym, wielosesyjnym etapem performance z [ROADMAP.2.0.0.md](./ROADMAP.2.0.0.md). 1.1.0 zbiera
kolejne malutkie funkcje UI/narzędziowe w tym samym stylu co 1.0.0.

## Etap 1 — Color Sampler (eyedropper) w ColorPicker

Przeniesiony z x-design (`shared/UITools/ColorPicker/ColorSampler/`) — okrągła "lupka" śledząca
kursor z podglądem siatki 7×7 pikseli, klik wybiera kolor pod środkowym pikselem. Przycisk-trigger
(`Sampler`, ikona `Sample`) już istniał w `ColorPicker/Body/SolidPanel/` jako niepodłączony placeholder
— przeniesiony na poziom `ColorPicker/Sampler/` (obok `Header`/`Body`/`Footer`), bo stan aktywności
samplera jest własnością `ColorPicker.tsx`, nie samego `SolidPanel`; wizualnie nadal renderuje się w
tym samym miejscu (`SolidPanel` importuje go z nowej lokalizacji, dostaje tylko `onOpenSampler` jako
prop przekazywany przez `Body`). Sam trigger renderuje się przez `ButtonMenu` (render-prop `trigger`,
`useOpenSampler` mapuje jego `onOpenChange` na `onClick` tylko przy otwarciu) — ikona koloruje się na
niebiesko, gdy trigger jest otwarty.

- [x] **Architektura próbkowania pikseli — realny odczyt z WebGL, nie `html2canvas`.** x-design
      próbkuje przez `html2canvas(document.body)`, bo tam kształty renderują się jako DOM. xigma-app
      rysuje całą scenę na jednym `<canvas>` WebGL2 (`WEBGL_CONTEXT_ATTRIBUTES` bez
      `preserveDrawingBuffer`) — `html2canvas` nie odczyta z niego wiarygodnie pikseli, więc zamiast
      kopiować podejście 1:1 (decyzja świadomie skonsultowana z userem), sampler czyta bezpośrednio
      `gl.readPixels` z realnie wyrenderowanej klatki. Bez `preserveDrawingBuffer` bufor rysowania jest
      gwarantowany tylko w tym samym tasku, w którym został narysowany — więc odczyt **musi** się
      dziać wewnątrz render loopu, tuż po `drawScene`, nie z osobnego handlera `mousemove`.
- [x] **Generyczny rejestr, zero zależności Design→UI w żadną stronę** —
      `utils/canvas/colorPixelSampler/colorPixelSamplerRegistry.ts`: moduł-singleton
      (`registerColorPixelSampler`/`sampleColorPixels`) będący "wtyczką" — kto ma żywy canvas,
      rejestruje się w nim; kto potrzebuje koloru spod kursora (ColorPicker, gdziekolwiek jest
      renderowany), pyta przez rejestr, bez importowania czegokolwiek z `components/Design/...` (i
      odwrotnie). Brak zarejestrowanego samplera (ColorPicker użyty poza Design, albo zanim canvas się
      zamontuje) rozwiązuje pusty `[]`, nie odrzuca promise'a.
- [x] **`resolveColorSampleRequest`** (`useCanvasRenderLoop/utils/`) — wołane raz na klatkę, zaraz po
      `drawScene`, w `startRenderLoop.ts`'s `tick`. Liczy pozycję w buforze z `getBoundingClientRect` + `canvas.width/height`, odwraca Y (początek `readPixels` to dół bufora, żądany punkt liczony
      jest od górnego-lewego rogu ekranu), czyta blok `COLOR_SAMPLE_GRID_SIZE × COLOR_SAMPLE_GRID_SIZE`
      (7×7, jak w x-design) i odwraca kolejność wierszy z powrotem na górę-dół, żeby indeks 24 (środek)
      odpowiadał dokładnie temu, co widać pod kursorem.
- [x] **`useRegisterColorPixelSampler`** (`Design/Canvas/hooks/`) — montowany razem z
      `useCanvasRenderLoop` w `Canvas.tsx`; na mount rejestruje w rejestrze funkcję, która zamienia
      `sampleColorPixels(x, y)` na wpis w nowym refie `colorSampleRequestRef` (dodany do `TCanvasRefs`
      i do obu miejsc, gdzie ten typ jest ręcznie budowany: `createCanvasRefs.ts` i
      `CanvasRefsProvider.tsx`) — `resolveColorSampleRequest` odbiera go w kolejnej klatce.
- [x] **UI — port `ColorGrid`/`ColorGridMask`/`ColorResult`/`ColorPrompt`** do
      `ColorPicker/ColorSampler/`, z dopasowaniem do konwencji xigma (BEM `.module.scss`, `cx`,
      `E2EDataAttribute` z x-design pominięty — w xigma-app ten mechanizm służy tylko do oznaczania
      pól omijających global shortcuts, e2e tu chodzi przez realną interakcję Playwrighta, nie
      `data-testid`). `ColorGridMask` to niewidzialny kwadrat 150×150 wyśrodkowany na kursorze,
      `pointer-events: all` — reszta strony (`document.body.style.pointerEvents = 'none'`, ustawiane
      przez `useHandleInitial` na czas samplowania) przepuszcza klik dalej, więc lupka "łapie" klik
      gdziekolwiek na stronie. Kursor: `sampler.png` (hotspot 8,24), tym samym wzorcem
      `-webkit-image-set(...) 8x` co reszta cursorów w projekcie (przy okazji naprawiony analogiczny,
      już wcześniej złamany odnośnik w `shared/UITools/Color/color.module.scss`, który wciąż wskazywał
      na usunięty `sampler.svg`).
- [x] **`useMouseMoveEvent`** — throttle 20ms na `mousemove`, próbkuje na każdy ruch, bez debounce'u
      ani `isPending`/loadera z x-design — tam był potrzebny, bo `html2canvas` realnie trwał; tu
      `gl.readPixels` jest efektywnie natychmiastowy, więc user kazał go usunąć (`ColorGrid` już nie
      ma stanu `isPending`). Bez `initialMousePosition` z x-design (nie ma jak przekazać pozycji
      kliknięcia przez generyczny `Button`, który nie forwarduje eventu) — pozycja startuje jako
      `null`, siatka po prostu nie renderuje się dopóki pierwszy realny `mousemove` nie przyjdzie.
- [x] **Chowanie samplera, gdy kursor nie jest realnie nad canvasem — sprawdzane po referencji
      DOM-owej, nie po geometrii.** Zgłoszone wprost po tym, jak pierwsza wersja (bounding-rect
      canvasu) nie działała: canvas rozciąga się na cały viewport, więc containment-check był zawsze
      prawdziwy, nawet pod panelami/popoverem samego ColorPickera. Poprawka w
      `useRegisterColorPixelSampler.ts`: `isPointOverCanvas` woła
      `document.elementFromPoint(x, y) === canvas` (równość referencji, nie geometria) — trafia
      dokładnie ten DOM node, który realnie jest na wierzchu w danym punkcie. Dwie przeszkody po
      drodze: (1) `document.body.style.pointerEvents = 'none'` (ustawiane na czas samplowania) jest
      **dziedziczone**, więc bez obejścia sam canvas też staje się nie-hit-testowalny; (2)
      `ColorGridMask` ma `pointer-events: all` i zawsze siedzi dokładnie pod kursorem, więc zawsze
      zasłaniałby wynik. Rozwiązane generycznym kontraktem atrybutu (`COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE`
      = `data-color-sample-passthrough`, w `utils/canvas/colorPixelSampler/constants.ts` — wspólnym,
      neutralnym miejscu, więc Design nie importuje niczego z ColorPickera): każdy element z tym
      atrybutem (dziś tylko `ColorGridMask`) i `document.body` dostają na czas jednego, synchronicznego
      odczytu `pointer-events` przywrócone, po czym wszystko wraca do poprzedniego stanu. `colors` w
      `useColorSamplerEvents` staje się `TRgba[] | null` (zamiast zawsze-tablicy) — `null` oznacza
      "nie pokazuj nic", `ColorSampler.tsx` w ogóle nie renderuje się (`mousePosition && colors`), więc
      hover nad panelem/popoverem realnie usuwa całą lupkę z DOM-u, nie tylko blokuje próbkowanie.
- [x] **Zamykanie na Escape** — `useCloseSamplerOnEscape`, listener w fazie capture (żeby wyprzedzić
      własną obsługę Escape w Radix Popoverze i zamknąć tylko sampler, nie cały color picker).
      Zamyka się też automatycznie po kliknięciu (`useColorSampler.pick` ustawia `isActive` na `false`
      po `setHex`).
- [x] **`useColorSampler`** (`ColorPicker/hooks/`) — mały stan lokalny (`isActive`/`open`/`close`/
      `pick`) w tym samym stylu co sąsiedni `useColorModel`; celowo **nie** w Redux (jak w x-design,
      gdzie `colorSampler` żyje w globalnym slice `events`) — `ColorPicker` w xigma-app jest już
      świadomie odcięty od Design/Redux (bierze tylko `value`/`onChange`), więc stan samplera zostaje
      lokalny, żeby nie łamać tej granicy.
- [x] i18n: `colorPicker.sampler.prompt.description` ("Click to sample" / "Kliknij, aby pobrać", klucz
      1:1 z x-design) i `colorPicker.sampler.tooltip` ("Sample color" / "Próbkuj kolor", tooltip
      triggera).
- [ ] **e2e odłożone** — nie ma dziś żadnego realnego wejścia do ColorPickera w aplikacji (tymczasowy
      trigger w `LeftPanel` został usunięty po zbudowaniu tego etapu); e2e dla chowania samplera nad
      panelami doczeka realnego panelu fill/stroke, który faktycznie wyrenderuje ColorPicker. Do tego
      czasu jedynym zabezpieczeniem jest pokrycie jednostkowe (100%, w tym scenariusz
      `useRegisterColorPixelSampler`'a z elementem markowanym jako modal/panel na wierzchu canvasu).
- [ ] **Limitacje v1** — próbkowanie działa tylko nad samym `<canvas>` (jedynym zamontowanym w
      aplikacji); DOM poza nim (panele, toolbar, popover ColorPickera) poprawnie **chowa** sampler
      zamiast pokazywać nieprawidłowy kolor, ale wciąż nie ma jak odczytać koloru czegokolwiek poza
      WebGL-em. Realny eyedropper poza oknem przeglądarki (jak natywne `window.EyeDropper`) świadomie
      poza scope — user wybrał podejście canvas-only zamiast natywnego API (brak wsparcia
      Firefox/Safari, utrata własnego UI z siatką podglądu).

## Related

[[canvas-rendering-pipeline]] — kontekst renderloopu i kontraktu `WEBGL_CONTEXT_ATTRIBUTES`, do
którego dopięty jest `resolveColorSampleRequest`.
