# Vector Edit Mode — Multi-Node Editing Phase 1 — Live Browser Test Log

Aktualizowane na żywo w trakcie testowania w przeglądarce (Playwright MCP). ✅ = przeszło, ❌ = nie przeszło (opis błędu obok), ⏳ = jeszcze nie testowane.

## 1. Wejście do trybu (Enter)

- [x] ✅ 1. Zaznacz 2 wektory → `Enter` → oba wchodzą w tryb edycji (potwierdzone live: oba trójkąty dostały gray outline + kropki wierzchołków jednocześnie, VectorEditToolbar aktywny na "Przesuń")
- [ ] ⏳ 2. Zaznacz 1 wektor → `Enter` → nic się nie dzieje — nie testowane live, pokryte jednostkowo (`handleEnterMultiVectorEdit.spec.ts`)
- [ ] ⏳ 3. Zaznacz wektor + frame → `Enter` → wchodzi tylko wektor — nie testowane live, pokryte jednostkowo
- [ ] ⏳ 4. Zaznacz 3+ wektory → `Enter` → wszystkie otwarte — nie testowane live, pokryte jednostkowo

## 2. Renderowanie przy kilku otwartych węzłach

- [ ] ⏳ 5. Hover nad otwartym węzłem nie pokazuje grubego hover-outline — nie testowane live (wymaga śledzenia hover bez kliku), pokryte jednostkowo (`drawHoverOutline.spec.ts`)
- [x] ✅ 6. Zaznaczenie (Move) otwartych węzłów nie dubluje outline (widoczne tylko handle-layer, brak podwójnego box+corner-handles per trójkąt)

## 3. Hit-testing między węzłami

- [x] ✅ 7. Drag wierzchołka na A rusza tylko A (potwierdzone live: dolny wierzchołek A wydłużony, B bez zmian)
- [x] ✅ 8. Drag wierzchołka na B rusza tylko B (potwierdzone live: teraz dolny wierzchołek B też wydłużony, A pozostał na swoim miejscu z poprzedniego kroku)
- [x] ✅ 9. Tangent handle na A i na B chwytalny niezależnie (ten sam dowód co #11 — uchwyty na obu węzłach powstały i są przeciągalne niezależnie)
- [ ] ⏳ 10. Segment bliżej kursora wygrywa między A i B — nie testowane live, pokryte jednostkowo (`getVectorEdgeAtPointAcrossOpenNodes.spec.ts`)
- [x] ✅ 11. Ctrl+drag z narożnika na A i na B (potwierdzone live: Ctrl+drag z górnego-lewego rogu A i osobno z górnego-lewego rogu B — obie krzywe pociągnięte niezależnie, widoczne diamentowe uchwyty na obu)
- [ ] ⏳ 12. Bend na A i na B — nie testowane live, pokryte jednostkowo (`armVectorBendSegmentOnPointerDown` + `getAllVectorEdgeMatchesAtPointAcrossOpenNodes.spec.ts`)

## 4. Marquee / Lasso

- [ ] ⏳ 13. Marquee obejmujący wierzchołki z A i z B — nie testowane live, pokryte jednostkowo (`continueVectorMarqueeDrag.spec.ts`)
- [x] ✅ 14. Lasso analogicznie — potwierdzone live, zob. sekcja 11 poniżej (i fix tam opisany dla przesuwania zaznaczenia bez wychodzenia z narzędzia Lasso)

## 5. Usuwanie (Delete/Backspace)

- [x] ✅ 15. Usuń wierzchołek z A i z B jednocześnie, jeden undo cofa oba (potwierdzone live: Delete zamieniło oba trójkąty w linie, jeden Cmd+Z przywrócił oba naraz)
- [ ] ⏳ 16. To samo dla segmentów (pokryte jednostkowo w `handleDeleteSelection.spec.ts`, nie powtarzane live — mechanizm identyczny jak wierzchołki)

## 6. Multi-select box/resize/rotate

- [x] ⚠️ 17. 2+ wierzchołki w jednym węźle → box działa — próba live niekonkluzywna (zaznaczone dwa wierzchołki A leżały akurat współliniowo z krawędzią, box degeneruje się do linii nierozróżnialnej wizualnie od segmentu). Pokryte jednostkowo (`armVectorMultiSelectBoxOnPointerDown` w `armResolvers.spec.ts`), traktuję jako ✅ na podstawie testów.
- [x] ✅ 18. **(Aktualizacja — poprzednio "box NIE pojawia się", teraz zaimplementowane na życzenie usera.)** Po jednym wierzchołku z A i z B → box POJAWIA SIĘ i obejmuje oba (potwierdzone live: marquee po całych A+B → jeden wspólny box; drag/resize/rotate z boxa przesuwa/skaluje/obraca oba węzły naraz, jeden Undo cofa całość). Zob. sekcja 10 poniżej.

## 6a. Multi-select box — segmenty i cross-node (dodane po code-review i bezpośrednim zgłoszeniu usera: "Nie pojawia się box jak zaznaczymy A i B wektor")

- [x] ✅ 18a. Niebieski box zwykłego zaznaczenia węzłów (node-level) znika po wejściu w Enter (potwierdzone live: 2 trójkąty zaznaczone, box widoczny przed Enter, znika natychmiast po Enter, zamiast tego widać handle-layer obu węzłów)
- [x] ✅ 18b. Zaznaczenie POJEDYNCZEGO segmentu (Shift+klik na krawędź, nie na punkt) → box POJAWIA SIĘ obejmując oba końce segmentu (potwierdzone live na krawędzi trójkąta B; wcześniej wymagało 2+ jawnie zaznaczonych wierzchołków)
- [x] ✅ 18c. Resize/rotate/move CURSOR na boxie (hover i w trakcie przeciągania) — potwierdzone live: kursor resize na rogu, kursor rotate tuż za rogiem, klasa `--move` we wnętrzu, wszystkie poprawnie czyszczone po zjechaniu myszką poza box (wcześniej: martwy kod w `useHoverHighlight`, nigdy się nie odpalał w vector edit mode)
- [x] ✅ 18d. Marquee obejmujące WSZYSTKIE wierzchołki dwóch osobnych otwartych węzłów (A+B całe) → jeden wspólny box (potwierdzone live, patrz sekcja 10)
- [x] ✅ 18e. Przeciągnięcie za wnętrze cross-node boxa → oba węzły przesuwają się razem o ten sam delta (potwierdzone live, debug snapshot `deltaX/deltaY` mid-drag + screenshot)
- [x] ✅ 18f. Przeciągnięcie za róg cross-node boxa (resize) → oba węzły skalują się razem względem wspólnego zakotwiczenia (potwierdzone live, oba trójkąty urosły proporcjonalnie)
- [x] ✅ 18g. Przeciągnięcie tuż za róg cross-node boxa (rotate) → oba węzły obracają się razem wokół wspólnego pivota, box też się przechyla (potwierdzone live przy małym kącie obrotu; duży kąt potrafi wysłać drugi trójkąt poza widoczny viewport — to poprawna geometria dla szerokiego boxa, nie bug)

## 7. Escape i wyjście

- [x] ✅ 19. Escape przy 2 otwartych węzłach zamyka oba (potwierdzone live: 1× Escape, VectorEditToolbar zniknął, oba trójkąty wróciły do zwykłego rysowania)
- [x] ⚠️ 20. Odznaczenie jednego z dwóch zamyka tylko jego — **mechanizm poprawny i pokryty testem jednostkowym (`handleSetSelection.spec.ts`), ale live: nie znalazłem żadnej ścieżki UI, która by go faktycznie wywołała.** Klik na pustym canvasie w trybie multi-edit jest przechwytywany przez `armVectorMarqueeOnPointerDown` (marquee wektorowe), więc nie dociera do `setSelection` w ogóle — sprawdzone live, zaznaczenie i tryb edycji obu węzłów pozostały nietknięte po pustym kliknięciu. Shift-klik bezpośrednio na otwarty węzeł też jest przechwytywany przez resolvery wektorowe (vertex/segment), nie generyczny toggle selekcji. Realny trigger istniałby dopiero przy innym mechanizmie wyboru (np. panel warstw, którego nie ma) — do potwierdzenia z Tobą czy to akceptowalne w Fazie 1, czy wymaga dodania jakiejś ścieżki.

## 8. Regresja

- [x] ✅ 21. Zwykły podwójny klik na jeden wektor (potwierdzone live: tylko A wszedł w edycję, B pozostał zwykłym czarnym kształtem)
- [x] ✅ 22. Pen tool przy 2 otwartych węzłach rysuje na właściwym z nich, bez crasha (**FIX zastosowany na żywo, `resolvePenTargetNode.ts`**: Pen już nie celuje na sztywno w `vectorEditingNodeIds[0]`, tylko dynamicznie rozpoznaje węzeł po tym, gdzie faktycznie klikasz/kontynuujesz — najpierw wierzchołek, potem krawędź, dopiero na końcu domyślny pierwszy węzeł). Potwierdzone live trzema próbami, wszystkie bez przekładania kolejności zaznaczenia (A cały czas pierwszy): (a) klik na istniejący wierzchołek B wznowił rysowanie i dorysował nowy segment; (b) **klik dokładnie na środek krawędzi (segmentu) B rozdzielił ją nowym wierzchołkiem (split) — to była luka zgłoszona przez usera po pierwszej wersji fixu, teraz zamknięta przez `getVectorEdgeAtPointAcrossOpenNodes` jako drugi poziom rozpoznawania**. Kliknięcie w zupełnie puste miejsce nadal domyślnie trafia w pierwszy węzeł — jedyny pozostały, świadomy wyjątek, bo wymagałby osobnej funkcji "utwórz wektor C")
- [x] ✅ 23. Paint tool — **FIX zastosowany na żywo** (`getVectorFaceAtPointAcrossOpenNodes.ts` + `armVectorPaintOnPointerDown.ts` + `resolveVectorPaintHover.ts` + `drawVectorPaintHoverPreview.ts`, `hoveredVectorPaintFaceKeyRef` zmieniony na `{faceKey, nodeId} | null`). Znaleziony live przez usera: pierwotnie malowanie działało tylko na pierwszym węźle — kliknięcie wewnątrz B (nieprymarnego) nic nie robiło. Po fixie potwierdzone live: kliknięcie wewnątrz B pokazało poprawny hover-preview (kreskowanie) i faktycznie zamalowało B na szaro, niezależnie od kolejności zaznaczenia — oba kształty pomalowane jednocześnie na zrzucie ekranu.
- [x] ✅ 24. Zwykła edycja pojedynczego wektora bez regresji (potwierdzone pośrednio: drag wierzchołka, double-click, Escape, Delete/undo — wszystko zachowuje się jak dotąd dla pojedynczego węzła w trakcie tej sesji)

## 9. Pen — realne łączenie wektorów (dodane na żywo po dyskusji z userem, poza pierwotnym zakresem Fazy 1)

Odkryte przy okazji testu #22: Pen kliknięty na wierzchołek/krawędź innego otwartego wektora tworzył
nowy punkt tylko _wizualnie_ pokrywający się ze współrzędnymi (position-sharing bez łączenia — zgodne
z pierwotną specyfikacją). Po rozmowie z userem zdecydowano dodać **prawdziwe scalanie**, wyzwalane
kliknięciem Pen-a zamiast tylko drag-iem (§46 już to miał dla dragu).

- [x] ✅ 25. Kropka→kropka: Pen z aktywnego wierzchołka A, klik dokładnie na istniejący wierzchołek B →
      cały graf B zostaje wchłonięty do A (`closeLoopOntoAnotherNode.ts`), nowy segment łączy je, B znika
      jako osobny węzeł i jako `vectorEditingNodeIds`. Potwierdzone live strukturalnie: przeciągnięcie
      scalonego punktu porusza całym dawnym B razem z mostem — nie tylko wizualna zbieżność.
- [x] ✅ 26. Kropka→segment: klik na środek krawędzi B (nie wierzchołek) → segment B zostaje
      rozdzielony (`splitVectorSegment`, ta sama matematyka co przy zwykłym split w obrębie jednego węzła)
      i nowy punkt zostaje połączony z A (`closeLoopOntoAnotherNodeEdge.ts`). Potwierdzone live
      strukturalnie tą samą metodą (drag scalonego punktu porusza całym B).
- [x] ✅ 27. Podpowiedź/snap przed kliknięciem — pierwsza wersja fixu (#25/#26) łączyła poprawnie na
      klik, ale bez żadnej wizualnej zapowiedzi (user to zauważył: "nie ma podpowiedzi w sensie snapa").
      Naprawione w `updateVectorPenPreview.ts` — rubber-band i klasa kursora canvasu teraz sprawdzają też
      inne otwarte węzły, nie tylko ten aktywny. Potwierdzone live: hover dokładnie na wierzchołku B →
      kursor `pen-snap`, linia przyciąga się do niego; hover blisko krawędzi B → kursor `pen-extend`,
      segment podświetla się na czerwono — identycznie jak w obrębie jednego wektora.

- [x] ✅ 28. Klik Pen-em w zupełnie puste miejsce (bez najeżdżania na A ani B) → tworzy **prawdziwy,
      osobny wektor C**, a A i B zostają otwarte. Wcześniej (przed tym fixem) taki klik dorzucał
      odłączony kontur do pierwszego otwartego węzła — user to przewidział i poprosił o naprawę.
      Naprawione w `resolvePenTargetNode.ts` (zwraca `null` zamiast domyślnego pierwszego węzła, gdy
      naprawdę nic nie trafiono) + `startNewVectorNetwork.ts` (dołącza nowy węzeł do istniejących
      `selectedIds`/`vectorEditingNodeIds` zamiast je zastępować). Potwierdzone live: trzeci, w pełni
      niezależny trójkąt powstał i jest otwarty w edycji razem z A i B, bez żadnego połączenia z nimi.

**Nic nie zostało już świadomie pominięte w tym obszarze** — wszystkie trzy przypadki z pierwotnej
specyfikacji (position-sharing bez łączenia — zamienione na realne łączenie na życzenie usera;
"vector C" przy pustym kliknięciu) są teraz zaimplementowane i potwierdzone live.

## 10. Multi-select box — segmenty i pełny cross-node (dodane po code-review, potem rozszerzone na żywo po bezpośrednim zgłoszeniu usera)

Code-review pierwszego przejścia znalazł trzy bugi w boxie multi-select ograniczonym do jednego węzła
(niebieski node-level box nie znikał po Enter; box nie obejmował segmentów, tylko jawnie zaznaczone
wierzchołki; kursory resize/rotate/move były martwym kodem w `useHoverHighlight`, bo ten hook nigdy się
nie aktywuje w vector edit mode). Wszystkie trzy naprawione i potwierdzone live — patrz punkty 18a-18c
wyżej.

Zaraz po commicie tej naprawy user zapytał wprost: _"Jak? Nie pojawia się box jak zaznaczymy A i B
wektor"_ — w trybie edycji, zaznaczając CAŁE A i CAŁE B (nie pojedyncze punkty), box się nie pojawiał.
Przyczyna: `getVectorMultiSelectOwningNode` wymagało, żeby WSZYSTKO zaznaczone należało do jednego
węzła — cross-node selection zwracało `null` i box się wyłączał całkowicie. To samo dotyczyło samego
mechanizmu drag/resize/rotate (`nodeId: string` w stanie drag-u). User potwierdził że to osobne, większe
zadanie i poprosił o rozszerzenie.

- [x] ✅ 29. Marquee po całych A+B (wszystkie wierzchołki obu trójkątów) → jeden wspólny box obejmujący
      oba (potwierdzone live: box widoczny od (650,250) do (1050,300), wszystkie 6 wierzchołków
      podświetlonych na niebiesko)
- [x] ✅ 30. Przeciągnięcie za wnętrze cross-node boxa (move) → oba węzły przesuwają się razem o
      identyczny delta (potwierdzone live: debug snapshot `deltaX=0, deltaY=180` w trakcie drag-u,
      potem screenshot — oba trójkąty faktycznie przesunięte o 180px w dół, box podążył razem z nimi)
- [x] ✅ 31. Przeciągnięcie za róg cross-node boxa (resize) → oba węzły skalują się razem względem
      wspólnego zakotwiczenia (potwierdzone live: oba trójkąty urosły proporcjonalnie po przeciągnięciu
      rogu na zewnątrz)
- [x] ✅ 32. Przeciągnięcie tuż za róg cross-node boxa, w pierścieniu rotate (rotate) → oba węzły
      obracają się razem wokół wspólnego pivota (środek boxa), box też się przechyla (potwierdzone live
      przy małym kącie — obie trójkąty pozostały widoczne i zachowały względne położenie względem
      siebie; przy dużym kącie jeden trójkąt potrafi wylecieć poza widoczny viewport, co jest poprawną
      geometrią dla szerokiego/płaskiego boxa, nie błędem)

**Uwaga o metodyce live-testów**: pojedynczy `page.mouse.move` "teleportujący" bez pośrednich kroków
czasem czytał nieaktualny stan kursora/DOM przy natychmiastowym odczycie — prawdziwa interakcja
myszką zawsze ma ruch pośredni, więc to artefakt narzędzia testowego, nie bug produktu. Dodanie 3-10
`steps` do ruchu poprzedzającego `pointerdown` ustabilizowało wszystkie powtórki.

Pełny opis architektury (nowe/zmienione pliki: `getVectorMultiSelectPoints.ts`,
`groupVectorMultiSelectOriginsByNode.ts`, `getBakedVectorEditingNodes.ts`, usunięcie
`getVectorMultiSelectOwningNode.ts`, usunięcie `nodeId` z trzech typów stanu drag-u) w
`.claude/docs/vector-network.md` §49.

## 11. Lasso — nie blokuje przesuwania już zaznaczonych elementów (zgłoszone przez usera na żywo)

User: _"Gdy mamy lasso blokujemy eventy poza zaznaczaniem pointów ale jak zaznaczymy lasso i chcemy
przesunąć elementy zaznaczone lasso nie pozwala."_ Doprecyzowanie usera — dwa warunki: (1) jeśli
lasso aktywne i NIC nie jest zaznaczone, lasso nie pozwala na nic poza zaznaczaniem; (2) jeśli lasso
aktywne i COŚ jest zaznaczone, to zaznaczone coś powinno dać się przesunąć. _"Co ważne to że pointy
są zaznaczone nie znaczy że lasso może nie działać, raczej kwestia co jest klikalne a co nie."_ —
lasso ma dalej normalnie zaznaczać nowe rzeczy, tylko już zaznaczone elementy mają stać się
"klikalne" pod spodem.

Przyczyna: `armVectorLassoOnPointerDown` przy `activeTool === lasso` przechwytywał KAŻDY
`pointerdown` bezwarunkowo — czyścił zaznaczenie i startował nową ścieżkę lasso, niezależnie od tego
co było pod kursorem.

**Pierwsza próba fixu była za szeroka i odrzucona w trakcie pracy**: samo przesunięcie
`armVectorLassoOnPointerDown` na koniec listy hit-testowych resolverów w `ARM_RESOLVERS` (żeby
wierzchołek/uchwyt/segment/box, które nie sprawdzają `activeTool`, dostały pierwszeństwo) naprawiało
warunek (2), ale psuło warunek (1) — klik na dowolny, NIEzaznaczony wierzchołek zaczynałby wtedy jego
drag zamiast lasso, bo `armVectorVertexOnPointerDown` domyślnie zaznacza-i-przeciąga cokolwiek trafi,
zaznaczone czy nie. Istniejący (i wciąż aktualny) e2e test `vector-edit.spec.ts` row 240 explicit
sprawdzał dokładnie ten przypadek — klik dokładnie na NIEzaznaczonym wierzchołku musi wciąż zacząć
lasso, nie drag. Ten test nie został zmieniony i musiał dalej przechodzić.

**Finalny fix** (chirurgiczny, bez zmiany kolejności `ARM_RESOLVERS`):
`armVectorLassoOnPointerDown` sam sprawdza teraz, czy klik trafia w element, który JEST już częścią
bieżącego zaznaczenia (zaznaczony wierzchołek/uchwyt/segment, albo wnętrze/róg/pierścień
multi-select boxa zbudowanego z bieżącego zaznaczenia) — i tylko wtedy oddaje (`return undefined`)
pointerdown dalej, do zwykłych resolverów (`armVectorVertexOnPointerDown` itd.), które już poprawnie
obsługują drag/group-drag. Klik na cokolwiek NIEzaznaczonego (albo puste miejsce) dalej zachowuje się
dokładnie jak wcześniej — czyści zaznaczenie i zaczyna nową ścieżkę lasso. Nowy plik
`isPointOnVectorMultiSelectBox.ts` (`Design/Canvas/utils/`) łączy istniejące
resize-handle/rotate-ring/interior sprawdzenia w jeden predykat, użyty tylko tutaj.

- [x] ✅ 33. Lasso-select dwóch dolnych wierzchołków trójkąta (trzeci, górny, poza pętlą) →
      zaznaczone dokładnie dwa (potwierdzone live: oba dolne na niebiesko, górny biały)
- [x] ✅ 34. Przeciągnięcie zaczynając DOKŁADNIE na zaznaczonym wierzchołku, narzędzie Lasso wciąż
      aktywne → oba zaznaczone wierzchołki przesuwają się razem, trzeci nietknięty (potwierdzone
      live: `store.getState()` przed/po — oba `y: 400 → 450`, trzeci wierzchołek bez zmian; Lasso
      pozostało zaznaczone w toolbarze przez cały czas)
- [x] ✅ 35. Lasso po wszystkich trzech wierzchołkach (puste pole wokół kształtu) → nadal działa jak
      zwykłe zaznaczanie, wszystkie trzy stają się zaznaczone, box multi-select się pojawia
      (potwierdzone live screenshotem)
- [x] ✅ 36. Przeciągnięcie zaczynając we WNĘTRZU multi-select boxa (nie dokładnie na punkcie), Lasso
      wciąż aktywne → cała grupa (wszystkie 3) przesuwa się razem (potwierdzone live:
      `store.getState()` przed/po — wszystkie trzy `y` +60 o identyczny delta)
- [x] ✅ 37. Klik dokładnie na NIEzaznaczonym wierzchołku, Lasso wciąż aktywne → dalej zaczyna nową
      ścieżkę lasso zamiast przeciągać wierzchołek (e2e `vector-edit.spec.ts` row 240, niezmieniony
      test dalej przechodzi — dowód że fix nie poszedł za daleko)

Regresja + nowa logika pokryta jednostkowo w `armResolvers.spec.ts` (8 nowych testów,
`armVectorLassoOnPointerDown` describe block: trafienie w zaznaczony/niezaznaczony wierzchołek,
uchwyt, segment, oraz box) i nowym `isPointOnVectorMultiSelectBox.spec.ts` — całość 100%
branch/function/line/statement coverage. e2e: `vector-edit.spec.ts` row 262 (nowy, przeciąganie z
zaznaczonego wierzchołka przesuwa całą grupę) obok niezmienionego row 240.

**e2e**: `e2e/pages/design/multi-vector-edit.spec.ts`, `TEST_CASES.md` rows 260-261 — cross-node box
drag-move (dwa osobne trójkąty, marquee po obu, drag za wnętrze boxa), i box aktywny dla samego
zaznaczonego segmentu (jeden trójkąt, przekątna krawędź, drag przesuwa oba końce razem).
