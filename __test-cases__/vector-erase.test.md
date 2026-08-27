# Erase Tool (Vector) — Live Browser Test Log

Aktualizowane na żywo w trakcie testowania w przeglądarce (Playwright MCP). ✅ = przeszło,
❌ = nie przeszło, ⏳ = jeszcze nie testowane, ⚠️ = częściowo/niekonkluzywnie.

Kontekst: `ToolName.erase`, `Shift+E`, obok Cut w `VectorEditToolbar`. Okrągły pędzel — przeciąganie
przecina każdy dotknięty segment w miejscach wejścia/wyjścia okręgu i kasuje tylko przykryty kawałek
(zostawiając nowe, edytowalne wierzchołki); segmenty w całości przykryte kasowane w całości; węzeł
NIGDY nie dzielony na warstwy; dziura w wypełnieniu to efekt uboczny re-derywacji faces. `[` / `]`
zmieniają średnicę (domyślnie 10 px ekranu, clamp `[1, 100]`), ref sesyjny, nie undo. Pełny opis:
`.claude/docs/vector-network.md` §66. 100% coverage jednostkowe (4566 testów) potwierdzone przed tym
logiem.

## 0. Znaleziony bug (nie w kodzie feature'a) — stale Vite dep cache

Pierwsza próba live: `VectorEditToolbar` crashował z "Check the render method of `Icon` … got:
undefined" na przycisku Wymaż. Przyczyna: dev server zoptymalizował `@xigma/components` do
`node_modules/.vite/deps/` **przed** `npm run xigma:pull`, który dodał ikonę `EraseTool` — przeglądarka
dostawała nieaktualny bundle bez `EraseTool`. Testy jednostkowe importują `dist/index.js` wprost (bez
Vite optimize), więc przechodziły. Naprawa: `rm -rf node_modules/.vite` + restart dev servera.
(Wniosek na przyszłość: po każdym `xigma:pull` który zmienia eksporty `@xigma/*` trzeba wyczyścić
cache Vite albo zrestartować dev server.)

## 1. Aktywacja i toolbar

| #   | Scenariusz                                                                           | Wynik |
| --- | ------------------------------------------------------------------------------------ | ----- |
| 1   | `Shift+E` w trybie Vector Edit → `activeTool === 'erase'`                            | ✅    |
| 2   | Przycisk "Wymaż" (ikona gumki) renderuje się w `VectorEditToolbar` obok "Wytnij"     | ✅    |
| 3   | Kliknięcie "Wymaż" ustawia je jako aktywne (niebieskie), poprzednie narzędzie gaśnie | ✅    |

## 2. Wymazywanie

| #   | Scenariusz                                                                                                                                                                                    | Wynik |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 4   | Przeciągnięcie pędzla przez środek górnej krawędzi kwadratu (4 segm.) → 5 segmentów, 6 wierzchołków (dwie nowe końcówki w miejscach cięcia)                                                   | ✅    |
| 5   | `rootOrder` i `vectorEditingNodeIds.length` bez zmian — węzeł NIE rozdzielony na warstwy                                                                                                      | ✅    |
| 6   | Wypełnienie (`Maluj` przed wymazaniem) znika po przerwaniu granicy — `filledFaceKeys` zachowane, ale brak pasującej derived-face, więc nic się nie renderuje (self-heal przy zamknięciu luki) | ✅    |
| 7   | Narzędzie **zostaje** aktywne po zakończeniu pociągu (kolejny pociąg bez ponownego wyboru)                                                                                                    | ✅    |
| 8   | Podgląd — cienki okrąg pędzla śledzi kursor (i w trakcie pociągu, i przy zwykłym najechaniu)                                                                                                  | ✅    |

## 3. Średnica `[` / `]`

| #   | Scenariusz                                                                                  | Wynik |
| --- | ------------------------------------------------------------------------------------------- | ----- |
| 9   | `]` ×15 → jeden dab na krawędzi zostawia lukę ~25 px (≈ średnica) zamiast ~10 px domyślnych | ✅    |
| 10  | Większy pędzel widocznie większy na ekranie (okrąg podglądu)                                | ✅    |

## 4. Undo / redo

| #   | Scenariusz                                                                                   | Wynik |
| --- | -------------------------------------------------------------------------------------------- | ----- |
| 11  | `Cmd+Z` po pociągu wymazywania cofa **cały** pociąg jednym ruchem (5 segm./6 wierzch. → 4/4) | ✅    |
| 12  | `Cmd+Shift+Z` przywraca (4/4 → 5/6)                                                          | ✅    |
| —   | (uwaga: skrót to `Cmd+Z` na macOS, nie `Ctrl+Z` — `CONTROL_PRIMARY_KEY` → meta)              |       |
