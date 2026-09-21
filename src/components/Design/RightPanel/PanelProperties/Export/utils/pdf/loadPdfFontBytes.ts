// others
import interFontUrl from 'assets/fonts/inter/source/Inter-Regular.ttf';

let fontBytesPromise: Promise<ArrayBuffer> | null = null;

export const loadPdfFontBytes = (): Promise<ArrayBuffer> => {
  fontBytesPromise ??= fetch(interFontUrl).then((response) => response.arrayBuffer());
  return fontBytesPromise;
};
