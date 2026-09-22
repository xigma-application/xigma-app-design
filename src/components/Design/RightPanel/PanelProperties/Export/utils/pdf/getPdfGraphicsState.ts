import { PDFName, PDFPage } from 'pdf-lib';

export const getPdfGraphicsState = (page: PDFPage, opacity: number, cache: Map<number, PDFName>): PDFName => {
  const cachedName = cache.get(opacity);

  if (!cachedName) {
    const { context } = page.doc;
    const name = PDFName.of(`XigmaOpacity${cache.size}`);

    page.node.setExtGState(name, context.register(context.obj({ CA: opacity, Type: 'ExtGState', ca: opacity })));
    cache.set(opacity, name);

    return name;
  }

  return cachedName;
};
