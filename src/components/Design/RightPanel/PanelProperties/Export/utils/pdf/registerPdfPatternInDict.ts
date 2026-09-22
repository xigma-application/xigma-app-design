import { PDFDict, PDFName } from 'pdf-lib';

export const registerPdfPatternInDict = (resources: PDFDict, patternDict: Record<string, unknown>): PDFName => {
  const { context } = resources;
  const pattern = resources.lookupMaybe(PDFName.of('Pattern'), PDFDict) ?? context.obj({});

  resources.set(PDFName.of('Pattern'), pattern);

  const name = pattern.uniqueKey('XigmaPattern');

  pattern.set(name, context.register(context.obj(patternDict as never)));

  return name;
};
