import { PDFDict, PDFName, PDFPage } from 'pdf-lib';

// utils
import { registerPdfPatternInDict } from './registerPdfPatternInDict';

export const registerPdfPattern = (page: PDFPage, patternDict: Record<string, unknown>): PDFName => {
  page.node.normalizedEntries();

  return registerPdfPatternInDict(page.node.Resources() as PDFDict, patternDict);
};
