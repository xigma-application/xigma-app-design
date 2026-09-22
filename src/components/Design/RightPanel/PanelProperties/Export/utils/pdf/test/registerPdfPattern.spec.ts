import { PDFDict, PDFDocument, PDFName } from 'pdf-lib';

// utils
import { registerPdfPattern } from '../registerPdfPattern';

describe('registerPdfPattern', () => {
  it('should register a pattern dict under the page Resources and return its unique name', async () => {
    // before
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([100, 100]);

    // action
    const name = registerPdfPattern(page, { PatternType: 2, Shading: { ShadingType: 2 } });

    // result
    const resources = page.node.Resources() as PDFDict;
    const patternResources = resources.lookupMaybe(PDFName.of('Pattern'), PDFDict) as PDFDict;
    const registered = patternResources.lookup(name) as PDFDict;

    expect(registered.get(PDFName.of('PatternType'))?.toString()).toBe('2');
  });

  it('should give each registered pattern a distinct name', async () => {
    // before
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([100, 100]);

    // action
    const first = registerPdfPattern(page, { PatternType: 2 });
    const second = registerPdfPattern(page, { PatternType: 2 });

    // result
    expect(first.asString()).not.toBe(second.asString());
  });
});
