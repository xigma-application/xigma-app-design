# Cut Tool (Split + Divide) — Live Browser Test Log

Aktualizowane na żywo w trakcie testowania w przeglądarce (Playwright MCP). ✅ = przeszło, ❌ = nie przeszło (opis błędu obok), ⏳ = jeszcze nie testowane, ⚠️ = testowane częściowo/niekonkluzywnie.

Kontekst: implementacja obu trybów Cut (Split — klik, bez rozdzielania na warstwy; Divide —
przeciągnięcie linii tnącej, dzieli na osobne node'y) wraz z pełnym wiring (ToolName.cut, skrót 'X',
VectorEditToolbar, ARM_RESOLVERS). 100% coverage jednostkowe (3582+ testów) potwierdzone przed tym
logiem.

## 0. Prawdziwy bug znaleziony właśnie przez live-testing (naprawiony)

Pierwsza wersja `armVectorCutOnPointerDown` uzbrajała drag TYLKO gdy pointerdown trafiał od razu w
segment/wierzchołek (na wzór Bend/segment-click resolverów). To był błąd projektowy — user wprost
potwierdził, że drag Divide może zaczynać się z zewnątrz kształtu, ze środka, albo dokładnie na krawędzi,
nie tylko "na trafieniu". Naprawione: resolver uzbraja się BEZWARUNKOWO, gdy Cut jest aktywny i tryb
edycji włączony (jak Lasso/Marquee) — `hit` (jeśli jest) zapisywany jest tylko na wypadek, gdyby drag
nigdy nie przekroczył progu i skończył się jako zwykły klik (Split). Znalezione właśnie dzięki temu, że
live-test **faktycznie użył realnego dragu myszą** zamiast bezpośredniego wywołania funkcji — dowód na
to, że live-testing przez UI jest niezastąpiony i nie zastępuje go wywołanie logiki wprost z kodu.

Przy okazji znaleziona i naprawiona przyczyna, dla której wcześniejsze próby (syntetyczne
`dispatchEvent` i trustowane `page.mouse`) w ogóle nie rejestrowały kliknięć: `LeftPanel`/`RightPanel`
to nieprzezroczyste nakładki na canvas (`LEFT_PANEL_WIDTH = 500`, `RIGHT_PANEL_WIDTH = 240`, patrz
`e2e/pages/design/model/DesignPage.ts`) — wcześniejsze testy klikały w x < 500, czyli w obszar zasłonięty.

## 1. Wiring narzędzia

- [x] ✅ 1. Skrót 'X' przełącza na Cut, gdy jesteśmy w Vector Edit Mode — potwierdzone live
      (`window.dispatchEvent(KeyboardEvent{code:'KeyX'})`, realny store, `activeTool` → `'cut'`).
- [x] ✅ 2. VectorEditToolbar pokazuje "Wytnij" jako aktywny przycisk (podświetlony na niebiesko) gdy
      `activeTool === 'cut'` — potwierdzone zrzutem ekranu, poprawne tłumaczenie PL.
- [x] ✅ 3. Cut nieaktywny/zablokowany poza Vector Edit Mode — permanentny e2e (`cut.spec.ts`): skrót 'x'
      wciąż przełącza `activeTool`, ale realny drag bez otwartego node'a nic nie zmienia
      (`armVectorCutOnPointerDown` gate'uje na `vectorEditingNodeIds`, nie sam wybór narzędzia).

## 2. Split mode (klik)

- [x] ✅ 4. Realny klik myszą (bez ruchu, `mouse.down()` → `mouse.up()`) dokładnie na środku segmentu →
      przerywa ciągłość w tym miejscu, **NIE tworzy nowego node'a** (`rootOrderLength` pozostało `1`).
      Segment oryginalny (`s1`) teraz kończy się na nowym wierzchołku, nowy segment zaczyna się na
      INNYM nowym wierzchołku — oba w tym samym miejscu (800,400), bez wspólnego id. Potwierdzone live
      realnym kliknięciem myszy, nie wywołaniem funkcji wprost.
- [ ] ⏳ 5. Klik dokładnie na istniejący wierzchołek (degree-2) → odłącza tylko ten jeden segment —
      niepotwierdzone live UI (potwierdzone tylko jednostkowo), mechanizm identyczny do #4.
- [x] ✅ 6. Klik na wierzchołek rozgałęzienia (3+ segmenty) → odłącza TYLKO kliknięty segment —
      permanentny e2e (`cut.spec.ts`, realny klik na "Y"-kształcie zbudowanym przez Pen), oprócz
      pokrycia jednostkowego (`severVectorSegmentAtPoint.spec.ts`).

## 3. Divide mode (przeciągnięcie)

- [x] ✅ 7. Przeciągnięcie linii przez wypełniony kwadrat, start i koniec POZA kształtem → **live
      preview**: różowa linia + dwie różowe kropki dokładnie na przecięciach z lewą/prawą krawędzią,
      widoczne PODCZAS trzymania LPM (zrzut ekranu mid-drag). Potwierdzone realnym dragiem myszą
      (`page.mouse.move/down/move.../up`), nie wywołaniem funkcji.
- [x] ✅ 8. Po puszczeniu: kwadrat dzieli się na 2 node'y, każdy z 4 wierzchołkami, każdy z realnym,
      poprawnym `filledFaceKeys` w formacie `id[v:x|v:y]`. Potwierdzone i strukturalnie (dane store), i
      **wizualnie** — zrzut ekranu pokazuje dwa niezależnie wypełnione prostokąty (zielony/fioletowy,
      każdy własny deterministyczny kolor per-loop), oba nadal otwarte w edycji (białe kropki
      wierzchołków widoczne na obu).
- [x] ✅ 9. Cięcie kwadrata BEZ wypełnienia → obie połówki bez fill — permanentny e2e (`cut.spec.ts`).
- [x] ✅ 10. Linia tnąca mija węzeł całkowicie → węzeł zupełnie nietknięty — permanentny e2e (`cut.spec.ts`,
      `toEqual` na całym node przed/po).
- [x] ✅ 11. Linia przecina jedną krawędź zamkniętego trójkąta raz → nic się nie dzieli (pozostałe dwie
      krawędzie wciąż łączą oba kawałki) — permanentny e2e (`cut.spec.ts`).
- [x] ✅ 12. 2 otwarte node'y, jedno przeciągnięcie tnie oba → do 4 wynikowych node'ów, jeden krok Undo
      cofa wszystko naraz — permanentny e2e (`cut-multi.spec.ts`, real drag across 2 open nodes + real
      Control+Z), plus osobny scenariusz gdzie drag trafia tylko JEDEN z dwóch otwartych node'ów.

## 4. Prawdziwy bug znaleziony przez usera live (naprawiony) — środkowy fill ginął przy cięciu >2 segmentów

Zgłoszenie: kształt-"namiot" (3 sąsiadujące, różnie wypełnione trójkąty: lewy/pomarańczowy, środkowy/teal,
prawy/niebieski, dzielące krawędzie) przecięty poziomo tracił wypełnienie środkowego (teal) fragmentu na
obu połówkach, mimo że lewy i prawy fragment domykały się poprawnie.

Przyczyna: `addCutClosingSegment.ts` parował nowo powstałe "otwarte końce" po cięciu globalnie, w kolejności
pozycji na linii cięcia, naprzemiennie (0,1), (2,3), (4,5)... Dla cięcia przez 4 segmenty (lewa krawędź,
lewa przekątna, prawa przekątna, prawa krawędź — punkty A,E,F,D w kolejności na linii) dawało to domknięcia
A-E i F-D (poprawne dla skrajnych, pomarańczowego i niebieskiego trójkąta), ale segment E-F — jedyny, który
domyka środkowy (teal) kawałek po obu stronach cięcia — nigdy nie powstawał, bo naprzemienne parowanie
zawsze go pomija. Globalne parowanie miesza ze sobą przecięcia należące do RÓŻNYCH oryginalnych twarzy
zamiast każdą domykać osobno.

Naprawa: parowanie przeniesione na poziom pojedynczej oryginalnej twarzy (`node.filledFaceKeys`) —
każda twarz domykana niezależnie na podstawie tego, które realne segmenty (z jej pieceKeys) przecina linia
cięcia. Punkt wspólny dwóch sąsiednich twarzy (np. E, granica orange/teal) bierze udział w domknięciu obu
— tworząc punkt rozgałęzienia, tak jak przed cięciem. `addCutClosingSegment` przyjmuje teraz też
`originalFilledFaceKeys` i `crossings` (przewleczone przez `commitVectorDivide.ts`).

- [x] ✅ 13. Regresja jednostkowa: 3 sąsiadujące twarze dzielące przecięte segmenty (huby-gwiazda a-b-c-d
      wokół h, sekwencyjnie dzielone segmenty) → 3 domknięcia (a-b, b-c, c-d), nie 2
      (`addCutClosingSegment.spec.ts`) + end-to-end przez `commitVectorDivide` na prawdziwym "namiocie"
      (3 wykryte twarze, oba wynikowe node'y po 3 wypełnione twarze) — `commitVectorDivide.spec.ts`.
- [x] ✅ 14. Potwierdzone live (Playwright MCP, realny drag myszą + realny klik "Wytnij" w toolbarze): namiot
      wstrzyknięty przez store (3 różne kolory pomalowane przez `deriveVectorFaces`), poziome cięcie przez
      wszystkie 4 skośne krawędzie — zrzut ekranu mid-drag pokazuje różową linię z 4 kropkami przecięć;
      po puszczeniu obie połówki mają WSZYSTKIE 6 pod-regionów wypełnionych (6 różnych deterministycznych
      kolorów, żaden fragment nie zniknął), potwierdzone też strukturalnie: oba wynikowe node'y mają
      `filledFaceKeys.length === 3`. 100% coverage utrzymane (`npm run test:coverage`), `tsc --noEmit` czysty.

## 5. Prawdziwy bug znaleziony przez usera live (naprawiony) — utrata fragmentu fill nawet przy zwykłym cięciu, nie tylko blisko wierzchołka

Zgłoszenie: user potwierdził, że anomalia (fragment fill znika po cięciu) zdarza się też przy **zwykłym**
cięciu (nie tylko blisko istniejącego wierzchołka) — "raz na 5 razy". Pierwsza poprawka (§4) nie
wystarczała.

Przyczyna, znaleziona testem wytrzymałościowym (setki/tysiące losowych cięć nieregularnego
wieloktąta-"koła" z hubem, sprawdzanie zachowania **sumy powierzchni** wypełnienia, nie tylko liczby
twarzy — liczba twarzy legalnie się różni zależnie od tego po której stronie cięcia wypada hub):
ogólny `getStraightSegmentIntersection.ts` (współdzielony przez `deriveVectorFaces`/planaryzację, więc
dotyczy też Paint, nie tylko Cut) potrafi wykryć fantomowe przecięcie tam, gdzie go nie ma, na dwa
niezależne sposoby:

1. Dwa segmenty dzielące dokładnie wspólny wierzchołek (np. dwa spoke'i huba) — poprawnie uwarunkowany
   mianownik, ale rozwiązanie t/u ląduje ułamek promila od dokładnej granicy 0/1 (np.
   `t≈0.9999999999979919`) przez błąd zaokrągleń w łańcuchu wcześniejszych operacji zmiennoprzecinkowych.
   Tolerancja w przestrzeni t/u (`EPSILON=1e-7`) to złapała.
2. Dwa segmenty prawie równoległe (mianownik bliski zeru, np. `-7.7e-12`) — TA SAMA tolerancja t/u
   zawodzi, bo mikroskopijny błąd wejściowy przez bliski-zeru mianownik urasta do punktu przecięcia
   odległego o **kilka jednostek świata** od jakiegokolwiek wierzchołka, wciąż mieszczącego się
   "bezpiecznie" w środku przedziału (0,1). Znalezione dokładnie między dwoma nowymi segmentami
   domykającymi z §4 (naturalnie blisko-równoległymi, bo oba kierują się w stronę tego samego
   rejonu z różnych odległości).

Naprawa: dwa niezależne guardy zamiast jednej tolerancji t/u — (a) odrzucenie pary segmentów, gdy
`|mianownik|` jest za mały względem iloczynu ich długości (sinus kąta ~0, próg `1e-9`) — łapie
przypadek 2; (b) odrzucenie obliczonego punktu przecięcia, gdy leży bliżej niż `1e-4` jednostki
świata od któregokolwiek z 4 punktów definiujących oba segmenty — łapie przypadek 1, odporne na
uwarunkowanie mianownika.

- [x] ✅ 15. Regresja jednostkowa dla obu mechanizmów w `getStraightSegmentIntersection.spec.ts` (dokładne
      współrzędne z live-reprodukcji obu przypadków).
- [x] ✅ 16. Test wytrzymałościowy: 2000 w pełni losowych cięć (pozycja i kąt) nieregularnego
      6-twarzowego kształtu z hubem — **0 anomalii** (suma powierzchni po cięciu = suma przed cięciem,
      z tolerancją 1%, w każdej z 2000 prób). Przed poprawką: ~1.4% prób traciło realny fragment
      powierzchni (do 35% całości). Nieusunięty, świadomie zostawiony jako wiadome ograniczenie:
      ekstremalny przypadek cięcia DOKŁADNIE przez wierzchołek-hub o wysokim stopniu (~12% prób w
      syntetycznym teście specjalnie skonstruowanym pod ten przypadek) — user potwierdził, że to nie
      jego scenariusz.

## 6. Prawdziwy bug znaleziony przez usera live (naprawiony) — drugie cięcie tego samego (już raz ciętego) kawałka gubiło fill całkowicie

Zgłoszenie/repro: prostokąt narysowany i pomalowany, przecięty poziomo na 3 równe części (dwa osobne
cięcia Divide, bo jedna linia daje tylko 2 kawałki). Pierwsze cięcie działało poprawnie (góra + dół,
oba wypełnione). Drugie cięcie — przecinające DOLNY kawałek z pierwszego cięcia — dawało 2 nowe kawałki
oba **całkowicie bez fill**, mimo że górna (nietknięta) część nadal miała swój kolor. Złapane live w
przeglądarce zrzutem ekranu (widoczne puste, tylko-obrys prostokąty).

Przyczyna: własny bug wprowadzony poprawką z §4. `addCutClosingSegment` dopasowuje przecięcia tego
cięcia do oryginalnej twarzy przez `realSegmentIds.has(crossing.segmentId)` — ale `crossing.segmentId`
to ID segmentu W TEJ CHWILI (np. `s2#1`, fragment powstały przy PIERWSZYM cięciu, nazwany przez
`severSegmentAtCrossings`), podczas gdy `realSegmentIds` (wyciągnięte z `filledFaceKeys`) to zawsze
"czyste" ID bazowe (`s2`) — `getPieceKeys` w `deriveVectorFaces.ts` zawsze obcina sufiks `#N`. Przy
PIERWSZYM cięciu kawałka oba ID są identyczne (segment jeszcze nigdy nie był cięty), więc dopasowanie
działa przypadkiem. Przy DRUGIM cięciu tego samego kawałka — nigdy się nie zgadzają, więc żadna para
nie zostaje domknięta, fill ginie na obu nowych kawałkach.

Naprawa: `crossing.segmentId` jest teraz też obcinane do bazowego ID (`.split('#')[0]`) przed
porównaniem z `realSegmentIds`.

- [x] ✅ 17. Regresja jednostkowa w `addCutClosingSegment.spec.ts` (fragment-owy `segmentId` typu
      `left#1` wciąż poprawnie dopasowuje twarz referencyjną `left`) + end-to-end w
      `commitVectorDivide.spec.ts` (kwadrat cięty dwa razy z rzędu, drugie cięcie na już-raz-ciętym
      kawałku → wszystkie 3 wynikowe kawałki nadal wypełnione).
- [x] ✅ 18. Potwierdzone live (Playwright MCP): prostokąt narysowany/pomalowany przez store, dwa
      realne przeciągnięcia myszą (Wytnij) w 1/3 i 2/3 wysokości → zrzut ekranu pokazuje 3 równe,
      niezależnie wypełnione części (niebieska/fioletowa/zielona), żadna pusta. 100% coverage
      (`npm run test:coverage`), `tsc --noEmit` czysty.

## 7. Permanentne pokrycie e2e (`e2e/pages/design/cut.spec.ts`, `cut-multi.spec.ts`)

Wszystkie powyższe live-MCP demo (jednorazowe, nic nie zostawiają w repo) przekute na trwałe testy
Playwright — 15 scenariuszy razem, real `page.mouse`/`page.keyboard`, real
`store.getState()`/`updateNode` assercje, zero screenshot-only tam gdzie strukturalna asercja jest
precyzyjniejsza. Numeracja i szczegóły w `e2e/pages/design/TEST_CASES.md` (wiersze 265–277).
`cut.spec.ts` — pojedynczy node: wiring skrótu, oba tryby Split, wszystkie warianty Divide (linia na
zewnątrz obu stron, linia mijająca, jedna krawędź trójkąta, niewypełniony kształt), wszystkie 3
regresje z §4/§5/§6 (namiot, drugie cięcie, malowanie przez przecięcie), Undo. `cut-multi.spec.ts` —
2 otwarte node'y: cięcie trafia tylko w jeden, cięcie trafia w oba (4 kawałki), Undo cofa oba naraz.

`npx playwright test cut.spec.ts cut-multi.spec.ts` — 15/15 zielone.

## 8. Cięcie segmentu bez rozdzielania na dwa wektory (jak w Figmie)

Zgłoszenie: zrzuty ekranu pokazujące, że cięcie linią, która NIE przecina całego kształtu na wylot
(np. wchodzi przez jedną krawędź i kończy się w środku, albo przecina tylko JEDNĄ twarz
wielotwarzowego node'a bez odłączania jej od reszty konturu), powinno mimo to fizycznie przecinać
segmenty — tak jak w Figmie. Wskazane wprost: `commitVectorDivide.ts`'s `findVectorDivideResult`
(`components.length > 1` guard) to zabezpieczenie, które to blokuje — od niego trzeba zacząć.

**Trzy podejścia, dwa odrzucone live przez usera na podstawie realnego repro:**

1. **Wklejenie linii jako wspólnej, NIE-rozłączającej geometrii** (mechanizm Paint'a,
   `persistVectorNetworkCrossings` — jeden dzielony wierzchołek na przecięcie). Fill przetrwał
   automatycznie, wyglądało dobrze na zrzucie ekranu — ALE user odrzucił po zobaczeniu realnych
   danych wierzchołków: "cięcie miało ciąć, nie tworzyć point" i "segmenty powinny być oderwane od
   siebie" — potwierdzone zrzutem z Figmy (przeciągnięcie jednego rogu niezależnie zniekształca
   TYLKO ten kawałek, drugi zostaje idealnym prostokątem). Wspólny wierzchołek nigdy tego nie da;
   istniejący `severVectorSegmentAtPoint` (Split) już ustanawia właściwy precedens (2 rozłączne
   punkty w tym samym miejscu).
2. **Zawsze severować każde przecięcie na 2 rozłączne punkty** (jak Split), z DUBLOWANĄ cięciwą (2
   niezależne kopie, po jednej na nową pod-twarz) dla odcinka między dwoma sąsiednimi przecięciami.
   To naprawiło niezależność — ale samo zostawienie `filledFaceKeys` bez zmian (jak robi Split)
   okazało się polegać na artefakcie: ogólny spacer po twarzach (`deriveVectorFaces`) potrafi
   "wyjść do martwego końca i wrócić" jako zerowy kolec, więc dla zwykłego kwadratu z 1 odciętą
   krawędzią WCIĄŻ znajduje "zamkniętą" twarz i fill przetrwał — a dla IDENTYCZNEGO odcięcia na
   kwadracie z wewnętrzną cięciwą NIE (potwierdzone bezpośrednim porównaniem obu scenariuszy).
   Sprzecznie z Figmą tak czy inaczej: live repro usera pokazał, że NOWO przecięte kawałki TRACIŁY
   fill, a nietknięta-z-pozoru twarz go ZACHOWAŁA — odwrotnie niż powinno być.
3. **Wdrożone: zawsze severuj (zawsze 2 punkty), ale licz `filledFaceKeys` jawnie**, zamiast polegać
   na tym co przypadkiem wciąż znajdzie `deriveVectorFaces`. Twarz dziedziczy fill tylko jeśli jej
   środek ciężkości (`getPolygonCentroid`) trafia w oryginalnie wypełnioną twarz (`getVectorFaceAtPoint`)
   ORAZ żaden z jej `pieceKeys` nie odwołuje się do "osieroconego" kawałka po IZOLOWANYM przecięciu
   (przecięcie bez cięciwy po żadnej stronie) — to właśnie usuwa artefakt kolca: nieważne czy spacer
   wciąż coś "zamknie", martwy kawałek nigdy legalnie niczego nie zamyka.

**Efekt końcowy, zgodny ze skorygowanym przez usera modelem:** twarz CZYSTO podzielona cięciwą (2
sąsiednie przecięcia, oba tworzące realny wewnętrzny odcinek) dostaje fill skopiowany na OBIE nowe,
niezależne części — jak w Figmie. Twarz dotknięta tylko IZOLOWANYM przecięciem (bez cięciwy po żadnej
stronie — linia weszła i nie wyszła z powrotem, albo przecięty segment był "przy okazji" dla cięcia
INNEJ twarzy) traci fill całkowicie, tak jak zwykły klik Split — nawet jeśli jej pozostała granica
wygląda nietknięta, bo to właśnie ta jedna krawędź, która musiała zostać zamknięta, padła ofiarą cięcia.

`commitVectorDivide.ts` (teraz osobny folder `commitVectorDivide/`, jedna funkcja na plik) najpierw
próbuje istniejącej (niezmienionej) logiki pełnego Divide dla każdego node'a; dla node'ów, które się
nie rozdzielają, dokłada fallback (`findVectorConnectedCutResult` → `materializeVectorNetworkCut`)
zamiast całkowicie odrzucać wynik.

- [x] ✅ 19. Zweryfikowane live (Playwright MCP, wielokrotnie, po każdej z 3 iteracji): kwadrat z
      wewnętrzną cięciwą (2 niezależnie pomalowane twarze), cięcie linią przez górną krawędź +
      cięciwę. Finalny, poprawny wynik: `rootOrder` bez zmian (brak nowego node'a), obie nowe
      górne części WYPEŁNIONE (własny kolor każda), dolna twarz BEZ fill. Zrzut ekranu i realne
      przeciągnięcie myszą w store potwierdzają pełną niezależność (różne id wierzchołków, nic
      ich nie łączy).
- [x] ✅ 20. Permanentny e2e: `cut.spec.ts`, 4 nowe testy (`TEST_CASES.md` wiersze 278–281) —
      severing z utratą fill, czysty split cięciwą z dziedziczeniem fill na obie części, izolowane
      przecięcie zostawiające nietkniętą twarz bez zmian, oraz 3-pasmowy node potwierdzający że
      GENUINE nietknięta trzecia twarz przetrwała a tylko collateral-dotknięta traci fill.
      Jednostkowo: `materializeVectorNetworkCut.spec.ts` (5 przypadków, 100% branch coverage) +
      dopasowane przypadki w `commitVectorDivide.spec.ts`. Cała gałąź `cutVectorNetwork` +
      `disarmVectorCutDrag`: 86/86 testów, 100% pokrycia. `cut.spec.ts`+`cut-multi.spec.ts`:
      19/19 zielone.
