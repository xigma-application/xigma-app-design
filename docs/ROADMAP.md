# xigma — Roadmap

Cel: odtworzyć aplikację Figma 1:1, krok po kroku. Silnik rysowania: **Canvas**
(nie DOM/SVG). Wyjątek: pod czas edycji tekstu montowany jest mały DOM overlay
(`TextEditOverlay`) — cała reszta (kształty, selekcja, handle'y, guide'y)
rysowana jest na canvasie, tak jak w oryginale.

**Rendering: WebGL od samego fundamentu**, nie Canvas 2D — zdecydowane świadomie
wcześnie, bo docelowo będzie dużo obiektów na scenie i lepiej nie migrować
później. C++/WASM (tak jak w prawdziwej Figmie) to osobny, odległy temat — nie
robimy go teraz, dopiero jeśli kiedyś faktycznie będzie potrzebny (patrz sekcja
„Rendering" niżej po co WebGL i dlaczego nie WASM na starcie).

Zaznaczamy checkboxy w miarę postępu. Każdy etap = osobna, malutka porcja pracy.

## Rendering: WebGL, nie Canvas 2D

- Canvas 2D był tylko punktem startowym (Etap 0) — świadomie przeszliśmy na
  WebGL zanim zaczęliśmy rysować realne obiekty, żeby uniknąć drugiej migracji
  renderera później, gdy scena urośnie
- WASM zostaje **poza scope na razie** — dopiero jeśli/gdy realny profiling
  pokaże, że wąskim gardłem jest matematyka po stronie JS (hit-testing,
  tesselacja), a nie samo rysowanie na GPU. WebGL sam w sobie ułatwia tę
  ewentualną migrację później (te same wywołania GL da się wołać z C++ przez
  Emscripten), ale to nie jest cel na dziś

## Etap 0 — Fundament projektu

- [x] `components/Design/Canvas` — komponent React montujący jeden `<canvas>` na
      cały viewport (docelowo miało być `core/Canvas`, ale zgodnie z ustaleniami
      wszystkie komponenty widoku trzymamy w `components/Design/...`)
- [x] resize handling (dopasowanie canvasu do okna + `devicePixelRatio`) —
      `Canvas/hooks/useCanvasResize.ts`: `ResizeObserver` na elemencie canvasu +
      `canvas.width/height` liczone z `devicePixelRatio`, `gl.viewport(...)` po
      każdym resize żeby framebuffer WebGL nadążał za nowym rozmiarem.
      Przeliczanie jest debounce'owane (`lodash/debounce`, `RESIZE_DEBOUNCE_MS`
      z `Canvas/constants.ts`) — bez tego `canvas.width/height` resetowało cały
      bitmap/kontekst WebGL na każdy pojedynczy event z `ResizeObserver`
      (a tych lecą dziesiątki podczas przeciągania okna), stąd migotanie
- [x] render loop (`requestAnimationFrame`) rysujący na razie puste tło —
      `Canvas/hooks/useCanvasRenderLoop.ts`: kontekst `webgl2`
      (`WEBGL_CONTEXT_ID`/`WEBGL_CONTEXT_ATTRIBUTES` z `Canvas/constants.ts`,
      `premultipliedAlpha: false` żeby alpha liczyła się w sposób intuicyjny),
      co klatkę `gl.clearColor` + `gl.clear` (`BACKGROUND_COLOR` konwertowany
      przez `Canvas/utils/hexToRgbFloat.ts`, `BACKGROUND_ALPHA`). Pod canvasem
      (przezroczyste tło) leży osobny `div.texture` z teksturką z x-design
      (`texture--dark.svg`/`texture--light.svg`, dobierana wg motywu) — dzięki
      temu jak `BACKGROUND_ALPHA` spadnie poniżej 1, teksturka będzie
      prześwitywać spod wypełnienia, tak jak w oryginale

## Etap 1 — Dolny toolbar

Referencja: zrzut z toolbarem Figmy (select / frame / rectangle / pen / text /
comment / shapes, potem osobno: draw / scale / actions / dev mode).

- [x] `components/Design/Toolbar` — statyczny layout, floating na dole canvasu
      (nie `shared/UI/Toolbar` — trzymamy wszystkie komponenty widoku pod
      `components/Design/...`)
- [x] stan aktywnego narzędzia (`activeTool`) — Redux (`store/design`), nie
      lokalny stan; podświetlenie aktywnej ikony przez Radix `ToggleGroup`
      (`data-state="on"` → `background-color: var(--color-blue-1)`)
- [x] ikony wg konwencji projektu ([[xigma-icons]])
- [x] pierwsze 3 przyciski od lewej: Select/Move (`default`), Frame, Comment —
      realna logika (dispatch `setActiveTool`), nie tylko UI
- [x] dropdown-chevron (16×32, hover taki sam jak reszta przycisków) przy
      Select i Frame — `MouseModes/ToolDropdown` (Radix `DropdownMenu`), na
      razie pokazuje jedną, aktualnie aktywną opcję (checkmark + ikona + label + skrót klawiszowy); pozostałe warianty (Scale, Slice...) dojdą
      later jako osobny krok
- [x] **Hand tool** — pierwszy realny wariant w dropdownzie Select
      (`TOOL_GROUP_ITEMS[ToolName.default] = [ToolName.default, ToolName.hand]`), ten sam
      mechanizm "zapamiętaj ostatnio wybrany wariant" co Rectangle/Ellipse/Line/Polygon/Star
      z Etapu 6, tylko rozszerzony o drugie, równoległe pole w `store/design`
      (`lastMouseTool`, mirror `lastShapeTool`) — jedno pole `lastShapeTool` nie dało się
      użyć dla dwóch niezależnych grup naraz, więc `MouseModes.tsx`/`ToolDropdown.tsx` dostały
      wspólny `Toolbar/utils/getGroupDisplayedTool.ts` zamiast dotychczasowego
      pojedynczego warunku. Skrót klawiszowy `H`. Aktywny Hand tool blokuje interakcję z
      node'ami "za darmo" — każdy inny hook narzędzia i tak sam gate'uje się na
      `activeTool === <swoje własne ToolName>`, więc żaden nie podpina listenerów, gdy aktywny
      jest hand. Samo przeciąganie (LMB) reużywa bez zmian matematykę z istniejącego
      środkowoprzyciskowego pan (`useCanvasDragPan/utils/applyDragPan.ts`) — nowy hook
      `useHandTool.ts` różni się tylko gate'em na `ToolName.hand` i `MouseButton.primary`
      zamiast `middle`. Kursor: `hand.png` w spoczynku, przełącza się na już istniejący
      `pressing.png` (ta sama klasa `--pressing`, którą do tej pory ustawiał tylko
      środkowoprzyciskowy pan) w trakcie przeciągania
- [x] dropdown wariantów pod przyciskiem Rectangle — `MouseModes/ToolDropdown` renderuje
      `TOOL_GROUP_ITEMS[ToolName.rectangle]` (Rectangle, Line, Ellipse, Polygon, Star), przycisk
      grupy pokazuje ikonę ostatnio wybranego wariantu (`lastShapeTool` w `store/design`) —
      szczegóły narzędzi w Etapie 6 niżej
- [ ] pen / text (z własnymi dropdownami wariantów, jeśli dojdą warianty) — kolejny krok
- [ ] shapes (assets), prawa grupa (draw / scale / actions / dev mode)

## Etap 2 — Model danych sceny

- [x] `TSceneNode` jako discriminated union (`types/design/types.ts`) —
      `TBaseNode` (id/name/x/y/width/height/rotation/parentId) + `TFrameNode`
      (`type: NodeType.frame`) jako jedyny na razie wariant; `TSceneNode = TFrameNode`
      — reszta (rectangle/ellipse/text/vector) dojdzie w Etapie 6, kiedy realnie
      powstaną te narzędzia, nie wcześniej
- [x] store sceny — `store/design`: `nodes: Record<string, TSceneNode>` +
      `rootOrder: string[]` (kolejność/z-index, nie polegamy na kolejności
      kluczy obiektu). Reducery: `addNode` (id generowany przez `nanoid()` z
      `@reduxjs/toolkit` w `prepare`, nie w reducerze — reducer zostaje czystą
      funkcją), `updateNode` (częściowy patch po id, no-op na nieznane id)
- [x] viewport state: `TViewport { x, y, zoom }` w `store/design`, reducer
      `setViewport` — jedno źródło prawdy pod transformację world → screen,
      realne sterowanie pan/zoom (scroll/pinch) to Etap 4

## Etap 3 — Narzędzie Frame

- [x] aktywacja narzędzia „Frame" z toolbaru — już działało od Etapu 1
      (`activeTool` w Redux), `useFrameTool` po prostu nasłuchuje na nie
- [x] interakcja: click-drag na canvasie tworzy frame — `Canvas/hooks/useFrameTool.ts`,
      natywne listenery `pointerdown/move/up` na elemencie canvasu (nie JSX
      props, spójnie z resztą hooków canvasu), `setPointerCapture` żeby drag
      działał nawet gdy kursor wyjdzie poza canvas. Draft (w trakcie
      przeciągania) trzymany w `useRef` w `Canvas.tsx`, **nie** w Reduxie —
      render loop czyta go bezpośrednio co klatkę, żeby przeciąganie nie
      dispatchowało do store'u przy każdym pixelu
- [x] po puszczeniu przycisku myszy: `addNode` (tylko jeśli przeciągnięty
      obszar ≥ `MIN_FRAME_SIZE`, żeby zwykły klik nie tworzył 0×0 frame'a) +
      `setActiveTool(default)` — narzędzie zawsze wraca do Select po puszczeniu,
      niezależnie czy coś powstało
- [x] renderowanie frame'a na canvasie — `Canvas/utils/{createShader,createProgram,drawRect}.ts`:
      pierwszy realny WebGL rendering (dotąd był tylko `gl.clear`), prosty
      shader (`VERTEX_SHADER_SOURCE`/`FRAGMENT_SHADER_SOURCE` w `constants.ts`)
      rysujący wypełnienie (2 trójkąty) + obrys (`LINE_LOOP`). Każdy nowy frame
      dostaje losowy kolor wypełnienia (`getRandomColor.ts`) — na razie zamiast
      realnego systemu fill/stylingu. **Nazwa nad frame'em pominięta na razie**
      — tekst w WebGL to osobny, spory temat (atlas glifów/SDF), wraca jako
      osobny krok przy Etapie 6/7, kiedy i tak trzeba będzie rozwiązać
      renderowanie tekstu (Text tool + edycja)

## Etap 4 — Pan & zoom

- [x] scroll = pan, ctrl/cmd+scroll (lub pinch) = zoom wokół kursora —
      `Canvas/hooks/useCanvasPanZoom/useCanvasPanZoom.ts`: natywny listener `wheel` (bez gate'a na
      `activeTool` — działa niezależnie od aktywnego narzędzia), `{ passive: false }` +
      `preventDefault()` żeby nie walczyć z natywnym scrollem/pinch-zoomem strony.
      `event.ctrlKey` rozróżnia zoom (Ctrl/Cmd+scroll **i** pinch trackpada — przeglądarki
      raportują pinch jako `wheel` z `ctrlKey: true`) od zwykłego pan. Czysta matematyka w
      `utils/applyPan.ts`/`utils/applyZoom.ts` — zoom dociskany do `[ZOOM_MIN, ZOOM_MAX]`
      (`lodash/clamp`) i przeliczany tak, żeby punkt świata pod kursorem został w tym samym
      miejscu na ekranie po zmianie zoomu
- [x] wszystkie rysowane node'y respektują transformację viewportu — transformacja liczona
      **na GPU**, nie w JS: `VERTEX_SHADER_SOURCE` dostał `u_viewportOffset`/`u_zoom`/`u_resolution`
      i sam liczy clip-space; `drawRect.ts` przestał robić to po stronie CPU (`toClipSpace`
      usunięte), wysyła surowe współrzędne świata i nowe uniformy. Świadomy wybór GPU zamiast JS —
      to dokładnie ten sam typ decyzji co wybór WebGL zamiast Canvas 2D w Etapie 0 (per-vertex
      transform przechodzi przez każdy draw call, więc lepiej raz zrobić to dobrze niż migrować
      później przy większej scenie). Przy okazji naprawiony `useFrameTool.ts` — pozycja kursora
      konwertowana przez nowy `Canvas/utils/screenToWorld.ts` zanim trafi do `addNode`, inaczej
      nowe frame'y powstawałyby w złym miejscu przy niezerowym pan/zoom.
      **Znany, świadomy kompromis**: uchwyty narożne (`CORNER_HANDLE_SIZE`) skalują się teraz razem
      z zoomem, bo idą przez tę samą transformację co realne node'y — stały rozmiar na ekranie
      wymagałby osobnej warstwy screen-space UI, zostawione na później, nie blokuje żadnego z
      dwóch punktów tego etapu

## Etap 5 — Selekcja

- [x] hit-testing (klik w canvas → który node trafiony, z uwzględnieniem
      zagnieżdżenia we frame'ach) — `useSelectionTool/utils/getNodeAtPoint.ts`, AABB w world
      space (po `screenToWorld`), topmost wygrywa (ostatni w `rootOrder` = ostatnio narysowany).
      Zagnieżdżenie we frame'ach nieaktualne na razie — jest tylko jeden typ node'a (frame),
      `parentId` zawsze `null`, więc hit-test operuje na płaskiej liście; wraca jako temat przy
      grupach/nested frames
- [x] rysowanie selection outline + resize handles na canvasie — `drawScene/drawSelectionOutline.ts`
      (wywoływane z `drawScene.ts` po narysowaniu node'ów) rysuje outline po `selectSelectedNodes`,
      reużywając bez zmian `drawRect`/`drawCornerHandles` z Etapu 3/4 (już przyjmowały `viewport`,
      więc zadziałały na dowolnym node'ie, nie tylko na draft-rekcie draw-in-progress)
- [x] przeciąganie (move) zaznaczonego node'a (lub kilku naraz) — `useSelectionTool.ts`.
      **Skalowanie (resize) uchwytami świadomie odłożone** — to osobny kawałek roboty
      (hit-testing per-uchwyt, matematyka resize w 8 kierunkach, zmiana kursora), nie było
      częścią tego, co zostało opisane do zrobienia teraz; uchwyty są już rysowane (patrz wyżej),
      samo przeciąganie ich do zmiany rozmiaru to naturalny następny mikro-krok
- [x] **wspólny outline dla zaznaczenia 2+** — gdy zaznaczone są 2+ node'y **i mają ten sam
      `parentId`** (`Canvas/utils/haveSameParent.ts` + `isGroupSelection.ts` — dziś zawsze `true`,
      bo `parentId` jest zawsze `null`, wraca do gry przy grupach/nested frames),
      `drawScene/drawGroupSelectionOutline.ts` rysuje **jeden wspólny outline**
      (`Canvas/utils/getSelectionBounds.ts` — combined AABB) + 4 uchwyty zamiast osobnych per node
      (`drawScene/drawPerNodeSelectionOutlines.ts`), wybierane przez `drawSelectionOutline.ts` na
      podstawie `isGroupSelection`.
      Hit-test w `useSelectionTool.ts` rozszerzony o `utils/isPointInGroupBounds.ts`: kliknięcie
      **gdziekolwiek w polu wspólnego bboxa** — nawet w pustym miejscu między zaznaczonymi
      node'ami, gdzie `getNodeAtPoint` nic nie trafia — łapie i przeciąga całą grupę naraz.
      Puszczenie bez ruchu w tej luce **czyści całe zaznaczenie** — nie trafiono w żaden
      konkretny node, więc traktowane jak klik na pusty canvas, inaczej niż klik na konkretny,
      zaznaczony node z Etapu 5 wyżej (ten zwija do jednego node'a)
- [x] **zaznaczanie przez przeciągnięcie ramki (marquee)** — klik+drag na pustym canvasie
      (bez trafienia w node i poza wspólnym bboxem istniejącego zaznaczenia) uzbraja marquee
      zamiast od razu czyścić zaznaczenie. Wzorzec 1:1 z x-design
      (`ViewBox/utils/getCollidedElements.ts` + `SelectableArea`), przeniesiony na architekturę
      xigma (jeden WebGL canvas zamiast DOM-u per element): `Canvas/utils/getCollidedNodes.ts`
      operuje na `TSceneNode[]` z redux zamiast na DOM `rectCoordinates`, a sam prostokąt renderuje
      się przez `utils/canvas/drawMarquee.ts` (WebGL, nie SVG-overlay) — półprzezroczyste
      wypełnienie (`MARQUEE_FILL_ALPHA = 0.2`, ten sam pattern co x-design'owe
      `color-mix(..., 20%, transparent)`) + obrys, oba w `DRAFT_FRAME_STROKE`. Rendering
      podpięty przez `marqueeRef` dokładnie tak jak istniejący `draftRef` z Etapu 4
      (`useFrameTool`/`useCanvasRenderLoop`) — ref, nie redux, żeby nie wymuszać re-renderu na
      każdą klatkę przeciągania.
      Kolizja domyślnie **dotyka** (`!(x2<x1 || x1>x2 || y2<y1 || y1>y2)` — standardowy test
      nachodzenia AABB); z wciśniętym **Control/Cmd** (`utils/isControlPressed.ts`, rozszerzony
      z `WheelEvent` na `MouseEvent`, żeby przyjmował też `PointerEvent`) kolizja wymaga **pełnego
      zawierania** node'a w ramce. Tryb odczytywany na bieżąco z `event.ctrlKey`/`metaKey` przy
      każdym `pointermove`, więc przełączenie Control w trakcie przeciągania natychmiast zmienia
      wynik. Zaznaczenie aktualizuje się **na żywo** podczas przeciągania (dispatch przy każdym
      ruchu), nie dopiero po puszczeniu — zgodnie z x-design.
- [x] **hover highlight** — najechanie kursorem (bez wciśniętego przycisku) na node pokazuje sam
      outline, **bez** uchwytów w rogach (`useHoverHighlight/useHoverHighlight.ts` +
      `drawScene/drawHoverOutline.ts`). Stan hover trzymany w `hoverRef` (nie w redux — czysto
      renderingowa sprawa, nic więcej w apce na to nie reaguje), podpięty przez `drawScene`
      dokładnie jak `draftRef`/`marqueeRef`. Osobny hook od `useSelectionTool` — hover to
      luźno powiązana sprawa (żadnego drag/selection state), więc dostał własny plik zgodnie z
      "jeden hook = jedna sprawa" (`useFrameTool`, `useSelectionTool`, `useCanvasPanZoom`,
      `useCanvasDragPan`, `useCanvasResize` już tak działają). `getNodeAtPoint.ts` przeniesiony z
      `useSelectionTool/utils/` do współdzielonego `Canvas/utils/`, bo teraz używają go dwa hooki
      (ten sam powód co przeniesienie `toDraftRect.ts` wcześniej). Guard `event.buttons === 0` —
      hover nie aktualizuje się, gdy jakikolwiek przycisk jest wciśnięty (nie miga po node'ach,
      przez które przelatuje kursor w trakcie osobnego draggowania/marquee).
      **Pogrubiony outline** (2px, `HOVER_OUTLINE_WIDTH`, jak w Figmie) — sprawdzone na żywo:
      `gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)` zwraca `[1, 1]` w tym środowisku (Chrome/
      ANGLE), więc `gl.lineWidth()` jest całkowicie zablokowany na 1px i nie da się go użyć.
      Zamiast tego `utils/canvas/drawThickOutline.ts` (nowy, globalny prymityw) rysuje ramkę jako
      4 wypełnione, cienkie prostokąty (triangle-based border), nie jako `LINE_LOOP` — jedyny
      niezawodny sposób na WebGL-owy gruby stroke. Skalowany przez zoom identycznie jak
      `CORNER_HANDLE_SIZE` (dzielenie przez `viewport.zoom`), więc zostaje stałej grubości na
      ekranie. Świadomie **nie** dotyka współdzielonego `drawRect.ts` (używanego też przez
      zaznaczenie/draft-frame/marquee) — to osobna funkcja, bo grubszy outline miał dotyczyć
      wyłącznie hover.

  Pełna semantyka zaznaczania 1:1 z Figmy/x-design (`Element/utils/handleSelectElement.ts` +
  `MultipleElementsArea/ClickableArea/*`), ale spleciona w **jeden** hit-test-driven handler
  zamiast dwuwarstwowego systemu DOM-owego z x-design (`Element`-level handler +
  `ClickableArea` overlay z `stopPropagation`) — xigma nie ma DOM-u per node (jeden canvas,
  ręczny hit-test), więc dwuwarstwowość x-design nie miała się w co przełożyć 1:1; ten sam efekt
  wychodzi z jednej funkcji z `dragStateRef` (`pendingClickAction` — `{ kind: 'collapse', id }` /
  `{ kind: 'deselect' }` / `null` — + `hasMoved`, ustalane na pointerdown, rozstrzygane na
  pointerup):
  - klik (bez shift) na niezaznaczony node → zaznacza tylko jego
  - shift+klik na niezaznaczony → dokłada do zaznaczenia; shift+klik na zaznaczony → zdejmuje
  - klik (bez shift) na node będący częścią zaznaczenia 2+, puszczony **bez ruchu** → zwija
    zaznaczenie do tego jednego node'a (`pendingClickAction.kind === 'collapse'`)
  - klik+**przeciągnięcie** (bez shift) node'a z zaznaczenia 2+ → cała grupa przesuwa się
    razem, zaznaczenie **zostaje** nietknięte (nie zwija się do jednego)
  - klik na nowy, nigdy niezaznaczony node przy istniejącym zaznaczeniu 2+ → zastępuje całe
    zaznaczenie tym jednym (ta sama ścieżka co zwykły klik)
  - klik na pusty obszar canvasu → czyści całe zaznaczenie (shift+klik na pustym → no-op)
  - klik (bez shift) w lukę wewnątrz wspólnego bboxa zaznaczenia 2+ (nie trafiając w żaden
    node), puszczony **bez ruchu** → czyści całe zaznaczenie
    (`pendingClickAction.kind === 'deselect'`); z ruchem → przeciąga całą grupę, zaznaczenie
    nietknięte

## Etap 6 — Kolejne narzędzia rysujące (bieżący krok)

- [x] **Rectangle** — pierwsze narzędzie po Frame, więc przy okazji Frame/Rectangle/Ellipse
      zostały zunifikowane pod jeden generyczny hook `useDrawShapeTool.ts`
      (`TShapeToolConfig { fill, name, tool, type }` — identyczna logika drag/commit dla trzech
      typów node'ów, różni je tylko `type`/`fill`); dotychczasowy `useFrameTool.ts` przestał być
      osobnym plikiem. Losowy kolor wypełnienia z Etapu 3 (`getRandomColor.ts`) usunięty na rzecz
      stałego `RECTANGLE_FILL`/`ELLIPSE_FILL` (`Canvas/constants.ts`) — realny system fill/stylingu
      to wciąż temat na później (Etap 8), na razie każdy typ kształtu ma jeden stały kolor
- [x] **Ellipse** — rendering (`drawEllipse`) + hit-testing (`isPointInEllipse.ts`, punkt w elipsie
      przez znormalizowane równanie, nie AABB) + hover outline (`drawThickEllipseOutline`, ten sam
      "gruby stroke przez trójkąty" trick z Etapu 5, bo `gl.lineWidth()` dalej zablokowany na 1px).
      Podpięty pod ten sam `useDrawShapeTool` co Rectangle
- [x] **Line** — jedyne narzędzie z inną geometrią niż `{x, y, width, height}` (`x1/y1/x2/y2`), więc
      dostało własny hook (`useDrawLineTool.ts`) zamiast `useDrawShapeTool`. Hit-test to odległość
      punktu od odcinka z tolerancją w px przeliczaną na world space przez `viewport.zoom`
      (`isPointNearLine.ts`), nie AABB. Przy okazji: uchwyty na końcach linii da się przeciągać
      osobno (`line-drag.spec.ts` w e2e) — pierwszy node z edytowalną geometrią po utworzeniu, nie
      tylko przesuwaniem/resize całości
- [x] **Polygon** — pierwsze narzędzie z parametrem poza `{x, y, width, height, fill}`: liczba boków
      (`sides`, na razie stała `POLYGON_DEFAULT_SIDES`, bez panelu właściwości — Etap 8). Własny hook
      (`useDrawPolygonTool.ts`) bo trzeba przenieść `sides` przez draft → `addNode`. Geometria
      (`getPolygonPoints.ts`) generuje wierzchołki równomiernie po elipsie wpisanej w bbox, wierzchołek
      apex zawsze u góry. **Rozdzielone dwa różne obrysy**: zaznaczenie (resize handles) to nadal
      zwykły prostokątny bbox (`drawPerNodeSelectionOutlines` — bez zmian, generyczne dla każdego
      node'a), ale hover-outline realnie **śledzi kształt** (`drawThickPolygonOutline.ts`, ten sam
      inner/outer-ring trick co elipsa/Etap 5, tylko po wierzchołkach wielokąta zamiast krzywej)
- [x] **Star** — jak Polygon, ale dwa parametry: liczba ramion (`points`, domyślnie 5) i `ratio`
      (promień wewnętrzny/zewnętrzny, domyślnie 38.2%, złoty-podział-jak gwiazda). Geometria
      (`getStarPoints.ts`) to `getPolygonPoints` z wierzchołkami na przemian zewnętrznymi/wewnętrznymi
      (`points * 2` wierzchołków) — przy `ratio = 1` kolapsuje do zwykłego `2n`-kąta (sprawdzone: dla
      `points=5, ratio=100%` wychodzi dziesięciokąt, nie gwiazda), co pokrywa cały zakres, łącznie z
      degenerackimi przypadkami z referencyjnych zrzutów z Figmy (bardzo mały `ratio` → cienkie
      kolce, `ratio=100%` → wielokąt/prawie koło). Reużyty ten sam wzorzec co Polygon: własny hook
      (`useDrawStarTool.ts`), `drawStar`/`drawThickStarOutline`/`isPointInStar`, bbox-owy outline
      zaznaczenia bez zmian, hover realnie śledzi kształt. Bez skrótu klawiszowego (jak Polygon)
- [x] **Media (obraz/wideo)** — pierwsze narzędzie z realną zawartością pikselową, więc pierwszy raz
      dotyka WebGL poza płaskim kolorem: osobny, izolowany program tekstur (`TImageRenderContext`)
      obok istniejącego `u_color`-owego shadera, żeby Rectangle/Ellipse/Polygon/Star nie musiały
      dostawać nieużywanego atrybutu UV. Cache tekstur (`getOrLoadTexture.ts`) — 1×1 przezroczysty
      placeholder od razu, realny obraz podmieniany w miejscu po `Image.onload`. Wybór pliku przez
      natywny `<input type="file" accept="image/*" multiple>`: klik na canvasie umieszcza plik w
      naturalnym rozmiarze pikseli, przeciągnięcie umieszcza z zablokowanym aspect ratio
      (`getAspectRatioLockedRect.ts`) — inaczej niż Rectangle/Polygon/Star, które skalują się
      swobodnie. **Wiele plików naraz**: `useDrawMediaTool.ts` trzyma kolejkę (`queueRef`), narzędzie
      zostaje aktywne między kolejnymi plikami — każdy można umieścić klikiem albo przeciągnięciem
      niezależnie, aż kolejka się wyczerpie. Kursor podczas uzbrojenia to **jeden złożony obraz**
      (`createArmedCursor.ts`, canvas-composited PNG data URL) łączący krzyżyk (`pointer.png`) z
      miniaturką wybranego pliku, zamiast dwóch osobnych elementów (starsze podejście z osobną,
      podążającą za kursorem miniaturką na canvasie — zostało usunięte jako zdublowane). Gdy w
      kolejce jest więcej niż 1 plik, kursor dostaje **czerwony badge z licznikiem** (kolor
      dobrany z referencyjnego zrzutu Figmy, bez motywu jasny/ciemny), wyśrodkowany dokładnie na
      rogu miniaturki; odstęp między krzyżykiem a miniaturką/badge'em rośnie tylko wtedy, gdy badge
      faktycznie się rysuje (o połowę jego promienia), żeby nie zachodził na glif "+" — przy
      pojedynczym pliku układ zostaje ciasny jak wcześniej
- [x] **Media — wsparcie dla wideo** — `accept` inputu rozszerzony na `image/*,video/*`
      (`useDrawMediaTool.ts`); węzeł na scenie (`TMediaNode`) nadal trzyma tylko `src` jako
      string do statycznego obrazu, więc wideo jest **zamieniane na 1 klatkę** zanim trafi na
      canvas — `extractVideoFrame.ts` tworzy ukryty, ale realnie wstawiony do DOM-u element
      `<video>` (poza drzewem dokumentu część przeglądarek nie dekoduje/renderuje klatki), po
      `loadeddata` jawnie seekuje na mały offset (~0.1s) i czeka na `seeked` — samo
      `loadeddata` bywa zbyt wczesne, złapana klatka potrafi wyjść pusta/biała — po czym rysuje
      bieżącą klatkę na offscreen `<canvas>` i konwertuje do PNG blob URL przez
      `canvas.toBlob`. Cała reszta pipeline'u (cache tekstur WebGL, `TMediaNode`, drag&drop na
      canvasie) działa bez zmian — z punktu widzenia renderera wideo to zwykły obrazek
- [x] **Text** — tworzenie node'a łączone od razu z edycją treści (jedyne narzędzie, które **nie**
      dispatchuje `addNode` od razu po puszczeniu myszy jak reszta) — pełny opis flow i renderingu
      w Etapie 7 niżej
- [x] **Text on Path** — tekst układany wzdłuż krzywej zamiast zwykłego prostokątnego boxa. Własny
      hook (`useDrawTextOnPathTool.ts`, `ToolName.textOnPath`) rysuje elipsę (`PathType.ellipse`)
      tym samym gestem drag co Ellipse, po puszczeniu myszy dispatchuje `addNode` dla samej ścieżki
      i od razu wchodzi w edycję tekstu (`startTextEdit`) z `pathId` wskazującym na nowo utworzony
      węzeł — bez czekania na osobny klik, tak samo jak zwykły Text tool. Layout liter wzdłuż łuku
      liczony jest z tabeli długości łuku elipsy (`buildEllipseArcLengthTable.ts`,
      `getEllipsePathSample.ts`), nie z prostej interpolacji kąta, żeby odstępy między literami
      zostawały wizualnie równe niezależnie od proporcji elipsy. Punkt startowy tekstu na krzywej
      (`pathStartOffset`, ułamek 0–1 obwodu) przesuwany jest osobnym **uchwytem offsetu**
      (`drawPathTextOffsetHandle.ts`) — przeciąganie przelicza najbliższy punkt na łuku pod
      kursorem (`getNearestPathOffsetAtPoint.ts`). `flipX`/`flipY` (mirror) i `pathFlip` (kierunek
      czytania wzdłuż krzywej) respektowane osobno w geometrii glifów (`flipTextPoint.ts`) i w
      pozycji samego uchwytu, żeby przeciąganie na zmirrorowanym tekście trafiało w jego
      rzeczywistą, nieodbitą pozycję. Obrys samej ścieżki (elipsy) jest ukryty domyślnie
      (`getPathOutlineStyles.ts`) i pokazuje się dopiero przy hover/selekcji/edycji —
      **przerywaną** kreską (`drawDashedEllipseOutline.ts`) podczas aktywnego rysowania/edycji,
      **ciągłą** po samym zaznaczeniu bez edycji — żeby stan "w trakcie pracy" był wizualnie
      odróżnialny od "gotowe, tylko zaznaczone".

      **Poprawka (po zgłoszeniu, że uchwyt offsetu nie reaguje od razu po narysowaniu)**: po
          puszczeniu myszy `useDrawTextOnPathTool.ts` wchodzi w edycję tekstu **bez `id`** — węzeł
          tekstowy nie istnieje jeszcze w Reduxie, bo Text (i Text on Path) commituje się dopiero na
          `blur` (Etap 7), nie od razu jak reszta narzędzi. Trzy miejsca liczące pozycję/hit-test
          uchwytu offsetu opierały się jednak wyłącznie na **zacommitowanym** node'ie: `drawScene.ts`
          rysował uchwyt tylko dla node'a znalezionego w `nodesById`, a `useHoverHighlight.ts` i
          `useCurvedCaretEditing.ts` hit-testowały tylko `selectedNodes` — w efekcie podczas
          pierwszego rysowania uchwyt był niewidoczny, kursor przy najechaniu się nie zmieniał, a
          kliknięcie/przeciągnięcie w ogóle nie łapało uchwytu, mimo że dokładnie ten sam gest
          działał już poprawnie dla wcześniej zapisanego tekstu na ścieżce. Naprawione przestawieniem
          wszystkich trzech miejsc na **`editingTextBox`** (stan aktywnej edycji w Reduxie, istnieje
          od razu, niezależnie od tego czy węzeł już jest zacommitowany) jako jedyne źródło prawdy
          podczas edycji — `getPathTextHandlePoint.ts` już wcześniej przyjmował ten typ zamiennie z
          prawdziwym node'em, więc rysowanie/hit-test/drag przestawiły się bez zmiany matematyki,
          tylko zmieniając *skąd* biorą dane. Przeciąganie w trakcie tworzenia aktualizuje
          `editingTextBox.pathStartOffset` bezpośrednio (`updateEditingTextBoxPathStartOffset`, nowy
          reducer) i dopiero komit zapisuje tę wartość na właściwym node'ie; gdy węzeł już istnieje
          (ponowna edycja zapisanego tekstu), przeciąganie nadal aktualizuje też node'a na żywo, jak
          wcześniej. Przy okazji: `useCurvedCaretEditing.ts` (hit-test kliknięcia w tekst na krzywej)
          rozbity na osobne pliki per handler pointerowy (`utils/handlePointerDown/`,
          `utils/handlePointerMove/`, `utils/handlePointerUp/`), analogicznie do istniejącej
          struktury `useSelectionTool`. Zweryfikowane e2e (Playwright): narysowanie ścieżki,
          wpisanie tekstu i przeciągnięcie uchwytu offsetu w tej samej, nieprzerwanej sesji edycji —
          bez klikania gdziekolwiek indziej po drodze

- [x] **Slice** — narzędzie do zaznaczania obszaru canvasu pod przyszły eksport (PNG itd.); realnego
      panelu/eksportu jeszcze nie ma (patrz Etap 8/15), więc na razie zachowuje się jak rysowanie
      ramki bez tła. Zapowiedziane już w Etapie 1 ("pozostałe warianty (Scale, Slice...) dojdą
      later") — dołączyło do dropdownu Frame, zaraz po Section
      (`TOOL_GROUP_ITEMS[frame] = [frame, section, slice]`), własny skrót **`S`** (bez modyfikatora,
      w odróżnieniu od Section'owego `Shift+S`). **Świadomie nigdy nie trafia do `store/design`** —
      user wprost zastrzegł, że to tymczasowy byt na canvasie, nie realny node sceny, więc cała jego
      geometria (`TSliceDraft { x, y, width, height, rotation }`) żyje w zwykłym `useRef` (`sliceRef`
      w `Canvas.tsx`, analogicznie do `draftRef`/`marqueeRef`), czytanym bezpośrednio przez render
      loop — zero dispatchy do Reduxu podczas rysowania/przeciągania. Własny hook
      `useSliceTool/` mirroruje styl plikowy `useSelectionTool` (osobne `arm*`/`continue*`/`disarm*`
      pliki per `handlePointerDown/Move/Up`), ale znacznie mniejszy, bo operuje zawsze na dokładnie
      jednym, nie-grupowym, nie-line'owym boxie — bez całej generalizacji multi-node/flip z Etapu 10.
      Inaczej niż Frame/Section/Rectangle: po puszczeniu myszy narzędzie **zostaje aktywne** (nie
      wraca do `default`), żeby świeżo narysowany box dało się od razu resize'ować/obracać/przesuwać
      — dopiero kliknięcie **poza** jego obszarem kasuje go (`sliceRef.current = null`) i dopiero
      wtedy wraca do Move, tym samym mechanizmem co dotychczasowe "jeden kształt i powrót do Select".
      Resize/rotate/move to własna, uproszczona wersja matematyki z Etapu 10 (rotowany resize liczony
      przez odwrócenie punktu kursora do lokalnej przestrzeni boxa, przeliczenie brzegów, obrót
      środka z powrotem — `getResizedEdges.ts`/`getResizedSliceBounds.ts`/`continueResizeDrag.ts`),
      bez shear'u/flip/multi-node, bo Slice zawsze jest dokładnie jednym prostym boxem.

      **Poprawka (po zgłoszeniu na żywo, że kursor cały czas pokazuje `pointer.png`)**: `ToolName.slice`
      dodane do `DRAWING_TOOLS` (Etap 0/1, klasa `--drawing` = krzyżyk na cały czas trwania aktywnego
      narzędzia) dawało crosshair-owy kursor przez **cały** czas trwania narzędzia, nie tylko podczas
      samego rysowania — inaczej niż Frame/Section, które zawsze wracają do `default` zaraz po jednym
      kształcie, więc dla nich ten sam mechanizm nigdy nie kolidował z fazą "edytuj już narysowany
      kształt". Naprawione nowym `updateHoverCursor.ts` (odpalane co `pointermove`, gdy
      `event.buttons === 0`), które jawnie nadpisuje `canvas.style.cursor` wartością konkretnego
      kursora (resize/rotate nad uchwytem, albo jawny "domyślny" poza nimi) zamiast pustego stringa —
      pusty string tylko *zdejmuje* inline-style i odsłania z powrotem klasę `--drawing`, która nadal
      jest aktywna, dopóki `activeTool === slice`. "Domyślny" kursor to nie CSS-owe słowo kluczowe
      `default`, tylko dokładnie ten sam obrazek co bazowy kursor canvasu
      (`assets/icons/cursors/default.png`) — wydzielony do nowego, współdzielonego
      `utils/canvas/defaultCursor.ts` (`DEFAULT_CURSOR`), użytego też przy zakończeniu pierwszego
      rysowania (`disarmDrawDrag.ts`), żeby kursor przełączał się na "gotowe" natychmiast po puszczeniu
      myszy, a nie dopiero przy najbliższym `pointermove`.

      **Poprawka (po zgłoszeniu na żywo, ze zrzutem ekranu)**: przy obróconym Slice user chciał
      dodatkowy, przerywany prostokąt pokazujący **rzeczywisty rozmiar przyszłego eksportu**
      (axis-aligned bounding box obróconego boxa — to on, nie sam obrócony box, odpowiada realnemu
      rozmiarowi pikseli, jakie wyjdą z przyszłego eksportu), rysowany pod spodem, plus żeby ten
      dodatkowy prostokąt też łapał przeciąganie (samo przesuwanie, nie resize/rotate — te zostają
      wyłącznie na uchwytach właściwego, obróconego boxa). Nowy, generyczny
      `utils/canvas/getRotatedBoundingBox.ts` (rotuje 4 rogi, bierze AABB) użyty w dwóch miejscach:
      rysowanie (`drawSliceDraft.ts` woła istniejący `drawDashedRectOutline.ts` na obliczonym bboxie
      z `rotation=0`, tylko gdy `slice.rotation !== 0` — przy braku obrotu bbox pokrywałby się z
      właściwym boxem jeden do jednego, więc rysowanie go byłoby czystym marnotrawstwem) i hit-test
      (`handlePointerDown.ts`: warunek "przesuń" zamieniony z testu przeciw surowym, nieobróconym
      granicom boxa na test przeciw jego rotowanemu bboxowi) — przy okazji naprawiło to realnego,
      wcześniej niezauważonego buga: stary test w ogóle nie odwracał punktu kursora przed
      porównaniem, więc dla dowolnie obróconego Slice'a kliknięcie we właściwy, widoczny obszar boxa
      czasem w ogóle nie łapało przeciągnięcia. Osobno wypróbowany i **odrzucony** przez usera pomysł
      na etykietę z wymiarami (`SliceDimensionLabel`, DOM-owy overlay analogiczny do
      `TextEditOverlay`, z `requestAnimationFrame`-owym mostkiem ref→state, bo `sliceRef` nie
      wywołuje re-renderów Reacta) — zostawiony tylko przerywany bbox, bez tekstu.

      **Poprawka (po zgłoszeniu na żywo, że przerywana kreska jest za gęsta)**: `drawDashedRectOutline.ts`
      miał na sztywno wpisane stałe `FONT_SIZE_GUIDE_DASH_LENGTH_PX`/`GAP_PX` (2px/2px — dobre dla
      wąskiej prowadnicy rozmiaru fontu z Etapu 7, za gęste na duży prostokąt). Sparametryzowany
      (`dashLength`/`dashGap` jako jawne argumenty), jego jedyny dotychczasowy callsite
      (`drawPathTextFontSizeGuide.ts`) przekazuje te same stałe co dotąd (zero zmiany zachowania), a
      Slice dostał własne, wyraźnie rzadsze `SLICE_BOUNDING_BOX_DASH_LENGTH_PX`/`GAP_PX`
      (`constant/canvas.ts`).

      Zweryfikowane w 100% pokryciem testów jednostkowych oraz e2e (`create-slice.spec.ts`: rysowanie
      z dropdownu i ze skrótu `S`, resize po narysowaniu, kasowanie po kliknięciu poza obszarem z
      powrotem do `default` i canvas wracający piksel-w-piksel do stanu sprzed rysowania — screenshot
      przycięty tak, żeby nie łapał floating toolbara, bo ten realnie zmienia własną ikonkę po użyciu
      Slice'a, `lastFrameTool`), a na końcu ręcznie przez użytkownika na żywo

- [x] **Klik bez przeciągnięcia stawia element domyślnego rozmiaru (100×100)** — do tej pory każde
      narzędzie rysujące gate'owało commit na `rect.width >= MIN_SHAPE_SIZE && rect.height >=
      MIN_SHAPE_SIZE` (`MIN_SHAPE_SIZE = 2`), więc zwykły klik (albo przeciągnięcie zbyt małe w
      choćby jednej osi) nie robił nic — zgłoszone jako niezgodne z Figmą, gdzie klik zawsze stawia
      element 100×100. Wzorcem był już istniejący mechanizm Media tool
      (`useDrawMediaTool/utils/handlePointerUp/handlePointerUp.ts`), które już umiało odróżnić klik
      od przeciągnięcia i postawić plik w jego naturalnym rozmiarze zamiast nic nie robić — nowy,
      współdzielony `Canvas/utils/toDraftRectWithDefault.ts` uogólnia dokładnie ten wzorzec (ta sama
      logika "czy to za mały ruch" co dotychczasowy gate, tylko zamiast odrzucać, podstawia domyślny
      rozmiar), z nowym `DEFAULT_SHAPE_SIZE = 100` (`Canvas/constants.ts`). Dotyczy Frame, Section,
      Slice, Rectangle, Ellipse, Polygon, Star, Text i Text on Path — Media zostało nietknięte
      (ma już własną, analogiczną ścieżkę). Dla tekstów (Text, Text on Path) klik nadal wchodzi w
      tryb edycji dokładnie tak jak przeciągnięcie, tylko z domyślnym boxem zamiast nic nierobienia.
      **Kotwica różni się per grupa narzędzi** — dla wszystkich figur (Frame/Section/Slice/
      Rectangle/Ellipse/Polygon/Star) domyślny box jest **wyśrodkowany na punkcie kliknięcia**
      (`centered: true` w `toDraftRectWithDefault`), ale dla Text/Text on Path lewy-górny róg boxa
      zostaje **dokładnie w punkcie kliknięcia** (`centered: false`), tak samo jak przy zwykłym
      przeciągnięciu z tego samego punktu startowego — ta druga zasada nie zmieniła się, tylko
      przestała wymagać realnego ruchu myszy, żeby zadziałać. `useSliceTool`'s
      `disarmDrawDrag.ts` dostało przy okazji realną poprawkę: skoro Slice nigdy nie dispatchuje
      `addNode`, dotychczasowy kod czytał `sliceRef.current` (wypełniany tylko przez `pointermove`),
      więc czysty klik bez żadnego `pointermove` zostawiał go `null` i trafiał w gałąź odrzucenia —
      przepisane tak, żeby samo `disarmDrawDrag` przeliczało rect z pozycji `pointerup`, dokładnie
      jak pozostałe narzędzia, więc gałąź "odrzuć" w ogóle znikła (Slice po prostu zawsze zostaje z
      jakimś boxem, rzeczywistym albo domyślnym). Zweryfikowane 100% pokryciem testów jednostkowych
      (każdy dotknięty hook, plus `toDraftRectWithDefault.spec.ts`) oraz e2e per narzędzie
      (`create-frame.spec.ts`, `create-section.spec.ts`, `create-rectangle.spec.ts`,
      `create-ellipse.spec.ts`, `create-polygon.spec.ts`, `create-star.spec.ts`,
      `create-text.spec.ts`, `text-on-path.spec.ts`, `create-slice.spec.ts`).
- [x] **Poprawka: próg "czy to za mały ruch" w `toDraftRectWithDefault` liczony teraz w screen space,
      nie world space** — zgłoszony bug: przy maksymalnym zoomie (256x) narysowanie świadomie małego
      kształtu (np. 1x1 world unit, co wymaga realnego przeciągnięcia myszą o ~256px na ekranie) i tak
      wpadało w gałąź "za mały ruch, podstaw domyślny 100x100", bo stary warunek porównywał surową
      deltę world-space z `MIN_SHAPE_SIZE` (2) bez uwzględnienia zoomu — im większy zoom, tym mniejsza
      delta world-space przy tym samym, realnym ruchu ręki. Nowy, osobny `MIN_DRAG_DISTANCE_PX = 2`
      (`Canvas/constants.ts`, świadomie osobna stała od `MIN_SHAPE_SIZE` — ta druga zostaje jako
      world-space minimum node'a używane gdzie indziej, np. `computeResizedRect.ts`) mnoży deltę przez
      `zoom` przed porównaniem, więc "czy to była tylko kropka klikiem, czy świadomy drag" jest teraz
      pytaniem o dystans na ekranie (motoryka ręki), nie o wynikowy rozmiar w world space — dokładnie
      odwrotny błąd do tego, co ten sam viewport-independent-threshold problem rozwiązuje gdzie indziej
      w kodzie (np. hit-testy uchwytów skalujące tolerancję przez `viewport.zoom`). Wszystkie 6 miejsc
      wywołujących `toDraftRectWithDefault` (Frame/Section/Slice/Rectangle/Ellipse/Polygon/Star/Text/
      Text on Path) przekazują teraz `viewport.zoom`, który i tak już mieli w scope obok
      `screenToWorld`.

- [x] **Arrow** — nie osobny typ node'a, tylko `TLineNode` z nowymi, opcjonalnymi polami
      `startPoint`/`endPoint` (`'default' | 'arrow'`, domyślnie `'default'` dla zwykłej Line).
      Reużywa bez zmian `useDrawLineTool.ts` — drugi callsite w `Canvas.tsx` z osobnym
      `TLineToolConfig` (`ARROW_TOOL_SETTINGS`, `endPoint: 'arrow'`), więc geometria/hit-testing/
      resize zostają dokładnie te same co dla Line, zero nowej logiki poza domyślną wartością pola.
      Dzieli slot w toolbarze z Line w dropdownzie Rectangle (`TOOL_GROUP_ITEMS[rectangle] =
      [rectangle, line, arrow, ellipse, polygon, star, media]`, zaraz po Line), własny skrót
      `Shift+L` (w odróżnieniu od samego `L` dla Line, ten sam wzorzec co Section/Slice). Grot to
      nie wypełniony trójkąt, tylko dwa grube, zaokrąglone "skrzydła" (`drawArrowhead.ts`, nowy
      prymityw w `utils/canvas/`) — w tym silniku nie ma jeszcze prymitywu do rysowania
      zaokrąglonej polilinii, więc zaokrąglenie robione jest przez dorysowanie małych wypełnionych
      kółek (`drawEllipse`) w narożu i na końcu każdego skrzydła. Rysowany przy commitowanym
      node'ie (`drawSceneNodes.ts`) i przy draft-rekcie w trakcie ciągnięcia (`drawDraftLine.ts`),
      przez wspólny `drawLineEndpointArrowheads.ts`. **Świadomie bez zmian w hit-testingu/bboxie**
      (`isPointNearLine.ts`, `getNodeBounds.ts`) — grot jest czysto wizualny, klikalny obszar linii
      zostaje dokładnie taki jak wcześniej, nawet jeśli grot wizualnie wystaje poza sam odcinek.
- [x] **Pen / vector** — nie klasyczny `start → points → close`, tylko prawdziwy Vector Network
      (`NodeType.vector`: `vertices`/`segments` z kubicznymi tangentami *na segmencie*, nie na
      wierzchołku — jedyny sposób, żeby rozgałęzienie stopnia 3+ było w ogóle reprezentowalne).
      Genuinely nie mieści się w checkliście "8 concerns" z tego dokumentu — pierwsze kliknięcie od
      razu commituje realny node (nie draft), narzędzie jest wieloklikowe/wielosesyjne, `Escape` ma
      3-stopniowe wyjście (kończy fragment → wyłącza Pen ale zostaje w Vector Edit Mode → dopiero
      trzeci raz wychodzi z edycji), a edycja (Vector Edit Mode) to nowe resolvery w
      `useSelectionTool`, nie osobne narzędzie. Fill regionów liczony na żywo z grafu (stencil-buffer
      even-odd, nowa technika WebGL w tym silniku) zamiast trzymanej listy konturów. Zbudowano przy
      okazji **cały Etap 11** (undo/redo, patrz niżej) jako fundament, bo bez niego operacje na
      wierzchołkach/uchwytach nie miałyby żadnego Ctrl+Z. Pełny opis: `.claude/docs/vector-network.md`.

## Etap 7 — Edycja tekstu (DOM overlay) + rendering tekstu w WebGL

- [x] **Text tool** — jedyne narzędzie łączące tworzenie node'a z natychmiastową edycją treści
      (`useDrawTextTool.ts`): przeciągnięcie obszaru dispatchuje `startTextEdit({x,y,width,height})`,
      nie `addNode` — node trafia do Reduxu dopiero po zakończeniu edycji, i tylko jeśli wpisano
      niepustą treść. Dzięki temu „nie chcemy pustych tekstów" wychodzi za darmo: nic nigdy nie
      powstaje, więc nie ma czego kasować
- [x] `TextEditOverlay` — montowany warunkowo tylko dla aktualnie edytowanego node'a (`editingTextBox`
      w `store/design`), pozycjonowany przez `worldToScreen.ts` (odwrotność `screenToWorld.ts`).
      Prawdziwy `contentEditable` div (nie `<textarea>`), szerokość na sztywno z przeciągniętego
      obszaru, wysokość auto-grow — świadomie **bez** `minHeight` z przeciągniętego obszaru, bo to
      psuło rozmiar renderowanego tekstu po commicie (patrz niżej)
- [x] synchronizacja treści z powrotem do `SceneNode` — `useCommitTextEdit.ts`, `onBlur`: `.innerText`
      (nie `.textContent`, żeby zachować złamania linii), **białe znaki liczą się jako treść** (brak
      `.trim()` przed sprawdzeniem długości), pusta treść → tylko `stopTextEdit()`, node nigdy nie
      powstaje
- [x] **rendering tekstu w WebGL — MSDF (Multi-channel Signed Distance Field)**, nie bitmapa.
      Pierwsze podejście (v1, świadomy skrót z Etapu 3) renderowało tekst raz do offscreen Canvas 2D
      i wgrywało jako zwykłą teksturę (`getOrCreateTextTexture.ts`, ten sam pipeline co Media) — ale
      bitmapa o stałej rozdzielczości nieuchronnie rozmywa się przy przybliżeniu, a mipmapy
      (`gl.generateMipmap`, dodane po drodze) naprawiły tylko falowanie przy oddaleniu, nie
      rozmazywanie przy zbliżeniu — bitmapy nie da się "doostrzyć". Docelowe rozwiązanie: prawdziwy
      atlas glifów MSDF, ta sama technika co w oryginalnej Figmie — tekstura koduje **odległość od
      krawędzi litery** (kanały RGB), a fragment shader (`msdfFragmentShaderSource.ts`) odtwarza
      ostrą krawędź proceduralnie przy dowolnym zoomie
      (`u_screenPxRange = distanceRange * fontSize * zoom / atlas.size`) — sprawdzone live na 500%,
      ~2000% i blisko `ZOOM_MAX` (25600%), krawędzie zostają idealnie ostre na każdym poziomie.
      Atlas generowany raz, offline, narzędziem `msdf-bmfont-xml`
      (`npm run generate:font-atlas`, `src/assets/fonts/inter/`) z prawdziwego statycznego TTF-a —
      Inter to font zmienny (variable font), więc `fonttools varLib.instancer` najpierw "zamraża" go
      na wadze Regular/400 przed generacją. Layout (zawijanie wierszy) przeniesiony z
      `canvas.measureText` na metryki z atlasu (`getGlyphAdvance.ts`/`measureGlyphTextWidth.ts`),
      geometria liter batchowana w jeden bufor na node (`buildGlyphQuads.ts`, ten sam wzorzec co
      `drawPolygon`/`drawStar` — jeden `bufferData` + jeden `drawArrays` zamiast quada per literę),
      cache geometrii keyowany **bez** zoomu/DPI (`getOrBuildTextGeometry.ts`) — to jest realna
      przewaga MSDF nad starym podejściem: raz policzona geometria zostaje poprawna na każdym
      zoomie, nie trzeba jej przeliczać przy zmianie przybliżenia. Znaki spoza wypalonego zestawu
      (obecnie: ASCII + polskie znaki diakrytyczne + podstawowa typografia) są pomijane po cichu z
      fallbackowym odstępem — bez crasha, bez zastępczego "boxa"
- [x] **dostrojenie wagi/ostrości atlasu** — po zgłoszeniu, że tekst po commicie wygląda odrobinę
      grubiej niż w `TextEditOverlay` podczas edycji: sprawdzone przez `fonttools`, że mój
      wyekstrahowany statyczny TTF (`varLib.instancer`, `wght=400 opsz=14` — to akurat też domyślne
      wartości osi tego fonta) jest **bajt w bajt identyczny** z plikiem serwowanym przez
      `@fontsource/inter` (ta sama wersja `4.001;git-66647c0bb`, identyczne advance widths) — różnica
      nie brała się więc ze złego fonta, tylko z za niskiej rozdzielczości pieczenia atlasu
      (`fontSize=42` dawał grubszą rekonstrukcję krawędzi w shaderze niż oryginalny kontur). Podbite
      do `fontSize=64, distanceRange=6` (`generate:font-atlas`) — zmierzone pokrycie "atramentem"
      (piksele tekstu) spadło z wyraźnie widocznej różnicy do -0.63%, czyli szumu pomiaru
- [x] **mipmapy dla tekstury atlasu** — `getMsdfAtlasTexture.ts` dostał **własny loader** (przestał
      delegować do współdzielonego `getOrLoadTexture.ts`, używanego też przez Media) z
      `gl.generateMipmap` wywoływanym po załadowaniu prawdziwego obrazu — bo minifikacja pola
      odległości bez mipmap psuje wynik progu mediany dokładniej/bardziej widocznie niż zwykłe
      zdjęcie (dla Media to nie był problem, dla MSDF tak)
- [x] **kontrast/gamma-correction dla drobnego tekstu** — przy oddalaniu (`u_screenPxRange < ~2px`)
      `msdfFragmentShaderSource.ts` rozciąga `opacity` wokół progu krawędzi (0.5), naśladując to co
      przeglądarki robią dla czytelności małego tekstu (gamma-corrected antialiasing zamiast
      liniowego blendowania). Pomaga w realistycznym zakresie oddalenia (np. żeby zobaczyć więcej
      planszy). **Świadomie nie próbuje** naprawić skrajnego przypadku (wiele całych liter + odstępy
      między nimi skompresowane w kilka pikseli ekranu, ~12×+ pomniejszenia) — sprawdzone liczbowo
      i wizualnie, że przy takim oddaleniu poprawka nic nie zmienia, bo to już nie kwestia krzywej
      kontrastu jednego fragmentu, tylko fizycznego braku rozdzielczości do pokazania tylu osobnych
      liter naraz — realna Figma ma dokładnie ten sam efekt przy takim oddaleniu, to nie jest bug

## Etap 8 — Panele boczne

- [ ] panel warstw (drzewo node'ów, zawsze zwykły DOM/React) — lista `rootOrder` + nazwa + ikona
      typu; reorder drag&drop (zmiana `rootOrder`), zmiana nazwy (`updateNode` na `name`), toggle
      widoczności/blokady wymaga nowych pól na `TBaseNode` (`visible`/`locked`), które dziś nie
      istnieją
- [ ] panel właściwości zaznaczonego node'a — sekcja X/Y/W/H (numeryczne inputy, dwukierunkowo
      zsynchronizowane z `updateNode`/canvasem), sekcja Fill (dziś każdy typ kształtu ma jeden
      stały kolor z `Canvas/constants.ts` — realny color picker to pierwszy krok do tego, żeby fill
      w ogóle był edytowalny), sekcja Stroke (dziś nie istnieje w żadnym typie węzła poza
      `TLineNode.stroke`), Opacity/blend mode
- [ ] sekcja właściwości tekstu w panelu (rozmiar/waga/wyrównanie/line-height/letter-spacing) — dziś
      `TTextNode.fontSize`/`fontFamily` są ustawiane raz przy tworzeniu i nieedytowalne później;
      naturalnie łączy się z wyborem fontu z Etapu 9
- [ ] Start point / End point dropdowny dla zaznaczonej Line/Arrow — `TLineNode` ma już pola
      `startPoint`/`endPoint` (`'default' | 'arrow'`, patrz Etap 6/Arrow) gotowe pod te dwa
      dropdowny, brakuje tylko samego UI i podpięcia pod `updateNode`

## Etap 9 — Wiele fontów, atlas per font ładowany z serwera

**Świadomie odłożone do czasu, aż w apce pojawi się realny wybór/edycja fontu** (część Etapu 8 —
panel właściwości tekstu). Dziś jest jeden, zaszyty na sztywno font (Inter,
`TEXT_FONT_FAMILY`), więc jeden atlas wpieczony w bundle apki (`constant/webgl/msdfAtlas.ts`,
statyczny import `.json`/`.png`) ma sens — ale to się nie skaluje na realny wybór z wielu (docelowo
dziesiątek/setek) fontów, bo każdy dodatkowy font to +~150–300 KB bezwarunkowo wpieczone w build,
nawet jeśli user nigdy go nie użyje:

- [ ] atlasy fontów lecą na CDN/serwer, nie do repo apki i nie do bundla — generator (osobne repo,
      patrz niżej) produkuje `atlas.png`+`atlas.json` per font i wrzuca bezpośrednio na hosting,
      bez przechodzenia przez git tej apki
- [ ] ładowanie atlasu zamienia się ze statycznego importu na dynamiczne (`fetch` po wybranym
      `fontFamily`), dopiero gdy user faktycznie użyje danego fontu — `getOrLoadTexture.ts` już
      dziś umie ładować teksturę z dowolnego URL-a asynchronicznie (placeholder + podmiana po
      załadowaniu), ta część pipeline'u się nie zmienia, zmienia się tylko skąd bierze się URL
- [ ] cache per `fontFamily` (`Map<fontFamily, atlas>`) zamiast jednego globalnego atlasu
- [ ] manifest/katalog dostępnych fontów (nazwa → URL atlasu) do wyboru w panelu właściwości tekstu
- [ ] **generator atlasów przenosi się do osobnego repo** — dziś `msdf-bmfont-xml` +
      `npm run generate:font-atlas` + surowy TTF (`src/assets/fonts/inter/source/`) siedzą w
      xigma, co ma sens dla jednego fontu, ale nie skaluje się. Docelowo osobne repo trzyma tylko
      `charset.txt` per font (decyzje o zestawie znaków, kilkaset bajtów) + skrypt generujący, który
      ściąga TTF **na żądanie** z publicznego źródła (np. Google Fonts) zamiast trzymać binarki
      fontów w gicie na stałe

## Etap 10 — Dokończenie manipulacji node'ami

Kilka rzeczy świadomie odłożonych po drodze (Etap 5 i dalej), które dziś są jedyną realną
przeszkodą, żeby edycja pojedynczego node'a czuła się skończona, nie tylko "da się narysować":

- [x] **resize uchwytami** — 8 kierunków (4 rogi + 4 krawędzie, krawędzie tylko jako hit-test na
      linii obrysu, bez nowej grafiki), dla pojedynczego zaznaczonego node'a **i** dla grupy (2+,
      wspólny rodzic) — jeden wspólny wzorzec: resize zawsze liczy się względem origin bboxa
      (`getSelectionBounds` dla grupy, własne bounds node'a dla pojedynczego przypadku — kolapsuje
      do tego samego wzoru), każdy zaznaczony node (łącznie z `line` przez `x1/y1/x2/y2`) skaluje się
      proporcjonalnie do zmiany bboxa (`continueResizeDrag.ts`). Line pozostaje przy swoim
      istniejącym `armEndpointDrag`, gdy jest zaznaczony pojedynczo — resize nie nadpisuje tego
      mechanizmu. Shift na rogu = zachowanie proporcji (`getAspectRatioLockedRect`, ten sam
      mechanizm co aspect-lock w Media tool), świadomie **bez** locka na krawędziach.
      **Kursor resize.png musi się obracać** zależnie od kierunku uchwytu — pierwsze podejście
      (4 pre-zrotowane PNG-i) odrzucone na rzecz runtime canvas-rotation
      (`getRotatedResizeCursorUrl.ts`, mirror `x-design`'s `useChangeCursor/utils.ts` i xigmowego
      `createArmedCursor.ts`), właśnie po to, żeby nie rozsypać się, gdy `rotation` node'a (patrz
      niżej) stanie się kiedyś edytowalny — `getResizeCursorAngle.ts` już dziś dolicza
      `node.rotation` do kąta kursora dla pojedynczego node'a

      **Poprawka (po zgłoszeniu przez użytkownika, z zrzutami ekranu figmowego resize)**:
                                                                                                      `continueResizeDrag.ts` w ogóle nie czytał `rotation` node'a — anizotropowy resize
                                                                                                      (scaleX≠scaleY, np. przeciągnięcie krawędzi grupy tylko w poziomie) skalował `x/y/width/height`
                                                                                                      obróconego node'a tak, jakby były nieobróconymi współrzędnymi świata, więc "wzrost szerokości"
                                                                                                      w lokalnej przestrzeni node'a pokazywał się na ekranie jako wzrost w zupełnie innym kierunku niż
                                                                                                      przeciąganie użytkownika — obrócony node realnie wystawał poza wspólny bbox grupy zamiast się w
                                                                                                      nim mieścić. Świadomie **bez** shear'u (Figma w tym scenariuszu ścina zaznaczony obrócony
                                                                                                      element w parallelogram, niespójnie nawet między swoimi własnymi typami node'ów — do
                                                                                                      przemyślenia osobno, jeśli w ogóle). Zamiast tego: `TResizeNodeOrigin` (i `armResizeDrag.ts`)
                                                                                                      dostały migawkę `rotation` node'a z momentu złapania uchwytu, a `continueResizeDrag.ts` liczy
                                                                                                      teraz nową szerokość/wysokość przez rzut światowego wektora skali `(scaleX, scaleY)` na własne,
                                                                                                      obrócone osie node'a: `√((scaleX·cosθ)² + (scaleY·sinθ)²)` dla szerokości, analogicznie z
                                                                                                      sin/cos zamienionymi dla wysokości — środek node'a przesuwa się pełną transformacją grupy
                                                                                                      (`transformCoord` na środku zamiast na rogu bboxa), rotacja zostaje bez zmian. Przy θ=0 wzór
                                                                                                      matematycznie redukuje się dokładnie do starego zachowania (sprawdzone algebraicznie i
                                                                                                      testami — żaden z istniejących testów nie zmienił oczekiwanych wartości), więc nieobrócone
                                                                                                      node'y (i pojedynczy resize, i grupowy) zachowują się identycznie jak wcześniej. Node zawsze
                                                                                                      zostaje prawdziwym, nieściętym prostokątem — nie da się tego uniknąć bez shear'u, bo
                                                                                                      anizotropowe skalowanie obróconego kształtu w world space z definicji nie zachowuje kątów
                                                                                                      prostych (stąd świadomie przyjęta ta metoda, nie "poprawna" w sensie 1:1 z ruchem myszy, tylko
                                                                                                      najbliższe rozsądne przybliżenie bez ścinania). Zweryfikowane w przeglądarce (Playwright MCP):
                                                                                                      grupa dwóch prostokątów (jeden obrócony), rozciągnięta tylko poziomo — obrócony prostokąt teraz
                                                                                                      trzyma się w granicach wspólnego bboxa zamiast z niego wystawać

                                                                                                      **Trzecia poprawka (po kolejnym zgłoszeniu — "resize single obiektu nie działa")**: powyższa
                                                                                                      poprawka naprawiła tylko resize **grupy** z obróconym członkiem; pojedynczy zaznaczony obrócony
                                                                                                      node to zupełnie inny przypadek, źle zdiagnozowany przy okazji poprzedniej poprawki (oba testy
                                                                                                      jednostkowe "grupowe" miały tylko jeden wpis w `nodeOrigins`, więc w rzeczywistości sprawdzały
                                                                                                      właśnie tę ścieżkę, nie grupową — poprawione, patrz niżej). Dla pojedynczego node'a `bounds`
                                                                                                      przekazywane do `continueResizeDrag.ts` to **własny, nieobrócony lokalny box node'a**
                                                                                                      (`getNodeBounds`, ustawiane w `getResizeHandleAtPoint.ts`), nie world-space AABB grupy — a
                                                                                                      surowa pozycja kursora (`screenToWorld`) zostaje w world space, więc porównywanie jej
                                                                                                      bezpośrednio do lokalnego boxa nie miało sensu przy `rotation !== 0` (dokładnie ten sam problem,
                                                                                                      który hit-testing tego samego uchwytu już rozwiązywał inaczej — `getResizeHandleAtPoint.ts`
                                                                                                      odwrotnie obraca punkt kliknięcia przed testem, ale samo przeciąganie tego nie robiło).
                                                                                                      Naprawione przez wydzielenie tej sztuczki do współdzielonego
                                                                                                      `Canvas/utils/getUnrotatedQueryPoint.ts` (usunięty duplikat z `getResizeHandleAtPoint.ts`,
                                                                                                      zaimportowany też w `continueResizeDrag.ts`): gdy `nodeOrigins` ma dokładnie jeden wpis
                                                                                                      (nie-line) i jego `rotation !== 0`, surowy punkt myszy jest najpierw odwrotnie obracany wokół
                                                                                                      środka `bounds` — od tego momentu punkt i bounds są w tej samej, lokalnej przestrzeni node'a,
                                                                                                      więc cała reszta istniejącej matematyki (`computeResizedRect`, `getSignedScale`,
                                                                                                      `transformCoord`) działa poprawnie bez żadnych dalszych zmian. Efekt uboczny: skoro `scaleX`/
                                                                                                      `scaleY` są już policzone w lokalnej przestrzeni node'a (nie world), zastosowanie do nich
                                                                                                      wcześniejszego rzutu `getRotatedAxisScales` byłoby podwójną (błędną) transformacją — dla tego
                                                                                                      jednego przypadku szerokość/wysokość liczone są wprost z `|scaleX|`/`|scaleY|`, bez rzutowania.
                                                                                                      Zweryfikowane w przeglądarce (Playwright MCP): przeciągnięcie rogu obróconego prostokąta
                                                                                                      dokładnie wzdłuż jego własnej (obróconej) długiej krawędzi teraz poprawnie wydłuża kształt w
                                                                                                      tym samym kierunku, z przeciwległym rogiem zostającym nieruchomo jako kotwica — zamiast
                                                                                                      skakać w kierunku niezwiązanym z ruchem myszy

                                                                                                      **Czwarta poprawka (po zgłoszeniu "obrócony element nie robi mirror")**: żadna z
                                                                                                      poprzednich trzech poprawek nie dotykała samego **mirror/flip przy przekroczeniu kotwicy**
                                                                                                      na obróconym node'ie — dwa osobne, niezależne błędy w tej samej ścieżce. (1) Dla
                                                                                                      **grupy** z obróconym członkiem: flaga `flipX`/`flipY` liczyła się wprost ze znaku
                                                                                                      surowego `scaleX`/`scaleY` w układzie świata, ignorując rotację node'a — dokładnie ta
                                                                                                      sama klasa błędu, którą druga poprawka (wyżej) naprawiła dla width/height przez
                                                                                                      `getRotatedAxisScales`, tylko nigdy nie zaaplikowana do flip. Naprawione nową
                                                                                                      `getRotatedAxisSigns` (rzutuje `scaleX`/`scaleY` na lokalne osie obróconego node'a przez
                                                                                                      `scaleX·cos²θ + scaleY·sin²θ` dla X, symetrycznie dla Y) — używana zamiast surowego
                                                                                                      `scaleX`/`scaleY` przy liczeniu `flipX`/`flipY` dla członków grupy (pojedynczy obrócony
                                                                                                      node nadal używa surowego scale, bo tam `scaleX`/`scaleY` są już w jego własnej lokalnej
                                                                                                      przestrzeni po fixie z trzeciej poprawki — ponowne rzutowanie byłoby błędem). (2) Dla
                                                                                                      **pojedynczego** obróconego node'a, znacznie poważniejszy błąd: `getRotatedAnchorSolver`
                                                                                                      (dodany w trzeciej poprawce) zakładał, że róg-kotwica zawsze leży po tej samej stronie
                                                                                                      (względem środka) nowego prostokąta — założenie fałszywe, gdy przeciągnięcie faktycznie
                                                                                                      *przekracza* kotwicę, bo wtedy róg-kotwica fizycznie ląduje po przeciwnej stronie nowego
                                                                                                      (zmirrorowanego) prostokąta. Przy pełnym symetrycznym przekroczeniu (ten sam rozmiar,
                                                                                                      odbita pozycja) dawało to dokładnie oryginalny prostokąt z powrotem — czyli wizualnie
                                                                                                      **nic się nie działo**, dokładnie zgłoszony objaw. Naprawione: znak przesunięcia kotwicy
                                                                                                      (`crossedSignX`/`crossedSignY`) odwraca się per-oś, gdy dana oś faktycznie przekroczyła
                                                                                                      (`Math.sign(scaleX)`/`Math.sign(scaleY)` ujemny). Zweryfikowane przez pełny, prawdziwy
                                                                                                      łańcuch zdarzeń DOM (pointerdown→pointermove→pointerup, nie tylko bezpośrednie wywołanie
                                                                                                      `continueResizeDrag` — błąd żył w otoczeniu, którego bezpośrednie wywołanie nie
                                                                                                      wychwyciłoby) porównaniem zrzutów ekranu przed/po oraz z niezależnie zbudowanym
                                                                                                      prostokątem-referencją w tym samym miejscu; potwierdzone też, że test faktycznie łapie
                                                                                                      regresję (fail bez poprawki, pass z nią)

                                                                                                      **Piąta poprawka (po zgłoszeniu przez użytkownika — resize grupy z obróconym node'em nie
                                                                                                      ścinał się do zera i dryfował w wolnej osi)**: poprzednie dwie poprawki (wyżej) świadomie
                                                                                                      zachowywały obrócony node jako prawdziwy, nieścięty prostokąt przez rzut wektora skali na
                                                                                                      jego lokalne osie (`getRotatedAxisScales`/`getRotatedAxisSigns`, √((scaleX·cosθ)² +
                                                                                                      (scaleY·sinθ)²)) — matematycznie poprawne dla prawdziwej (ścinającej) transformacji, ale
                                                                                                      przy resizie tylko jednej osi grupy (np. uchwyt `e`, scaleY zamrożone na 1, bo Y w ogóle nie
                                                                                                      jest ruszane) ten sam wzór i tak przepuszczał kawałek "zamrożonej" osi w drugą, lokalną
                                                                                                      wymiarę node'a — przy θ=30° ciągnięcie do scaleX=0.09 dawało lokalną szerokość ×0.51
                                                                                                      (zamiast ×0.09, więc node nigdy nie dochodził do zera tak jak nieobrócony) i lokalną
                                                                                                      wysokość ×0.87 mimo że oś Y w ogóle nie była częścią gestu — ta niechciana zmiana wysokości
                                                                                                      zmuszała kod do przesuwania pozycji Y, mimo że przy czysto poziomym resize nic w Y nie
                                                                                                      powinno się ruszyć. Naprawione zamianą płynnego trygonometrycznego blendu na twardy próg
                                                                                                      dominującej osi: nowy `isRotationAxisSwapped.ts` (`|sin θ| > |cos θ|`) decyduje, czy lokalna
                                                                                                      oś X/Y node'a jest bliżej world-X czy world-Y, a
                                                                                                      `getRotatedAxisScales`/`getRotatedAxisSigns` na tej podstawie przepuszczają
                                                                                                      `scaleX`/`scaleY` **wprost**, bez rzutowania — więc na swojej dominującej osi obrócony node
                                                                                                      skaluje się identycznie jak nieobrócony (w tym do zera), a wolna oś (scale=1) zostaje
                                                                                                      całkowicie nietknięta, bez żadnego driftu pozycji. Przy dokładnie 90° zachowanie to nadal
                                                                                                      pełny swap (bez zmian, testy przeszły bez modyfikacji), przy 0° to no-op jak zawsze.
                                                                                                      Świadomy kompromis: przy rotacjach blisko 45° nie ma już płynnego przejścia (twardy próg
                                                                                                      zamiast blendu) — zaakceptowane na żądanie użytkownika, bo "ścina się do zera jak
                                                                                                      nieobrócony" było ważniejsze niż ciągłość na granicy 45°. Zweryfikowane end-to-end w
                                                                                                      `continueResizeDrag.spec.ts` (30° node w grupowym resize tylko-w-X: szerokość skaluje się z
                                                                                                      scaleX, wysokość i pozycja zostają dokładnie bez zmian — identycznie jak dla nieobróconego
                                                                                                      node'a na tej samej ścieżce), 100% pokrycie testów utrzymane

- [x] **mirror/flip przy przejściu przez zero podczas resize** — `computeResizedRect.ts` przestał
      clampować asymetrycznie do `MIN_SHAPE_SIZE`; przeciągnięcie uchwytu "przez" przeciwległy
      róg/krawędź teraz mirror'uje bbox zamiast utykać na minimalnym rozmiarze (punkt zakotwiczenia
      zostaje na miejscu, kształt rośnie po drugiej stronie). `continueResizeDrag.ts` liczy **signed
      scale** względem anchora (środek origin-bboxa vs środek nowego bboxa po tej samej stronie
      anchora = dodatni scale, po przeciwnej = ujemny) — to jest to, co odróżnia prawdziwy mirror
      grupy od zwykłego skalowania: node'y w grupie **zamieniają się kolejnością** wokół anchora, nie
      tylko skalują się w miejscu. Przy resize po skosie mirror X i Y liczone są niezależnie per oś
      (`getResizeAxisAnchors.ts`, wspólne źródło prawdy dla anchora per oś, reużyte też przez
      uproszczony `getResizeAnchorPoint.ts`). Dla Rectangle/Ellipse/Frame mirror jest wizualnie
      tożsamy ze zwykłą normalizacją bboxa (kształt symetryczny) — samo to już wystarcza. **Media,
      Text, Polygon i Star dostały realny flip treści**: odpowiednie node'y mają `flipX`/`flipY`
      (required, jak `rotation`), przełączane w `continueResizeDrag.ts` jako XOR względem stanu z
      początku przeciągnięcia (`origin.flip.x !== (scaleX < 0)`), więc cofnięcie kursora z powrotem
      przez anchor w tym samym drag'u poprawnie przywraca stan sprzed przeciągnięcia. Media: UV flip
      w `drawImage.ts` (zamiana u/v zamiast pozycji quada — dla jednego prostokąta to identyczny
      wynik wizualny, prościej niż ruszanie geometrii). Text: geometryczny mirror całej złożonej
      siatki glifów wokół środka node'a (`flipGlyphVertices.ts`, pozycje odbite, UV bez zmian) —
      sztywna geometria po odbiciu automatycznie mirror'uje i kształt liter, i ich kolejność (efekt
      trzymania tekstu przy lustrze), stosowane **po** `getOrBuildTextGeometry` więc cache geometrii
      zostaje kanoniczny/nieodbity. Zweryfikowane manualnie w przeglądarce (Playwright MCP +
      własnoręcznie przez użytkownika): box faktycznie rośnie po drugiej stronie anchora zamiast
      utykać, umieszczony obrazek faktycznie się odbija (nie tylko jego bbox), a tekst renderuje się
      lustrzanie.

      **Poprawka (Etap 10, po zgłoszeniu przez użytkownika)**: pierwotne założenie "Polygon/Star są
                                                                                                                                  wystarczająco symetryczne" okazało się błędne — trójkąt (domyślne 3 boki) i domyślna 5-ramienna
                                                                                                                                  gwiazda **nie** mają symetrii odbicia względem osi poziomej (nieparzysta liczba boków/ramion),
                                                                                                                                  więc renderowanie zawsze tego samego, kanonicznego układu wierzchołków z `getPolygonPoints`/
                                                                                                                                  `getStarPoints` (niezależnego od kierunku przeciągnięcia) dawało wizualnie identyczny kształt
                                                                                                                                  mimo "zmirrorowanego" bboxa. Naprawione tym samym mechanizmem co Media/Text: `TPolygonNode`/
                                                                                                                                  `TStarNode` też dostały `flipX`/`flipY`, nowy współdzielony prymityw `utils/math/flipPoint.ts`
                                                                                                                                  (odbicie punktu względem środka) aplikowany jako krok **przed** rotacją w `drawPolygon.ts`/
                                                                                                                                  `drawStar.ts`/`drawThickPolygonOutline.ts`/`drawThickStarOutline.ts` (ten sam porządek co Text:
                                                                                                                                  flip, potem rotate), hit-testing (`isPointInPolygon.ts`/`isPointInStar.ts`) odwrotnie odbija
                                                                                                                                  punkt zapytania przed testem, tym samym trikiem co `isPointInText.ts`. Zweryfikowane manualnie:
                                                                                                                                  trójkąt faktycznie odwraca się z wierzchołkiem w górę na wierzchołek w dół, a gwiazda zmienia
                                                                                                                                  orientację ramion (nie tylko pozycję bboxa)

- [x] **rotacja** — `rotation` siedział w `TBaseNode` od Etapu 2, ale nic go nigdy nie ustawiało ani
      nie uwzględniało w renderingu/hit-testingu. Rotacja jest CPU-side post-processingiem już
      policzonych punktów (ten sam wzorzec co świeżo wdrożony mirror/flip, `flipGlyphVertices.ts`),
      **nie** shaderowa — bo jest statyczna dopóki użytkownik jej nie zmieni, w przeciwieństwie do
      pan/zoom (Etap 4, świadomie GPU-side, bo leci co klatkę). Wspólny prymityw
      `rotatePoint(point, center, degrees)` (`utils/math/rotatePoint.ts`) aplikowany jako ostatni krok
      w każdym `draw*.ts` (rogi `drawRect`/`drawCornerHandles`, punkty generatorów kształtów
      `drawEllipse`/`drawPolygon`/`drawStar` — rotacja musi być post-transformem na gotowym `(x, y)`,
      nie modyfikacją `angle` w generatorach, bo przy `radiusX !== radiusY` dałoby to inny kształt).
      Dla Media/Text (stride-4 `[x, y, u, v]` bufory) nowy `utils/canvas/rotateVertices.ts`; dla Text
      komponuje się z istniejącym flipem (`rotateVertices(flipGlyphVertices(...), center,
node.rotation)` w `drawMsdfText.ts`).

      **Hit-testing**: zamiast dotykać `isPointInRect/Ellipse/Polygon/Star/Text`, `getNodeAtPoint.ts`
                                                                                                                                      raz odwrotnie obraca punkt kliknięcia wokół środka node'a przed dispatchem do niezmienionych
                                                                                                                                      funkcji testujących — ten sam trik co przy flipie w `isPointInText.ts`. Ta sama zasada dla
                                                                                                                                      uchwytów resize (`getResizeHandleAtPoint.ts`) i dla drag zaznaczonego, obróconego tekstu
                                                                                                                                      (`isPointInSelectedTextBounds.ts`). Marquee i wspólny bbox grupy (`getCollidedNodes.ts`,
                                                                                                                                      `getSelectionBounds.ts`) przeszły z surowego `getNodeBounds.ts` na nowy
                                                                                                                                      `getRotatedNodeBounds.ts` (axis-aligned bbox obróconych rogów) — bo dla obróconego node'a
                                                                                                                                      surowy bbox przestaje być jego prawdziwym, widocznym zasięgiem.

                                                                                                                                      **Uchwyty resize też się obracają** — pozycja i orientacja nadążają za `rotation` pojedynczego
                                                                                                                                      zaznaczonego node'a (samo przeciąganie resize zostaje w world space, świadomy kompromis). Nowy
                                                                                                                                      uchwyt rotacji to pierścień tuż poza promieniem resize (`ROTATE_HANDLE_OUTER_RADIUS_PX`,
                                                                                                                                      `getRotateHandleAtPoint.ts`), jawnie wykluczający punkty wewnątrz bboxa node'a, żeby zwykły
                                                                                                                                      klik/drag blisko rogu nie został przechwycony przez rotację. Kursor `rotate.png` obraca się tym
                                                                                                                                      samym mechanizmem co `resize.png`, wydzielonym do współdzielonej fabryki
                                                                                                                                      `createCursorRotator.ts` (`getRotateCursorAngle.ts` liczy kąt na podstawie ćwiartki lokalnej
                                                                                                                                      przestrzeni node'a, skalibrowany tak, że róg "ne" nieobróconego node'a odpowiada 0°, każdy
                                                                                                                                      kolejny róg zgodnie z ruchem wskazówek zegara +90°). Kąt kursora nie jest liczony tylko raz przy
                                                                                                                                      złapaniu uchwytu — `continueRotateDrag.ts` przelicza go na każdy `pointermove`
                                                                                                                                      (`cursorAngle + deltaDegrees`, oba zapamiętane w `TRotateDragState` przy arm) i na bieżąco
                                                                                                                                      podmienia `canvas.style.cursor`, więc ikona wizualnie obraca się razem z node'em przez cały
                                                                                                                                      czas trwania przeciągnięcia, nie tylko na starcie i końcu.

                                                                                                                                      **Rotacja działa dla pojedynczego node'a i dla grupy** — grupa nie ma własnego, persystowanego
                                                                                                                                      `rotation`; to transient operacja per-drag: każdy człon dostaje `+= deltaDegrees` do własnej
                                                                                                                                      `rotation`, a jego środek okrąża wspólny środek grupy o ten sam kąt (`continueRotateDrag.ts`).
                                                                                                                                      Dla pojedynczego node'a pivot === środek node'a, więc formuła automatycznie kolapsuje do
                                                                                                                                      "pozycja bez zmian, tylko `rotation`" — bez osobnej ścieżki kodu, ten sam trik co przy resize.
                                                                                                                                      `line` (bez pola `rotation`) rotuje tylko jako część grupy, przez własne punkty `x1/y1/x2/y2`.
                                                                                                                                      Zweryfikowane manualnie w przeglądarce (Playwright MCP): pojedynczy kwadrat wizualnie się
                                                                                                                                      obraca wraz z uchwytami, kliknięcie w róg obróconego kształtu (poza jego oryginalnym,
                                                                                                                                      nieobróconym bboxem) trafia poprawnie, a rotacja grupy dwóch node'ów pokazuje każdy człon
                                                                                                                                      okrążający wspólny środek i obracający się indywidualnie

- [x] **dwuklik, żeby wejść w edycję istniejącego tekstu** — do tej pory edycja była osiągalna
      tylko przy świeżo rysowanym tekstem; nie było ścieżki z powrotem z gotowego `TTextNode` do
      trybu `contentEditable` (`editingTextBox` nie niosło tożsamości node'a, więc
      `useCommitTextEdit.ts` zawsze wołał `addNode`, nigdy `updateNode`). Zachowanie z Figmy: dwuklik
      w node tekstowy — zaznaczony albo nie — wchodzi w edycję z całą istniejącą treścią zaznaczoną,
      więc pisanie od razu ją zastępuje. `editingTextBox`/`editingTextContent` dostały siostrzane pole
      `editingNodeId` (`store/design/types.ts`), ustawiane przez nowy `useTextEditOnDoubleClick.ts`
      (zwykły listener `dblclick`, aktywny tylko przy domyślnym narzędziu), który hit-testuje przez tę
      samą warstwę "precyzyjny hit w glif, albo cały box gdy to już jedyne zaznaczenie", co istniejący
      `handlePointerDown.ts` (`getDoubleClickedTextNode.ts`, reużywa bez zmian `getNodeAtPoint.ts` i
      `isPointInSelectedTextBounds.ts`). `TextEditOverlay.tsx` zasiewa początkową treść DOM-u
      `contentEditable` z istniejącego `content` node'a (`setEditableTextContent.ts`, odwrotność
      istniejącego `getEditableTextContent.ts`) i zaznacza całość przez `window.getSelection()`/`Range`
      (`selectEditableTextContent.ts`) — obie operacje odpalają się raz na sesję edycji, bramkowane
      tożsamością `box`/`editingNodeId` przez snapshot w refie, nie na każdą aktualizację
      `editingTextContent` przy wpisywaniu (`useSeedEditableTextOnEntry.ts`). `useCommitTextEdit.ts`
      teraz rozgałęzia się po `editingNodeId`: `updateNode({ changes: { content } })` dla istniejącego
      node'a zamiast `addNode` — a że w tym kodzie nie ma jeszcze akcji usuwania node'a, wyczyszczenie
      całej treści i blur po prostu porzuca edycję (oryginalna treść node'a zostaje nietknięta) zamiast
      tworzyć pusty/osierocony node. Podczas edycji `drawScene.ts` filtruje edytowany node z normalnych
      przebiegów renderujących (fill/selekcja/hover) po id, więc żywy overlay `contentEditable` i jego
      własny outline z `drawEditingText.ts` są jedyną reprezentacją na ekranie — inaczej pod spodem
      renderowałyby się nieaktualne, statyczne glify. Zweryfikowane w e2e (`edit-text.spec.ts`) przez
      porównanie pikseli ze zbudowanym od zera referencyjnym renderem tej samej treści — zgodność
      pikseli trzyma się tylko, jeśli edycja realnie zastąpiła (nie dopisała) i zaktualizowała w
      miejscu (nie zduplikowała)

      **Poprawka (po zgłoszeniu przez użytkownika, ze zrzutem ekranu)**: edycja obróconego/zmirrorowanego
                                                                                                                          tekstu renderowała DOM-owy `contentEditable` i canvas'owy `drawEditingText.ts` zawsze przy
                                                                                                                          `rotation: 0`/`flipX/Y: false`, niezależnie od realnej transformacji edytowanego node'a — efekt to
                                                                                                                          widoczny na zrzucie duch nieobróconego, podświetlonego tekstu nałożony na wciąż poprawnie obrócony
                                                                                                                          outline zaznaczenia. `TEditingTextBox` (`types/canvas.ts`) dostał własne `flipX`/`flipY`/`rotation`
                                                                                                                          obok istniejącego `x/y/width/height` — ten sam kształt co geometria node'a — wypełniane realną
                                                                                                                          wartością node'a w `useTextEditOnDoubleClick.ts` (zamiast zer przy zwykłym rysowaniu nowego tekstu
                                                                                                                          w `useDrawTextTool.ts`, gdzie zera są jak najbardziej poprawne, bo nowy tekst na razie zawsze
                                                                                                                          powstaje nieobrócony). `drawEditingText.ts` przekazuje te pola dalej do `drawRect`/`drawMsdfText`
                                                                                                                          zamiast hardkodowanych stałych, więc canvasowy outline/tekst podczas edycji obraca/mirroruje się
                                                                                                                          tym samym mechanizmem co reszta node'ów. DOM-owy `TextEditOverlay.tsx` dostał
                                                                                                                          `transform: rotate(${box.rotation}deg) scaleX(...) scaleY(...)` z `transformOrigin: 'center'` —
                                                                                                                          **flip w środku, potem rotacja na zewnątrz** w liście `transform`, bo CSS aplikuje transformacje od
                                                                                                                          prawej do lewej (ten sam porządek co canvas: `flipGlyphVertices` przed `rotateVertices`). Rotacja
                                                                                                                          wokół `transformOrigin: center` w screen-space jest matematycznie tożsama z obrotem wokół środka w
                                                                                                                          world-space, bo `worldToScreen` to jednorodne skalowanie (zoom) + przesunięcie — obrót komutuje z
                                                                                                                          jednorodnym skalowaniem niezależnie od kolejności. `useCommitTextEdit.ts` przy okazji przestał
                                                                                                                          hardkodować `flipX: false, flipY: false, rotation: 0` dla świeżo tworzonego node'a — bierze je teraz
                                                                                                                          z `box`, gotowe pod przyszły scenariusz "tekst rysowany wewnątrz obróconej ramki" (dziś realne
                                                                                                                          zagnieżdżanie w ramkach jeszcze nie istnieje, patrz Etap 12, więc `box` zawsze niesie zera przy
                                                                                                                          zwykłym rysowaniu — ale ścieżka danych jest już gotowa, nie trzeba będzie jej przerabiać).
                                                                                                                          Zweryfikowane w przeglądarce (Playwright MCP): obrócony o 30° tekst wchodzi w edycję z DOM-owym
                                                                                                                          overlayem wizualnie pokrywającym się z rotowanym outline'em zaznaczenia, zamiast zostawać poziomym
                                                                                                                          duchem, a zamiana treści w trakcie edycji zachowuje tę samą rotację po zatwierdzeniu

                                                                                                              **Druga poprawka (po kolejnym zgłoszeniu, z DevTools obu aplikacji)**: powyższy `transform:
                                                                                                              rotate()` na diva rozwiązywał *widoczny* problem, ale nie prawdziwą przyczynę — CSS `rotate()`
                                                                                                              to czysto wizualny efekt, który nie wpływa na wewnętrzny layout tekstu przeglądarki (zawijanie
                                                                                                              linii, kerning). Nasz canvas wylicza layout ręcznie, bez kerningu (`buildGlyphQuads.ts`,
                                                                                                              `measureGlyphTextWidth.ts` — atlas ma 1345 par kerningu, nigdy nieużywanych), więc natywne
                                                                                                              zaznaczenie/kursor przeglądarki (pozycjonowane przez jej własny, inny layout) i tak drobno
                                                                                                              rozjeżdżały się z renderowanymi glifami MSDF — przy rotacji ten drobny rozjazd zamieniał się w
                                                                                                              widoczny, po skosie zdublowany tekst. Użytkownik znalazł w DevTools, że prawdziwa Figma w ogóle
                                                                                                              nie obraca swojego ukrytego diva (`<input>` ma nawet `top: -200px`, świadomie zepchnięty poza
                                                                                                              ekran) — zamiast tego rysuje kursor/zaznaczenie własnym silnikiem, tak samo jak tekst.
                                                                                                              Przepisane na ten sam wzorzec: `TextEditOverlay.tsx` **stracił** `transform`/`transformOrigin` na
                                                                                                              zawsze (div zostaje nieobrócony), `caretColor` zmienione z `TEXT_FILL` na `transparent`, i doszło
                                                                                                              `&::selection { background-color: transparent }` w SCSS — div jest teraz czysto niewidzialną
                                                                                                              powierzchnią do przechwytywania klawiatury/IME, zero własnej reprezentacji wizualnej. Kursor i
                                                                                                              zaznaczenie rysowane są teraz na canvasie (`drawEditingCaretAndSelection.ts`, nowy plik wołany z
                                                                                                              `drawEditingText.ts`) tym samym prymitywem `drawRect.ts` co obrys edycji, przeliczane z
                                                                                                              dokładnie tej samej matematyki co widoczne glify — nowy `wrapTextWithOffsets.ts` (siostrzana
                                                                                                              kopia `wrapText.ts`, ale zamiast samych stringów zwraca też offset każdej linii w oryginalnym
                                                                                                              tekście — świadomy kompromis: duplikacja zamiast refaktoru już przetestowanego `wrapText.ts`,
                                                                                                              żeby nie ryzykować regresji w kodzie renderującym), `findLineIndexForOffset.ts`, `getCaretPoint.ts`
                                                                                                              i `getSelectionRects.ts` (offset → world-space punkt/prostokąty, ten sam brak kerningu co
                                                                                                              `measureGlyphTextWidth`, więc kursor **z definicji** nie może rozjechać się z glifami — liczy je
                                                                                                              ta sama funkcja). Selekcja śledzona jest teraz w Reduxie jako `editingSelectionStart/End`
                                                                                                              (offsety znakowe w tym samym stringu co `editingTextContent`), aktualizowane przez nowy hook
                                                                                                              `useTrackTextEditSelection.ts` (`onSelect`) i przy okazji w `useTextEditInput.ts` (`onInput`) —
                                                                                                              czytane z natywnego `window.getSelection()` przez nowy `getEditableSelectionOffsets.ts`, który
                                                                                                              zamiast ręcznie powtarzać chodzenie po `childNodes` (ryzyko rozjazdu z `getEditableTextContent.ts`)
                                                                                                              klonuje `Range` od początku diva do granicy zaznaczenia i puszcza wynik przez **ten sam**
                                                                                                              `getEditableTextContent.ts` — offset to po prostu długość sklonowanego tekstu, gwarantowanie
                                                                                                              spójny z resztą pipeline'u. Ponieważ kursor/zaznaczenie to teraz małe prostokąty *wewnątrz* boxa
                                                                                                              edytowanego tekstu (nie sam box), `drawRect.ts` dostał opcjonalny param `rotationCenter` (domyślnie
                                                                                                              środek własny rect'a, jak dotąd) — bez niego obrót działby się wokół środka samego kursora, a nie
                                                                                                              środka całego node'a, więc kursor obracałby się w miejscu zamiast okrążać razem z tekstem. Flip
                                                                                                              aplikowany ręcznie (ten sam trik co `flipTextPoint`, wydzielony typ `TFlippableBox` żeby nie
                                                                                                              wymagać pełnego `TTextNode`) **przed** rotacją, ten sam porządek co `drawMsdfText.ts`. Kursor
                                                                                                              rysowany jest kolorem `TEXT_FILL` — tym samym co glify, nie akcentowym niebieskim zaznaczenia
                                                                                                              — więc gdy kiedyś dojdzie edycja koloru tekstu w środku (dziś jeden `fill` na cały node), oba
                                                                                                              mają wspólne źródło prawdy i nie da się ich rozjechać. Miganie liczone jest z offsetu
                                                                                                              `editingSelectionChangedAt` (nowe pole w Reduxie, stemplowane `Date.now()` w każdym
                                                                                                              `startTextEdit`/`updateTextEditSelection`) zamiast surowego `Date.now() % interval` — kursor
                                                                                                              jest w pełni widoczny (bez migania) przez pierwszy pełny interwał od ostatniej zmiany
                                                                                                              zaznaczenia/pozycji, dokładnie tak jak w realnych edytorach, gdzie pisanie czy przesuwanie
                                                                                                              kursora nie miga, tylko migotanie zaczyna się dopiero po chwili bezruchu. Bez dodatkowego stanu
                                                                                                              w Reakcie — liczone na nowo w każdej klatce render loopa, tylko względem tego jednego
                                                                                                              znacznika czasu w Reduxie. **Świadomie odłożone**: kliknięcie myszą *wewnątrz*
                                                                                                              już otwartej edycji obróconego node'a, żeby przestawić kursor w konkretne miejsce, dziś nie
                                                                                                              działa poprawnie (div jest nieobrócony, więc jego niewidzialny hit-region nie pokrywa się z
                                                                                                              widocznymi, obróconymi glifami) — strzałki klawiszowe i samo pisanie działają bez zmian (nie
                                                                                                              zależą od zgodności pikseli), a naprawa kliknięcia wymagałaby osobnego, canvasowego hit-testu
                                                                                                              offsetu znaku (na wzór `getUnrotatedQueryPoint` z `getNodeAtPoint.ts`) plus programowego
                                                                                                              ustawienia `Range`/`Selection` — osobny, następny krok. Zweryfikowane w przeglądarce (Playwright
                                                                                                              MCP): zaznaczenie „select all" na obróconym tekście dokładnie pokrywa renderowane litery bez
                                                                                                              śladu ducha z poprzedniej wersji, a podmiana treści w trakcie edycji nadal poprawnie zachowuje
                                                                                                              rotację po zatwierdzeniu

- [x] **corner radius dla Rectangle** — `TRectangleNode.cornerRadius?: number` (opcjonalne, ten sam
      wzorzec co `TLineNode.startPoint/endPoint` z Arrow), ustawiane wyłącznie przez 4 przeciągane
      uchwyty na rogach — panel boczny z polem liczbowym to świadomie osobny, późniejszy krok.
      Uchwyty pokazują się tylko gdy node jest **jednocześnie** zaznaczony i pod kursorem (inaczej
      niż stałe kwadraciki resize, które pokazują się na samym zaznaczeniu), i tylko gdy kształt
      renderuje się na tyle duży na ekranie, żeby miało to sens
      (`shouldShowCornerRadiusHandles.ts`, próg `MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX`,
      figmowe "za mały, nie pokazujemy"). Przeciąganie liczy promień z bezwzględnej pozycji kursora
      względem złapanego rogu (`max(inset poziomy, inset pionowy)`), świadomie **bez** wymogu ruchu
      po skosie — sama oś pozioma albo sama pionowa wystarczy, żeby dojść do maksimum
      (`min(width, height) / 2`). Najtrudniejszy przypadek: gdy promień zbliża się do maksimum,
      uchwyty kilku rogów zbiegają się w jednym (albo tym samym) punkcie (dokładnie w jednym dla
      kwadratu, parami dla prostokąta) — które trafienie wybrać, rozstrzyga dopiero **kierunek
      pierwszego realnego ruchu** myszką po złapaniu, licząc iloczyn skalarny względem własnego
      kierunku "do rogu" każdego kandydata (`resolveCornerFromDirection.ts`); remis (np. ruch czysto
      poziomy dla pary różniącej się tylko pionowo) świadomie zostaje nierozstrzygnięty, czeka na
      bardziej jednoznaczny ruch zamiast zgadywać. Przy `cornerRadius === 0` uchwyt resize zawsze
      wygrywa remis trafienia w ten sam punkt (priorytet w `handlePointerDown.ts`). Zaokrąglanie
      przy renderze (`drawRect/drawRoundedRect.ts`, wachlarz trójkątów z `getRoundedRectPoints.ts`,
      ten sam kształt co `drawEllipse.ts`) i sam `drawRect.ts` zostały rozbite na osobny folder
      (`utils/canvas/drawRect/`) z dyspozytorem plus jednym plikiem na ścieżkę renderowania —
      oryginalna, płaska ścieżka rysowania (`drawStandardRect.ts`) zostaje bit-identyczna, więc
      ~15 niepowiązanych wywołujących (marquee, uchwyty resize, obrysy hover/selekcji, draft
      shape'y...) nigdy nie widzi pola `cornerRadius`. Pełny opis mechanizmu:
      `.claude/docs/selection-and-manipulation.md` §11
- [x] **corner radius dla Polygon i Star** — jeden wspólny promień (`TPolygonNode.cornerRadius?:
      number` / `TStarNode.cornerRadius?: number`, ten sam opcjonalny wzorzec co Rectangle)
      zaokrąglający **każdy** wierzchołek jednakowo, w przeciwieństwie do 4 niezależnych rogów
      Rectangle — stąd jeden przeciągany uchwyt na stałym "górnym" wierzchołku
      (`getPolygonPoints`/`getStarPoints`'a indeks 0), nie cztery. Star dodatkowo zaokrągla
      wierzchołki wklęsłe (doliny między ramionami), nie tylko wypukłe czubki — ta sama funkcja
      stycznego łuku (`getRoundedVertexPoints.ts`) działa na obu bez rozróżnienia convex/concave,
      bo kierunek dwusiecznej wynika sam z geometrii wektorów, bez żadnej gałęzi warunkowej.
      Matematyka kątów wierzchołków (`getVertexAngles.ts`) i maksymalnego promienia
      (`getMaxCornerRadiusForVertices.ts`) jest teraz współdzielona między Polygon i Star (Rectangle
      zostaje osobno — przypadek 90° jest prostszy, nie warto uogólniać). Najtrudniejszy błąd po
      drodze: pozycja uchwytu **nie** jest przesunięciem o `cornerRadius` wprost — to działa
      przypadkiem tylko dla Rectangle, bo kąt tam zawsze wynosi 90°. Dla dowolnego kąta trzeba
      przeskalować promień mnożnikiem `1/sin(kąt/2)` (`getCornerRadiusHandleSetbackMultiplier.ts`),
      żeby uchwyt trafiał w środek łuku zaokrąglenia (dokładnie tam, gdzie siedzi uchwyt Rectangle),
      a nie w najbliższy punkt na samym obrysie — bez tego uchwyt wizualnie "lgnie" do kształtu
      zamiast być od niego odsunięty jak w Figmie, tym bardziej przy małym promieniu. Pełny opis
      mechanizmu i tej pułapki: `.claude/docs/selection-and-manipulation.md` §12, §15-16
- [x] **wycinanie fragmentu elipsy — Sweep/Start/Ratio, jeden do jednego z narzędziem Arc w
      Figmie** — trzy uchwyty na zaznaczonej i najechanej Ellipse. **Sweep** (`arcEndAngle`, na
      obwodzie) przeciąga wycięcie w kształt. **Start** (`arcStartAngle`, też na obwodzie, odróżniony
      od Sweep tylko kropką w środku uchwytu) obraca całe wycięcie, zachowując jego szerokość — jego
      arm/continue/disarm istniały od wcześniejszej sesji, ale nigdzie nie były podpięte
      (`handlePointerDown/Move/Up.ts`, `useHoverHighlight.ts`), więc przeciąganie nic nie robiło i nie
      pokazywał się żaden kursor. **Ratio** (`arcRatio`, w spoczynku siedzi w środku) wydrąża kształt w
      pierścień; przeciągnięty poza własną granicę kątową kształtu, w wycięty fragment, `arcRatioInverted`
      zamienia który z dwóch klinów liczy się jako wypełniony — dokładnie zachowanie Figmy przy
      przeciąganiu uchwytu Ratio w wycięty kawałek. Matematyka bazuje na `getEllipseArcMajorArc`
      (istniejącej wcześniej funkcji rozwiązującej "ile wycięto" na "co faktycznie wypełnione", ze
      świadomie nigdy nie zawijanym kątem — pełny obrót to wycięcie całości, drugi pełny obrót
      przywraca) oraz na nowym `getEffectiveArcAngles`, który przy inwersji podaje już rozwiązany
      `majorStart`/`majorStart + majorSweep` z powrotem do tej samej funkcji — to jedyna para wejściowa,
      której własne rozwiązanie jest dokładnie dopełnieniem oryginalnego wycinka, więc dopełnienie nigdy
      nie zostało napisane ręcznie. Wypełnienie pierścienia to `gl.TRIANGLE_STRIP` między zewnętrznymi i
      wewnętrznymi punktami zamiast zwykłego `gl.TRIANGLE_FAN` ze środka (środek leży poza wypełnieniem,
      gdy jest dziura); ten sam podział zewnętrzny/wewnętrzny powtarza się w obrysie hover i w
      hit-teście. Przy `arcRatio` sięgającym maksimum (1) wypełnienie zapada się do zera, więc
      `drawEllipseArcRatioGuideArc` rysuje zapadniętą granicę jako krzywą — krzywy odpowiednik istniejącej
      prostej linii pomocniczej dla w pełni wyciętego kształtu. Uchwyty Sweep/Start podczas przeciągania
      są teraz ograniczone do pasma pierścienia (wewnętrzny promień → zewnętrzny), zamiast ślizgać się od
      samego środka, gdy `arcRatio > 0`. Pełny opis mechanizmu: `.claude/docs/selection-and-manipulation.md`
      §19
- [x] **uchwyt Ratio dla Star** — trzeci i ostatni uchwyt Star, obok corner radius (wierzchołek 0) i
      vertex-count (wierzchołek 2): siedzi na wierzchołku 1, wklęsłym punkcie fizycznie pomiędzy tamtymi
      dwoma na obrysie, i przeciąga pole `ratio` (ułamek promienia wewnętrznego do zewnętrznego,
      `STAR_MIN_RATIO`–`STAR_MAX_RATIO` = 0.001–1), które `getStarPoints` znało od zawsze, ale nic go
      dotąd nie zmieniało po utworzeniu node'a (ustawiane raz, na stałe, przy rysowaniu). Pozycja
      spoczynkowa to dosłownie ten sam współdzielony `getVertexCountHandlePositionFromVertices` co
      uchwyt vertex-count, tylko dla indeksu 1 zamiast 2 — więc od razu dziedziczy poprawkę "trzyma się
      punktu" po zaokrągleniu rogów, bez powtarzania jej. Samo przeciąganie to jednak inna matematyka niż
      snapowanie kątowe vertex-count: rzut skalarny na stałą oś od środka do własnej "kotwicy" wierzchołka
      1 przy `ratio = 1` (pełne rozwinięcie, bez wcięcia) — kąt tej kotwicy zależy tylko od `points`, nigdy
      od `ratio`, więc oś jest stabilna przez cały drag, a `t = rzut / |kotwica|` po prostu przycięty do
      zakresu min/max (`getRatioFromLocalPoint.ts`), bez zaokrąglania do liczby całkowitej — `ratio` to
      ciągły ułamek, nie dyskretna wartość jak `points`/`cornerRadius`. Nowy kursor `ratio.png` (nie
      recykling `radius.png`, którego używa Ratio na Ellipse). Pełny opis mechanizmu:
      `.claude/docs/selection-and-manipulation.md` §20
- [x] **Delete/Backspace** (usuń zaznaczenie) — zbudowane przy okazji Vector Edit Mode
      (`.claude/docs/vector-network.md` §6), gdzie było potrzebne do usuwania wierzchołków. Nowy hook
      `Canvas/hooks/useDeleteShortcut/` (nie `useToolbarShortcuts`, bo potrzebuje
      `refs.selectedVectorVertexIdsRef`, niedostępnego z poziomu `DesignPage`): z zaznaczonym
      wierzchołkiem Vector Network usuwa tylko jego (+ przyległe segmenty), inaczej usuwa cały
      zaznaczony node/node'y — pierwsza "usuń zaznaczenie" funkcjonalność w apce w ogóle.
- [ ] **pozostałe skróty edycji**: Cmd/Ctrl+D (duplikuj), Cmd/Ctrl+C/V (kopiuj/wklej), strzałki
      (nudge o 1px, Shift+strzałka o 10px), Cmd/Ctrl+A (zaznacz wszystko) — wciąż nie istnieją
- [ ] **zoom ze skrótów klawiszowych** — Cmd/Ctrl +/− (zoom in/out o krok), Shift+0 (zoom to 100%),
      Shift+1 (zoom to fit), Shift+2 (zoom to selection) — dziś zoom działa tylko przez
      scroll/pinch (Etap 4)

## Etap 11 — Undo / redo

- [x] **zbudowane jako fundament pod Pen Tool / Vector Network** (Etap 6) — bez tego operacje na
      wierzchołkach/uchwytach nie miałyby żadnego Ctrl+Z. Podejście: **snapshoty**
      (`{ nodes, rootOrder, selectedIds }`, świadomie węższe niż cały `TDesignState` — viewport/tool/
      komentarze/sesja Pen tool to stan UI, nie dokumentu), nie command-stack z odwrotnymi akcjami.
      Nowy plain `Middleware` (`store/history/historyMiddleware.ts`, fabryka, nie singleton — każdy
      store dostaje własny `past`/`future`), **nie** `redux-undo`-style wrapper reducera (to zmieniłoby
      kształt `state.design.*` na `state.design.present.*` i dotknęło każdy selektor w tym pliku).
      Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z (bez wariantu Cmd/Ctrl+Y).
- [x] **historia nie zapisuje każdej klatki drag'a** — `beginHistoryGesture()`/`endHistoryGesture()`
      spinają gest bez wiedzy z góry, czy coś w środku faktycznie zmutuje state (bezpieczne i tanie do
      wywołania zawsze); pierwszy `addNode`/`updateNode`/`deleteNode` w otwartym geście pcha snapshot
      raz, reszta w tym samym geście nic nie dodaje. Podpięte w dokładnie dwóch miejscach —
      `useSelectionTool`'s `handlePointerDown.ts`/`handlePointerUp.ts` — więc automatycznie obejmuje
      wszystkie mechanizmy przeciągania z Etapu 5/10 (move, resize, rotate, każdy uchwyt
      corner-radius/vertex-count/ellipse-arc) bez zmiany żadnego pojedynczego `continue*.ts`. Pełny
      opis: `.claude/docs/design-store-architecture.md` §8.

## Etap 12 — Grupy i zagnieżdżone frame'y

Wielokrotnie odnotowane w dokumencie jako "wraca przy grupach/nested frames" (hit-testing w Etapie 5,
`parentId` zawsze `null` od Etapu 2, wspólny outline zaznaczenia w Etapie 5) — to teraz największa
pojedyncza strukturalna luka względem realnej Figmy:

- [ ] grupowanie (Cmd/Ctrl+G) / rozgrupowanie (Cmd/Ctrl+Shift+G) — nowy węzeł-kontener bez własnego
      renderingu (czysto organizacyjny, jak w Figmie), reszta zaznaczonych node'ów dostaje jego `id`
      jako `parentId`
- [ ] realne zagnieżdżanie w `TFrameNode` — przeciągnięcie node'a na/do frame'a zmienia `parentId`,
      nie tylko wizualne nachodzenie
- [ ] hit-testing i selekcja z uwzględnieniem hierarchii (`getNodeAtPoint` dziś operuje na płaskiej
      liście) — klik wybiera najgłębiej zagnieżdżony trafiony node, podwójny klik "wchodzi" głębiej
      (jak w Figmie)
- [ ] przesuwanie/resize rodzica przesuwa/skaluje dzieci

## Etap 13 — Prowadnice i przyciąganie (smart guides)

Rdzeń tego, co sprawia, że układanie elementów w Figmie "czuje się" precyzyjnie — dziś position/size
to czysto swobodny drag, zero pomocy:

- [ ] linijki (rulery) na górze/z lewej krawędzi canvasu, skalujące się z zoomem
- [x] **snap do siatki pikseli** (`Math.round` pozycji/rozmiaru w world space) — `x/y/width/height`
      (i `x1/y1/x2/y2` dla linii) zaokrąglane do liczb całkowitych na dispatch przy tworzeniu
      (`toDraftRect.ts`, nowy globalny `utils/math/roundRect.ts`, `useDrawLineTool.ts`,
      `useDrawMediaTool`), przesuwaniu (`continueDrag.ts`), resize (`getResizeChanges.ts`,
      `resizeLineNode.ts`) i rotacji (`continueRotateDrag.ts` — samo `x/y` środka, nie kąt).
      Zaokrąglane jest zawsze wynik końcowy (dispatch), nigdy wartości pośrednie używane do dalszej
      matematyki (np. `getAspectRatioLockedRect.ts` współdzielony z resize-aspect-lock zostaje
      nietknięty), żeby nie psuć obliczeń skali. Kąt rotacji (`rotation`) zaokrąglany osobno do 2
      miejsc po przecinku (nie do inta — tu precyzja ułamkowa ma sens), żeby nie wyciekały
      wielocyfrowe wartości z `Math.atan2`. Świadomie **nie** ogranicza to ręcznego wpisania wartości
      ułamkowej w przyszłym panelu właściwości (Etap 8) — dotyczy tylko wyniku samego dragowania.
      Reszta punktów tego etapu (linijki/smart guides/snap do frame'a) wciąż do zrobienia.
- [x] **Poprawka: `toDraftRect.ts` przestał zaokrąglać `x`/`width` (i `y`/`height`) niezależnie od
      siebie** — zgłoszony bug: rysowanie kształtu (Rectangle i in.) przeciągnięciem w stronę ujemną
      (w lewo/w górę od punktu startu) przy dużym zoomie dawało widoczny "efekt skoku" — szerokość
      rosła płynnie, po czym `x` nagle "odskakiwało". Przyczyna: `x = Math.round(Math.min(start,
      current))` i `width = Math.round(Math.abs(current - start))` to dwa **niezależne** zaokrąglenia
      dwóch powiązanych, ale różnych wielkości ciągłych — ich suma (`x + width`, czyli krawędź
      zakotwiczona w punkcie startowym przy przeciąganiu w stronę ujemną) nie musi równać się
      zaokrągleniu tej krawędzi wprost, więc migotała o ±1 world unit w zależności od części ułamkowej
      bieżącej pozycji kursora — niezauważalne przy zoomie 100% (1px), ale przy 256x to aż 256px
      widocznego skoku. Naprawione zaokrąglaniem **krawędzi najpierw** (`Math.round` na obu końcach
      przedziału z osobna), a `width`/`height` liczone jako różnica już zaokrąglonych krawędzi — dzięki
      temu `x + width` zawsze dokładnie równa się zaokrągleniu krawędzi zakotwiczonej w starcie,
      niezależnie od tego, jak zmienia się część ułamkowa bieżącej pozycji. Współdzielone przez
      wszystkie narzędzia rysujące, `continueMarqueeDrag.ts` (zaznaczenie prostokątem) i
      `continueDrawDrag.ts` (Slice) — jedna funkcja, jedna naprawa.
- [ ] smart guides: czerwone linie przyciągania do krawędzi/środków innych node'ów podczas
      przeciągania/resize, z wyświetlaną odległością (jak dystanse w Figmie)
- [ ] snap do viewportu/frame'a rodzica
- [x] **siatka pikseli (pixel grid) na canvasie** — pomocnicza siatka na każdej całkowitej
      współrzędnej world (world space to już "1 unit = 1px", więc kwadrat 1x1 domyślnie trafia w jedną
      kratkę, bez osobnej logiki przyciągania), widoczna dopiero od zoomu 400% (`GRID_MIN_ZOOM`), tak
      jak w Figmie. Renderowana jako pojedynczy statyczny quad na cały viewport (`drawPixelGrid.ts`,
      czwarty program GL obok plain-color/image/MSDF) — linie liczone proceduralnie we fragment
      shaderze (`fract` odległości do najbliższej całkowitej współrzędnej world, dzielone przez
      `fwidth` dla stałej ~1px grubości linii niezależnie od zoomu), zamiast tysięcy wierzchołków
      `GL_LINES` na wiersz/kolumnę przy dużym zoomie. Vertex shader siatki jest odwrotny do reszty
      (`a_position` to już współrzędne clip-space, transform pan/zoom przeniesiony do fragment
      shadera) — dzięki temu quad zawsze pokrywa cały ekran bez liczenia world-space rect
      dopasowanego do aktualnego zoomu. Siatka rysowana zaraz po tle, pod węzłami (jak samo tło) —
      czysto kwestia kolejności rysowania, bez wpływu na hit-testing, bo w tej appce nic nie jest
      hit-testowane po warstwie/kolejności rysowania, tylko matematycznie po geometrii node'ów.
      Pełny opis mechanizmu: `.claude/docs/canvas-rendering-pipeline.md` §3, §10

## Etap 14 — Persystencja sceny

Dziś cały `store/design` żyje tylko w pamięci — odświeżenie strony kasuje wszystko. Na start
najmniejszy możliwy krok, później realne zapisywanie:

- [ ] zapis/odczyt `nodes`/`rootOrder`/`viewport` do `localStorage` (autosave po zmianach,
      debounced tak jak resize z Etapu 0) — najmniejszy krok, zero backendu
- [ ] docelowo: zapis po stronie serwera (per plik/projekt), poza scope na razie — dopiszemy jak
      dojdziemy

## Etap 15 — Detale UX toolbara i canvasu

Drobniejsze, ale zauważalne różnice względem Figmy, niepowiązane z żadnym z etapów wyżej:

- [x] **Comment tool** — kliknięcie canvasu otwiera `CommentDraftInput` (fokus dopiero po
      zakończeniu animacji wejścia, nie natywny `autoFocus`, bo ten odpalał się w trakcie
      `scale(0)` z animacji i gubił fokus), Ctrl/Cmd+Enter zapisuje `CommentPin` w tym miejscu.
      Klik poza draftem: pierwszy (z treścią) tylko "wiggle'uje" ostrzegawczo, dopiero drugi
      zamyka; pusty draft zamyka się od razu; środkowy przycisk myszy (panning) nigdy nie liczy
      się jako klik na zewnątrz. Piny/drafty to zwykłe DOM-owe divy pozycjonowane przez
      `worldToScreen` (nie węzły WebGL) — dzięki temu mają stały rozmiar na ekranie niezależnie
      od zoomu, bez żadnego kompensującego `scale()`. Usuwanie/edycja treści istniejącego
      komentarza celowo wyłączone na razie (hook/reducer zostały, ale nic ich nie wywołuje).
      Pełny opis: `.claude/docs/design-tool-architecture.md`, `.claude/docs/design-store-architecture.md`
      ("Comment state"), testy: `e2e/pages/design/comment.spec.ts`
- [x] **`VectorEditToolbar`** — pływający panel narzędzi (Move/Lasso/Paint/Bend/Cut + More/X),
      pojawia się tylko w Vector Edit Mode, 10px nad głównym `Toolbar` (`bottom: calc(100% + 10px)`,
      wyśrodkowany względem jego szerokości — renderowany jako dziecko `Toolbar.tsx`, nie osobno w
      `DesignPage.tsx`). Lista przycisków budowana z jednego `const TOOLS` (`VectorEditToolbar/
      constants.ts`) i mapowana przez `renderTool` — Move, Lasso i Paint mają realne działanie (własny
      `toolName`, aktywne dokładnie gdy ten `ToolName` jest bieżącym narzędziem), Bend/Cut
      wciąż renderują się jako nieaktywne placeholdery bez własnego `ToolName` — dojdą później. X
      zamyka Vector Edit Mode wprost (`setVectorEditingNodeId(null)` + reset toola), nie przez
      3-stopniowe Escape z Etapu 6. Cała logika (dispatch, `renderTool`, `handleClose`) wydzielona do
      `hooks/useVectorEditToolbar.tsx` — komponent to czysty JSX. Nowe tokeny SCSS
      (`src/styles/_variables.scss`: `--spacer-2`, `--radius-medium`, `--radius-large`,
      `--elevation-200-canvas`) — świadomie bez nowych `--color-bg`/`--color-bg-toolbar-selected`, bo
      dublowałyby już istniejące `--color-neutral-5`/`--color-blue-1`.
- [x] **Lasso tool** — dedykowane narzędzie (`ToolName.lasso`, skrót `Q`) do zaznaczania wierzchołków
      dowolnym, ręcznie rysowanym konturem, tylko w Vector Edit Mode — zaznacza wyłącznie wierzchołki
      (nie uchwyty/segmenty, świadomie prostsze niż istniejący prostokątny marquee z jego trybami
      points/handles/everything). Kliknięcie Lasso zawsze przechwytuje pointerdown jako pierwsze w
      `ARM_RESOLVERS` (`armVectorLassoOnPointerDown.ts`), nawet bezpośrednio na istniejącym
      wierzchołku — dedykowane narzędzie nigdy nie uzbraja przeciągania wierzchołka. Kontur zapisywany
      w `canvasRefs.vectorLassoPathRef` (żywy podgląd + hit-testing w jednym), test przynależności
      przez `getVectorPointsInPolygon.ts` (ray-casting, kontur traktowany jako domknięta pętla —
      lokalna implementacja w warstwie globalnej, nie import z `components/`, ten sam wzorzec co
      `getVectorPointsInRect.ts`). Renderowanie: wypełnienie przez `drawVectorFill.ts` (ten sam
      stencil-buffer even-odd co prawdziwy fill Vector node'a, teraz z opcjonalnym `alpha`) + dashed
      outline przez nowy `drawDashedPolylineOutline/` (własny folder, `getPointAtDistance.ts` i
      `getDashVertices.ts` jako osobne, testowane jednostkowo funkcje — generalizacja istniejącego
      `drawDashedRectOutline.ts` na dowolny, niekoniecznie prostokątny kontur). Żywy raport z sesji:
      lasso realnie prześwitywało teksturą tła canvasu podczas rysowania — `drawVectorFill.ts` własnym
      `colorMask(true,true,true,true)` nadpisywało globalne zablokowanie zapisu do kanału alfa, które
      `drawSceneBackground.ts` ustawia raz na klatkę, żeby canvas zawsze zostawał wizualnie
      nieprzezroczysty; naprawione zmianą na `colorMask(true,true,true,false)`, z e2e regresją łapiącą
      błąd tylko w trakcie aktywnego przeciągania (klatka po puszczeniu przycisku i tak odzyskuje pełną
      nieprzezroczystość). Pełny opis: `.claude/docs/vector-network.md` §42.
- [x] **Paint tool** — dedykowane narzędzie (`ToolName.paint`, skrót `Shift+B`) do wypełniania
      pojedynczych "faces" sieci wektorowej kolorem `fillColor` node'a, per-face zamiast całego
      kształtu naraz. Nowe pole `TVectorNode.filledFaceKeys: string[]` — lista kluczy face'ów (ten sam
      stabilny, topologiczny klucz co `deriveVectorFaces.ts` już liczył wewnętrznie), zamiast
      globalnego "ma fill/nie ma" jak dotąd; `deriveVectorFaces.ts` teraz zwraca `{key, points}[]`
      (było `TPoint[][]`) właśnie po to, żeby ten klucz był dostępny na zewnątrz. Klucze faces'ów są
      czysto pochodne (liczone od segmentów przy każdym renderze/hit-teście) — usunięcie segmentu, który
      domykał dany face, sprawia że jego klucz przestaje istnieć i fill sam znika, bez żadnego
      dodatkowego czyszczenia `filledFaceKeys`. Klik przełącza fill danego face'a (dodaj/usuń), przez
      nowy `armVectorPaintOnPointerDown.ts` — jak Lasso, wstawiony blisko czoła `ARM_RESOLVERS`, żeby
      przechwycić klik zanim zrobi to jakikolwiek resolver wierzchołka/segmentu. Hover pokazuje
      podgląd na żywo (niebieski = doda fill, pomarańczowy = usunie — te same kolory co
      `DRAFT_FRAME_STROKE`/`VECTOR_EDGE_HOVER_STROKE` gdzie indziej), oraz kursor `drop.png` (spoczynek)
      / `drop-add.png` / `drop-remove.png` (nad face'em) przez ten sam mechanizm `setClassName`, co
      reszta kursorów Vector Edit Mode (nie osobny `canvas.style.cursor`). Hit-test przez
      `getVectorFaceAtPoint.ts` (ray-casting even-odd).
      Nowe sieci wektorowe dostają teraz domyślny `fillColor: VECTOR_FILL` zamiast `null` (dotąd
      nieużywana stała) — inaczej Paint nie miałby żadnego widocznego efektu, bo w apce wciąż nie ma
      color pickera do fill. Pełny opis: `.claude/docs/vector-network.md` §43.
- [x] **Wykrywanie regionów, przepisane od zera** — pierwsza wersja `deriveVectorFaces` (prosty spacer
      "dokładnie jedna nieodwiedzona droga dalej") łamała się na realnych przypadkach: dwa regiony ze
      wspólną krawędzią, wiszący ogon, T-junction z odgałęzieniem do wnętrza — wszystko to wierzchołki
      stopnia 3+. Przepisane jako właściwa struktura half-edge (DCEL) z sąsiedztwem sortowanym kątowo
      (`buildVectorHalfEdgeAdjacency.ts`, `getNextVectorHalfEdge.ts`) — z tie-breakiem po odległości przy
      remisach kątowych (realnie występują przez smart alignment guides). Dodano też pełną planaryzację
      (`planarizeVectorNetwork/`) — przecięcie dwóch segmentów (prosta-prosta, prosta-krzywa,
      krzywa-krzywa) tworzy teraz nowy, niezależnie malowalny region zamiast zostawać jednym
      samoprzecinającym się face'em (Figma-parity). Po drodze naprawiony realny błąd matematyczny w
      dzieleniu krzywej Béziera (De Casteljau skaluje tangent "ogona" przy każdym kolejnym cięciu —
      ponowne użycie oryginalnego, nieprzeskalowanego tangentu przy 2+ przecięciach na tej samej krzywej
      psuło jej kształt, widoczne jako wybrzuszony fill wychodzący poza kontur). Pełny opis:
      `.claude/docs/vector-network.md` §44.
- [x] **Przełączanie narzędzi klawiaturą vs myszką w Vector Edit Mode różni się celowo** — skrót
      klawiszowy poza białą listą (`pen`/`pencil`/`lasso`/`paint`/`move`) jest całkowicie ignorowany
      (`dispatchTool.ts`, `VECTOR_EDIT_ALLOWED_TOOLS`) i tryb zostaje otwarty na dotychczasowym
      narzędziu — łatwo trafić w skrót przypadkiem w trakcie edycji. Klik w toolbar
      (`selectToolbarTool.ts`) zawsze wykonuje wybór i dodatkowo zamyka Vector Edit Mode, jeśli wybrane
      narzędzie nie jest z grupy Pen — świadome, celowe działanie zawsze powinno przejść. Pełny opis:
      `.claude/docs/vector-network.md` §45.
- [x] **Przeciąganie jednego wierzchołka na drugi scala je** — działa zarówno w obrębie tego samego
      kształtu (wspólna krawędź zapada się zamiast zostać zerowej długości pętlą), jak i między dwoma
      zupełnie różnymi wektorami (przeciągany wierzchołek zawsze przeżywa, ten pod nim zawsze zostaje
      wchłonięty razem z całym swoim grafem, a jego węzeł usunięty). Kursor zmienia się na dedykowaną
      ikonę `point.png` w trakcie przeciągania nad celem. `filledFaceKeys` przenoszone razem z
      wchłanianym kształtem, przefiltrowane do kluczy, których wszystkie segmenty nadal istnieją po
      scaleniu. Pełny opis: `.claude/docs/vector-network.md` §46.
- [x] **Bend jako prawdziwe, trwałe narzędzie w `VectorEditToolbar`**, nie tylko modyfikator Ctrl/Cmd —
      kliknięcie w panelu włącza je na stałe (zwykły, bez-Ctrl drag segmentu gnie go, aż użytkownik
      przełączy się na inne narzędzie), wpięte w te same bramki co Move (`VECTOR_EDIT_ALLOWED_TOOLS`,
      mapy ikon/etykiet toolbara). Samo trzymanie Ctrl/Cmd, gdy realnie aktywny jest Move, teraz też
      wizualnie podświetla przycisk Bend w toolbarze (bez żadnego dispatchu Reduxa) — nowy hook
      `useIsBendModifierHeld.ts`, pierwszy w tej apce mechanizm śledzący stan klawisza modyfikującego w
      sposób ciągły. Pełny opis: `.claude/docs/vector-network.md` §47.
- [x] **Edycja kilku wektorów naraz** — `vectorEditingNodeId: string | null` zamienione na
      `vectorEditingNodeIds: string[]` w całym kodzie; zaznacz 2+ wektory i wciśnij **Enter**
      (tymczasowy mechanizm wejścia), żeby otworzyć je wszystkie naraz do edycji. Wektory nigdy się
      strukturalnie nie łączą same z siebie — jedynie jawny gest (przeciągnięcie wierzchołka na
      wierzchołek, §46, albo kliknięcie Pena w istniejący wierzchołek/segment innego otwartego węzła)
      robi to naprawdę. Nowy, generyczny `pickClosestVectorHitAcrossNodes.ts` + pięć cienkich
      wrapperów obsługuje hit-testing/hover/marquee/lasso/Paint na całym otwartym zbiorze; usuwanie
      wierzchołków/segmentów rozłożonych na kilku węzłach grupuje się po właścicielu i pakuje w jeden
      gest historii (jeden Undo cofa wszystko). Pen dynamicznie celuje w faktycznie dotknięty otwarty
      węzeł zamiast sztywno w pierwszy (`resolvePenTargetNode.ts`), a puste kliknięcie Penem przy 2+
      otwartych węzłach tworzy naprawdę niezależny, nowy wektor ("wektor C") zamiast doklejać kontur do
      pierwszego z nich. Pełny opis: `.claude/docs/vector-network.md` §48, e2e:
      `e2e/pages/design/multi-vector-edit.spec.ts`.
- [x] **Klik w wypełniony face zaznacza od razu wszystkie jego wierzchołki (narzędzie Move)** —
      analogiczna afordancja do Paint tool (§43), ale do zaznaczania zamiast malowania: nowy
      `getVectorFaceVertexIds.ts` parsuje `pieceKeys` face'a (token `v:<id>` = realny wierzchołek,
      `x:<segmentId>:<n>` = jeszcze niespersystowane przecięcie, pomijane) na realny zestaw id
      wierzchołków. Zwykły klik podmienia całe zaznaczenie, Shift dokłada (unia, nie toggle per-punkt —
      dwa sąsiadujące face'e dzielące wspólny podział inaczej traciłyby go przy drugim shift-kliku) —
      pozwala zaznaczyć kilka face'ów naraz, i od razu zbraja przeciąganie zaznaczonych punktów (bez
      osobnego drugiego kliknięcia). Hover nad wypełnionym face'em w Move (nie tylko w Paint) pokazuje
      ten sam niebieski hatch (`DRAFT_FRAME_STROKE`) co afordancja "dodaj fill" Paint tool, a gdy
      wszystkie wierzchołki jakiegoś wypełnionego face'a są aktualnie zaznaczone (dowolną drogą — tym
      klikiem, Lasso, marquee), face zostaje tak samo podświetlony na stałe, nie tylko na hover.
      Pełny opis: `.claude/docs/vector-network.md` §56.
- [x] **Shape Builder** (`ToolName.shapeBuilder`, skrót `M` w dropdownzie "More" `VectorEditToolbar`) —
      Figma-owe narzędzie łączące/odejmujące face'e przez realne kasowanie segmentów granicznych, nie
      tylko przełączanie fillu: przeciągnięcie (freeform albo, z Shift, box) po dwóch+ face'ach usuwa
      wspólną granicę między nimi i wypełnia powstałą unię; zwykły klik (bez przeciągnięcia) działa tak
      samo na jednym face'ie; **Alt** odejmuje zamiast łączyć — kasuje tylko *wyłączną* granicę
      dotkniętego face'a (segmenty niedzielone z żadnym nietkniętym sąsiadem), więc odjęcie jednej
      połówki podzielonego kształtu nigdy nie narusza granicy drugiej połówki, a face bez sąsiadów
      (nic do ochrony) traci całą swoją granicę razem z fillem. Rozłączne podsieci wektora (np. dwa
      osobne, nachodzące na siebie prostokąty w jednym node'ie) scalają się niezależnie bez żadnego
      specjalnego kodu — segment jest "wewnętrzny"/"wyłączny" tylko względem face'ów, które faktycznie
      graniczy, więc dwa niepowiązane komponenty nigdy nie dzielą segmentu. Po drodze złapane i
      naprawione żywo dwa błędy na tle identyfikatorów segmentów po przecięciach (§51's `pieceKeys` to
      zła baza do kasowania realnych `node.segments` — trzeba operować na surowym, sufiksowanym
      `face.key`) oraz luka w resolverze fillu po §51 (kasowanie środkowego kawałka realnego segmentu
      łamało założenie "kawałki zawsze tworzą jeden ciągły łańcuch", naprawione przez
      `buildVertexRuns.ts` zwracające niezależne, rozłączne biegi zamiast jednej sekwencji). Kursor
      przełącza się między `add.png`/`remove.png` natychmiast po (nie)trzymaniu Alt, nawet bez ruchu
      myszy (synthetic-pointermove wzorem istniejącego mechanizmu dla Shift). Freeform ścieżka rysuje
      się jako otwarta, przerywana linia (trasa A→Z jak ołówkiem), Shift+box jako zamknięty prostokąt —
      osobny `isClosed` parametr w `drawDashedPolylineOutline.ts`. Pełny opis:
      `.claude/docs/vector-network.md` §59-60, e2e: `e2e/pages/design/vector-shape-builder.spec.ts`.

      **Rozszerzenie: przecięcie dwóch RÓŻNYCH node'ów wektorowych** — zgłoszone wprost, ze
      zrzutem ekranu: dwa osobne prostokąty (dwa osobne node'y), nachodzące na siebie na ekranie.
      Wcześniej Shape Builder widział oba otwarte node'y przy hit-testingu, ale traktował każdy
      całkowicie niezależnie — przeciągnięcie po przecięciu scalało/wypełniało zawsze cały, niepodzielony
      prostokąt każdego node'a. Naprawione materializacją przecięcia między zbiorami segmentów obu
      node'ów (`planarizeVectorNetwork`/`persistVectorNetworkCrossings` są w pełni generyczne — nie mają
      pojęcia "właściciela" segmentu, więc dostają po prostu unię segmentów z dwóch node'ów) i złożeniem
      pary w jeden ocalały node, kasując drugi — dokładnie ten sam mechanizm co istniejące scalanie
      node'ów przez przeciągnięcie wierzchołka na wierzchołek (§46), tylko wyzwalane przez faktyczne
      przecięcie granic zamiast wspólnego wierzchołka. Nowy `utils/canvas/vectorNetwork/mergeVectorNodes/`
      (`doVectorNodesCross.ts` + `groupCrossingVectorNodes.ts`) grupuje **wszystkie aktualnie otwarte**
      node'y w spójne składowe (transytywnie — A×B i B×C scala też A z C, mimo że A i C się nie
      stykają) — nie tylko dotknięte, co samo w sobie było żywo złapanym bugiem: Alt+klik tylko w
      wyłączny róg jednego kształtu, bez dotknięcia nietkniętego sąsiada z którym się przecina, kasował
      całą granicę sąsiada zamiast chronić wspólną cięciwę, bo nietknięty sąsiad w ogóle nie trafiał do
      grupowania. Naprawione czytaniem `vectorEditingNodeIds` zamiast kluczy `touchedFaces`. A
      `commitVectorShapeBuilder.ts` rozbity na 3 pliki: cienki orkiestrator + niezmieniona ścieżka
      pojedynczego node'a + nowa ścieżka dla grupy 2+ (re-hit-test surowej ścieżki przeciągnięcia
      względem połączonego node'a, bo stare klucze face'ów przestają istnieć po podziale). Idle hover
      (przed kliknięciem) świadomie zostaje przybliżeniem — pokazuje cały, niepodzielony face
      najmniejszego/najwyższego node'a w punkcie (fix z §61), dokładny podział widać dopiero gdy
      przeciągnięcie faktycznie się zacznie. Pełny opis: `.claude/docs/vector-network.md` §62.
- [ ] menu kontekstowe (prawy klik) na node'ach i na pustym canvasie — Copy/Paste, Duplicate,
      Bring to front/Send to back, Delete itd. — dziś nie istnieje w ogóle
- [ ] kontrolka zoomu w rogu canvasu (aktualny % + dropdown: Zoom to fit / Zoom to selection /
      100%), sprzężona z tym samym `store/design.viewport` co scroll/pinch z Etapu 4
- [ ] z-order z UI — Bring to front / Send to back / Forward / Backward (dziś kolejność w
      `rootOrder` zmienia się tylko przez kolejność tworzenia)
- [ ] prawa grupa toolbara (draw / scale / actions / dev mode) — pozostałość z Etapu 1, wciąż
      niezrobiona
- [ ] preset rozmiarów we Frame tool (np. "Desktop", "iPhone 15" — Figma pokazuje listę w panelu
      po lewej przy aktywnym narzędziu Frame)

---

Etapy dalej w przyszłości (komponenty/instancje, auto-layout, warstwy efektów typu blur/shadow,
multiplayer, itd.) — dopiszemy jak dojdziemy do tego miejsca, żeby nie planować na zapas.
