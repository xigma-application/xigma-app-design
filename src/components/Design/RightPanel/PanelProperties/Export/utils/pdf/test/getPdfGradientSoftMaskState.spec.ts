import { PDFDict, PDFDocument, PDFName, PDFStream } from 'pdf-lib';

// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfGradientSoftMaskState } from '../getPdfGradientSoftMaskState';

const bounds = { height: 100, width: 200, x: 0, y: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];
const paint: TGradientPaint = {
  end: { x: 10, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 50, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('getPdfGradientSoftMaskState', () => {
  it('should register a luminosity soft-mask ExtGState whose mask group paints the gradient with a gray alpha shading', async () => {
    // before
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([200, 100]);

    // action
    const name = getPdfGradientSoftMaskState(page, paint, polygons, bounds, bounds);

    // result
    const extGStates = page.node.normalizedEntries().ExtGState;
    const extGStateRef = extGStates.get(name);
    const extGState = page.doc.context.lookup(extGStateRef, PDFDict);
    const smask = extGState.lookup(PDFName.of('SMask'), PDFDict);

    expect(smask.lookup(PDFName.of('S'), PDFName).toString()).toBe('/Luminosity');

    const formXObject = page.doc.context.lookup(smask.get(PDFName.of('G')), PDFStream);
    const formDict = formXObject.dict;

    expect(formDict.lookup(PDFName.of('Subtype'), PDFName).toString()).toBe('/Form');

    const group = formDict.lookup(PDFName.of('Group'), PDFDict);

    expect(group.lookup(PDFName.of('CS'), PDFName).toString()).toBe('/DeviceGray');

    const content = formXObject.getContentsString();

    expect(content).toContain('/Pattern cs');
    expect(content).toContain('f*');

    const resources = formDict.lookup(PDFName.of('Resources'), PDFDict);
    const patternResources = resources.lookup(PDFName.of('Pattern'), PDFDict);
    const [patternName] = patternResources.keys();
    const patternDict = page.doc.context.lookup(patternResources.get(patternName), PDFDict);
    const shading = patternDict.lookup(PDFName.of('Shading'), PDFDict);

    expect(shading.lookup(PDFName.of('ColorSpace'), PDFName).toString()).toBe('/DeviceGray');
  });
});
