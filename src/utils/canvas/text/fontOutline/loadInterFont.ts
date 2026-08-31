import { Font, parse } from 'opentype.js';

// others
import interFontUrl from 'assets/fonts/inter/source/Inter-Regular.ttf';

let fontPromise: Promise<Font> | null = null;

export const loadInterFont = (): Promise<Font> => {
  fontPromise ??= fetch(interFontUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => parse(buffer));

  return fontPromise;
};
