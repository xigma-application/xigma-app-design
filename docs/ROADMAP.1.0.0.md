# xigma — Roadmap

Cel: odtworzyć aplikację Figma 1:1, krok po kroku. Silnik rysowania: **Canvas** (nie DOM/SVG).
Wyjątek: podczas edycji tekstu montowany jest mały DOM overlay (`TextEditOverlay`) — reszta
(kształty, selekcja, handle'y, guide'y) rysowana jest na canvasie, tak jak w oryginale.

**Rendering: WebGL od samego fundamentu**, nie Canvas 2D — zdecydowane świadomie wcześnie, żeby
uniknąć drugiej migracji renderera później, gdy scena urośnie. C++/WASM (jak w prawdziwej Figmie)
to osobny, odległy temat, poza scope na razie — dopiero jeśli realny profiling pokaże, że wąskim
gardłem jest matematyka JS (hit-testing, tesselacja), nie samo rysowanie na GPU.

Zaznaczamy checkboxy w miarę postępu. Każdy etap = osobna, malutka porcja pracy.

## Etap 0 — Fundament projektu

- [x] `components/Design/Canvas` — jeden `<canvas>` na cały viewport, resize (`devicePixelRatio` +
      debounce), render loop (`requestAnimationFrame`, WebGL2), teksturowane tło pod canvasem

## Etap 1 — Dolny toolbar

- [x] `components/Design/Toolbar` — floating layout, `activeTool` w Redux, ikony wg
      [[xigma-icons]]
- [x] Select/Move, Frame, Comment + dropdown-warianty (Radix `DropdownMenu`)
- [x] **Hand tool** (`H`) — wariant w dropdownzie Select, reużywa matematykę środkowoprzyciskowego
      pan
- [x] dropdown wariantów pod Rectangle (Line/Ellipse/Polygon/Star — szczegóły w Etapie 6)

## Etap 2 — Model danych sceny

- [x] `TSceneNode` jako discriminated union (`types/design/types.ts`), na start tylko `TFrameNode`
- [x] store sceny (`store/design`): `nodes: Record<string, TSceneNode>` + `rootOrder: string[]`,
      reducery `addNode`/`updateNode`
- [x] `TViewport { x, y, zoom }` w Reduxie — realne pan/zoom w Etapie 4

## Etap 3 — Narzędzie Frame

- [x] click-drag tworzy frame, `addNode` na puszczeniu (z minimalnym rozmiarem), narzędzie wraca
      do Select
- [x] pierwszy realny WebGL rendering (`drawRect`, prosty shader) — nazwa nad frame'em odłożona do
      Etapu 6/7 (rendering tekstu)

## Etap 4 — Pan & zoom

- [x] scroll = pan, Ctrl/Cmd+scroll (lub pinch) = zoom wokół kursora, zoom w `[ZOOM_MIN, ZOOM_MAX]`
- [x] transformacja viewportu liczona na GPU (uniformy w shaderze), nie w JS — świadomie, ten sam
      typ decyzji co WebGL zamiast Canvas 2D

## Etap 5 — Selekcja

- [x] hit-testing (AABB, topmost wygrywa) + rysowanie selection outline/resize handles
- [x] przeciąganie zaznaczonego node'a (lub kilku) — resize uchwytami odłożony do Etapu 10
- [x] wspólny outline + wspólny bbox dla zaznaczenia 2+ (grupy/nested frames wracają w Etapie 12)
- [x] zaznaczanie przez marquee (przeciągnięcie ramki), z trybem "dotyka" vs Ctrl/Cmd "pełne
      zawieranie", live-update podczas przeciągania
- [x] hover highlight (outline bez uchwytów, pogrubiony przez trik trójkątów, bo `gl.lineWidth()`
      zablokowany na 1px w tym środowisku)
- [x] pełna semantyka klik/shift-klik/klik-w-grupie/klik-w-lukę, zgodna z Figmą/x-design (opis w
      `.claude/docs/selection-and-manipulation.md`)

## Etap 6 — Kolejne narzędzia rysujące

- [x] **Rectangle**, **Ellipse** — wspólny `useDrawShapeTool.ts`, stały fill per typ (realny
      color picker to Etap 8)
- [x] **Line** — własna geometria (`x1/y1/x2/y2`), edytowalne końce po utworzeniu
- [x] **Polygon** (`sides`), **Star** (`points`, `ratio`) — hover-outline realnie śledzi kształt
- [x] **Media** (obraz + wideo) — osobny program tekstur, cache, wybór pliku/kolejka, wideo
      konwertowane do 1 klatki przed umieszczeniem
- [x] **Text** — tworzenie połączone z edycją treści (pełny opis w Etapie 7)
- [x] **Text on Path** — tekst wzdłuż krzywej (elipsy), layout z tabeli długości łuku, uchwyt
      przesuwania startu, flip/mirror respektowane w geometrii glifów
- [x] **Slice** — zaznaczanie obszaru pod przyszły eksport; świadomie nigdy nie trafia do
      `store/design` (czysty `useRef`), własny resize/rotate/move
- [x] **Arrow** — `TLineNode` z opcjonalnym `startPoint`/`endPoint: 'arrow'`, reużywa Line 1:1;
      grot czysto wizualny (hit-test/bbox bez zmian)
- [x] **Pen / Vector Network** (`NodeType.vector`) — prawdziwy graf wierzchołków/segmentów z
      kubicznymi tangentami na segmencie, wieloklikowe/wielosesyjne narzędzie, fill liczony
      stencil-bufferem. Zbudowano przy okazji Etap 11 (undo/redo) jako fundament. Pełny opis:
      `.claude/docs/vector-network.md`
- [x] **Pencil** — jedno przeciągnięcie = jeden `TVectorNode`, progresywne uproszczenie ścieżki +
      Catmull-Rom, zaokrąglone końce, Shift trzyma oś. Pełny opis: `.claude/docs/pencil-tool.md`
- [x] klik bez przeciągnięcia stawia element domyślnego rozmiaru 100×100 (wyśrodkowany dla figur,
      lewy-górny róg w punkcie kliknięcia dla tekstu), próg "za mały ruch" liczony w screen space

## Etap 7 — Edycja tekstu (DOM overlay) + rendering tekstu w WebGL

- [x] `useDrawTextTool.ts` — node trafia do Reduxu dopiero po zakończeniu edycji, i tylko z
      niepustą treścią
- [x] `TextEditOverlay` — prawdziwy `contentEditable` div, pozycjonowany przez `worldToScreen`
- [x] **rendering tekstu — MSDF atlas** (nie bitmapa) — ostre krawędzie na dowolnym zoomie,
      generowany offline (`msdf-bmfont-xml`, `npm run generate:font-atlas`) z Interu, layout z
      metryk atlasu (nie `canvas.measureText`), geometria batchowana i cache'owana bez zależności
      od zoomu/DPI. Dostrojenie wagi atlasu, mipmapy i gamma-correction dla drobnego tekstu — pod
      spodem, patrz `.claude/docs/canvas-rendering-pipeline.md`

## Etap 8 — Panele boczne

- [ ] panel warstw (drzewo node'ów, reorder, visible/locked)
- [ ] panel właściwości (X/Y/W/H, Fill, Stroke, Opacity/blend mode)
- [ ] właściwości tekstu (rozmiar/waga/wyrównanie/line-height/letter-spacing)
- [ ] Start/End point dropdowny dla Line/Arrow

## Etap 9 — Wiele fontów, atlas per font z serwera

Świadomie odłożone do czasu realnego wyboru fontu (część Etapu 8) — dziś jeden font wpieczony w
bundle.

- [x] atlasy fontów na CDN, ładowane dynamicznie (`fetch`) zamiast statycznego importu
- [x] cache per `fontFamily`, manifest dostępnych fontów
- [x] generator atlasów przenosi się do osobnego repo (ściąga TTF na żądanie zamiast trzymać
      binarki w gicie)

## Etap 10 — Dokończenie manipulacji node'ami

- [x] **resize uchwytami** — 8 kierunków, pojedynczy node i grupa, Shift = aspect-lock na rogach,
      obrócony resize liczony przez rzut wektora skali na lokalne osie node'a (rotowany kursor,
      bez shear'u)
- [x] **mirror/flip przy przejściu przez zero** — przeciągnięcie "przez" anchor mirror'uje bbox
      zamiast utykać na minimalnym rozmiarze; Media/Text/Polygon/Star dostały realny
      `flipX`/`flipY` (UV flip dla Media, geometryczny mirror glifów/wierzchołków dla reszty)
- [x] **rotacja** — CPU-side post-processing punktów (`rotatePoint`), działa dla pojedynczego
      node'a i grupy (orbita wokół wspólnego środka), obracające się uchwyty i kursor
- [x] **dwuklik wchodzi w edycję istniejącego tekstu** — cała treść zaznaczona, edycja obróconego/
      zmirrorowanego tekstu renderuje się poprawnie (kursor/zaznaczenie rysowane na canvasie, nie
      natywnym DOM-em, żeby nie rozjeżdżały się z glifami MSDF)
- [x] **corner radius** dla Rectangle (4 niezależne rogi), Polygon i Star (jeden wspólny promień,
      też wierzchołki wklęsłe). Pełny opis: `.claude/docs/selection-and-manipulation.md` §11-16
- [x] **wycinanie fragmentu elipsy** — Sweep/Start/Ratio, 1:1 z narzędziem Arc w Figmie (pierścień,
      inwersja wypełnienia). Pełny opis: tamże §19
- [x] **uchwyt Ratio dla Star** (trzeci uchwyt, promień wewnętrzny/zewnętrzny). Tamże §20
- [x] **Delete/Backspace** — usuwa zaznaczenie (albo pojedynczy wierzchołek w Vector Edit Mode)
- [x] **pozostałe skróty edycji** — Duplicate, Copy/Paste (też na poziomie wierzchołków/segmentów w
      Vector Edit Mode), Select All, nudge strzałkami — każda wieloelementowa operacja to jeden
      krok Ctrl+Z. Pełny opis: `.claude/docs/design-tool-architecture.md` §6,
      `.claude/docs/vector-network.md` §65
- [ ] zoom ze skrótów klawiszowych (Cmd +/−, Shift+0/1/2)

## Etap 11 — Undo / redo

- [x] zbudowane jako fundament pod Pen Tool (Etap 6) — snapshoty (`nodes`/`rootOrder`/
      `selectedIds`), nie command-stack; własny `historyMiddleware`, nie `redux-undo`. Cmd/Ctrl+Z,
      Cmd/Ctrl+Shift+Z
- [x] `beginHistoryGesture`/`endHistoryGesture` spinają gest tak, że N mutacji w jednym
      przeciągnięciu (move/resize/rotate/uchwyty) to jeden krok historii. Pełny opis:
      `.claude/docs/design-store-architecture.md` §8

## Etap 12 — Grupy i zagnieżdżone frame'y

Największa pojedyncza strukturalna luka względem Figmy.

- [ ] grupowanie/rozgrupowanie (Cmd/Ctrl+G / Shift+G)
- [ ] realne zagnieżdżanie w `TFrameNode` (`parentId` przez przeciągnięcie, nie tylko wizualne
      nachodzenie)
- [ ] hit-testing/selekcja z hierarchią (najgłębiej zagnieżdżony trafiony node, dwuklik "wchodzi"
      głębiej)
- [ ] przesuwanie/resize rodzica przesuwa/skaluje dzieci

## Etap 13 — Prowadnice i przyciąganie (smart guides)

- [ ] linijki (rulery) skalujące się z zoomem
- [x] **snap do siatki pikseli** — `x/y/width/height`/`rotation` zaokrąglane na dispatch (tworzenie,
      przeciąganie, resize, rotacja), nie w obliczeniach pośrednich
- [ ] smart guides (przyciąganie do krawędzi/środków innych node'ów, z wyświetlaną odległością)
- [ ] snap do viewportu/frame'a rodzica
- [x] **pixel grid** na canvasie, widoczny od zoomu 400% — proceduralny fragment shader
      (`fract`/`fwidth`), nie geometria per linia. Pełny opis:
      `.claude/docs/canvas-rendering-pipeline.md` §3, §10

## Etap 14 — Persystencja sceny

Dziś cały `store/design` żyje tylko w pamięci.

- [ ] zapis/odczyt `nodes`/`rootOrder`/`viewport` do `localStorage` (autosave, debounced)
- [ ] docelowo zapis po stronie serwera — poza scope na razie

## Etap 15 — Detale UX toolbara i canvasu

- [x] **Comment tool** — klik otwiera `CommentDraftInput`, Ctrl/Cmd+Enter zapisuje `CommentPin`;
      piny to DOM overlay (`worldToScreen`), stały rozmiar niezależnie od zoomu. Edycja/usuwanie
      istniejącego komentarza celowo jeszcze wyłączone
- [x] **`VectorEditToolbar`** — floating panel (Move/Lasso/Paint/Bend/Cut) widoczny tylko w Vector
      Edit Mode
- [x] **Lasso tool** (`Q`) — zaznaczanie wierzchołków dowolnym konturem w Vector Edit Mode
- [x] **Paint tool** (`Shift+B`) — wypełnianie pojedynczych faces sieci wektorowej
      (`filledFaceKeys`), zamiast całego kształtu naraz. Pełny opis:
      `.claude/docs/vector-network.md` §43
- [x] **wykrywanie regionów przepisane na prawdziwy half-edge (DCEL)** + pełna planaryzacja
      przecięć segmentów — Figma-parity dla samoprzecinających się kształtów. Tamże §44
- [x] **przeciąganie wierzchołka na wierzchołek scala je** — w obrębie jednego kształtu i między
      różnymi wektorami. Tamże §46
- [x] **Bend** jako trwałe narzędzie w toolbarze (nie tylko modyfikator Ctrl). Tamże §47
- [x] **edycja kilku wektorów naraz** (`vectorEditingNodeIds: string[]`, wejście przez Enter) —
      hit-testing/hover/marquee/lasso/Paint działają na całym otwartym zbiorze. Tamże §48, e2e:
      `multi-vector-edit.spec.ts`
- [x] **klik w wypełniony face zaznacza od razu wszystkie jego wierzchołki** (Move tool). Tamże §56
- [x] **Shape Builder** (`M`) — łączenie/odejmowanie faces przez realne kasowanie granicznych
      segmentów (Alt = odejmij), też między różnymi node'ami wektorowymi. Tamże §59-62, e2e:
      `vector-shape-builder.spec.ts`
- [x] **Variable Width** (`Shift+W`) — zmienna grubość konturu, punkty regulacji jako ułamek
      długości łuku łańcucha; działa tylko na pojedynczym, nierozgałęzionym wektorze. Tamże §63,
      e2e: `vector-variable-width.spec.ts`
- [x] **Erase tool** (`Shift+E`) — okrągły pędzel, boolean-subtract kapsuły od sieci wektorowej
      (fill przeżywa muśnięcie granicy, realne wcięcie zamiast zniknięcia); Shift = axis-lock,
      `[`/`]` = rozmiar pędzla. Ograniczenia v1: rotowany węzeł spłaszczany, brak prawdziwej dziury
      po wymazaniu czystego wnętrza fillu. Tamże §66, e2e: `vector-erase.spec.ts`,
      `vector-erase-multi.spec.ts`
- [ ] menu kontekstowe (prawy klik) na node'ach i pustym canvasie
- [ ] kontrolka zoomu w rogu canvasu (Zoom to fit/selection/100%)
- [ ] z-order z UI (Bring to front/Send to back/Forward/Backward)
- [ ] prawa grupa toolbara (draw/scale/actions/dev mode)
- [ ] preset rozmiarów we Frame tool

---

Etapy dalej w przyszłości (komponenty/instancje, auto-layout, efekty typu blur/shadow, multiplayer,
itd.) — dopiszemy jak dojdziemy do tego miejsca.
