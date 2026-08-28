# xigma — Roadmap 2.0.0

Kontynuacja [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) — tamten dokument kończy się na dokładnej,
zaimplementowanej historii budowy aplikacji od zera. Ten plik zbiera kolejne, większe etapy pracy,
każdy wystarczająco duży (wielosesyjny), żeby nie mieścił się już w konwencji "Etap = malutka
porcja pracy" z 1.0.0.

## Etap 1 — Performance: skalowanie na duże, wielokształtowe sceny wektorowe

Kontekst: sesja profilowania (2026-08-26/27) na stress-teście z tysiącami kształtów w jednym
`TVectorNode` (`scripts/generateStressTestVectorGrid.ts`) zamknęła cache klastrowy (fill/stroke/
crossing detection) i kilka konkretnych, punktowych bugów (`getRemainingVertices`, trzy w
cut-toolu, cache klasyfikacji vertex-dotów, trzy miejsca z bake'em rotacji poza cache'em) — pełny
opis w [[canvas-vector-performance]]. Dwie duże rzeczy zostały świadomie odłożone, opisane tam w
§5.6/§5.7 jako jeszcze nie zaczęte:

- [ ] **Incremental/differential topology tracking** — dziś każda edycja pojedynczego kształtu w
      wielokształtowym węźle wciąż przelicza strukturę grafu (`computeClusters`) i wyszukiwanie
      przecięć (`findAllNetworkCrossings`) po **całym** węźle od zera, nawet gdy edycja dotyka tylko
      jednego, niewielkiego fragmentu — to architektoniczny sufit, którego żaden z dotychczasowych
      cache'y (klastrowy ani żaden inny) nie usuwa, bo cache chroni przed powtórnym przeliczeniem
      tego samego, nie przed przeliczeniem tysiąca różnych rzeczy raz. Cel: śledzić, które konkretnie
      klastry/wierzchołki/segmenty realnie dotknęła dana edycja, i przeliczać tylko je. Wymaga
      diffowania starego/nowego grafu (`segments`/`vertices` przed/po edycji) oraz bezpiecznego
      wykrywania sytuacji, w których edycja scala lub dzieli klastry (np. przesunięcie kształtu tak,
      że zaczyna dotykać sąsiada, którego wcześniej nie dotykał). Wysokie ryzyko regresji — dotyka
      rdzenia, na którym stoi cały pipeline wektorowy, a jego historia jest pełna subtelnych bugów
      dokładnie w tym miejscu (bowtie regression, lens shape, self-intersection fill loss — patrz
      [[vector-network]]).
- [ ] **GPU-buffer-level caching** — renderer dziś re-uploaduje geometrię każdego node'a do GPU
      (`bufferData`) co klatkę, niezależnie czy się faktycznie zmieniła; cała aplikacja dzieli tylko
      4 bufory GL, rebindowane per-primitive (patrz [[canvas-rendering-pipeline]] §3/§8). Cel: trwałe
      bufory per-node (`WebGLBuffer` tworzony raz, re-uploadowany tylko gdy geometria realnie się
      zmieniła) zamiast ciągłego re-upload. Wymaga zarządzania cyklem życia buforów
      (`gl.createBuffer`/`gl.deleteBuffer` przy tworzeniu/usuwaniu node'a — czego dziś w kodzie
      nigdzie nie ma) oraz restrukturyzacji samego cyklu rysowania (bind → _warunkowe_ `bufferData` →
      `drawArrays`). Dotyka całego pipeline'u renderowania, nie tylko wektorów — szerszy zakres niż
      topology tracking, ale mniejsze ryzyko logicznych regresji (bliżej "instalacji/plumbingu" niż
      subtelnej geometrii).
      **Pierwszy, wąski wycinek zrobiony (2026-08-28)**: `getOrCreateFaceBuffer.ts` daje trwały
      `WebGLBuffer` na twarz wypełnienia (`fill face`) **stabilnego, zacommitowanego** węzła
      wektorowego — cache `WeakMap<TPoint[], WebGLBuffer>` na `TImageRenderContext`, re-upload tylko
      gdy referencja tablicy twarzy faktycznie się zmieni (co i tak już śledzi cache klastrowy z §5
      [[canvas-vector-performance]]). Świadomie **nieobjęte**: tesselacja obrysu (stroke), wszystkie
      trzy ścieżki frozen-snapshot (drag/resize/rotate — tam geometria i tak jest przeliczana co klatkę,
      więc trwały bufor byłby stratą, nie zyskiem), lasso preview, i wszystkie nie-wektorowe prymitywy
      (rect/ellipse/star/image/text/grid — nadal jeden dzielony scratch-buffer). Bez jawnego
      `gl.deleteBuffer` przy ewikcji — ten sam, świadomie zaakceptowany kompromis co w
      `getOrLoadTexture.ts`. Pełny opis w [[canvas-vector-performance]] §5.7's closing note.

Oba punkty są od siebie niezależne — można zrobić jeden, drugi, oba albo żaden; nie ma między nimi
zależności kolejności.

## Related

[[canvas-vector-performance]] — pełny opis tego, co już zrobione (cache klastrowy, spatial hash
zamiast sweep-line, reuse cache'u bake'u rotacji, punktowe fixy w cut-toolu i vertex-dotach) oraz
dokładniejsze uzasadnienie, dlaczego te dwa punkty zostały odłożone na osobny etap.
