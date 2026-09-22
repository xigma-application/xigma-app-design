import { PDFDict, PDFName, PDFPage } from 'pdf-lib';

export const registerPdfPattern = (page: PDFPage, patternDict: Record<string, unknown>): PDFName => {
  page.node.normalizedEntries();

  const { context } = page.doc;
  const resources = page.node.Resources() as PDFDict;
  const pattern = resources.lookupMaybe(PDFName.of('Pattern'), PDFDict) ?? context.obj({});

  resources.set(PDFName.of('Pattern'), pattern);

  const name = pattern.uniqueKey('XigmaPattern');

  pattern.set(name, context.register(context.obj(patternDict as never)));

  return name;
};
