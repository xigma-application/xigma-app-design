import { PDFContext, PDFDict, PDFName } from 'pdf-lib';

// utils
import { registerPdfPatternInDict } from '../registerPdfPatternInDict';

describe('registerPdfPatternInDict', () => {
  it('should register a pattern dict under the given resources and return its unique name', () => {
    // before
    const context = PDFContext.create();
    const resources = PDFDict.withContext(context);

    // action
    const name = registerPdfPatternInDict(resources, { PatternType: 2, Shading: { ShadingType: 2 } });

    // result
    const patternResources = resources.lookupMaybe(PDFName.of('Pattern'), PDFDict) as PDFDict;
    const registered = patternResources.lookup(name) as PDFDict;

    expect(registered.get(PDFName.of('PatternType'))?.toString()).toBe('2');
  });

  it('should give each registered pattern a distinct name', () => {
    // before
    const context = PDFContext.create();
    const resources = PDFDict.withContext(context);

    // action
    const first = registerPdfPatternInDict(resources, { PatternType: 2 });
    const second = registerPdfPatternInDict(resources, { PatternType: 2 });

    // result
    expect(first.asString()).not.toBe(second.asString());
  });
});
