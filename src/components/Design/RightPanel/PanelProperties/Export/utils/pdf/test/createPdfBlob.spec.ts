import { readFileSync } from 'fs';
import { decodePDFRawStream, PDFDocument, PDFRawStream } from 'pdf-lib';

// store
import { selectNodes } from 'store/design/selectors';
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../../enums';
import { NodeType } from 'types/design/enums';

// utils
import { createPdfBlob } from '../createPdfBlob';

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));
vi.mock('../loadPdfFontBytes', () => ({
  loadPdfFontBytes: (): Promise<ArrayBuffer> =>
    Promise.resolve(new Uint8Array(readFileSync('src/assets/fonts/inter/source/Inter-Regular.ttf')) as unknown as ArrayBuffer),
}));

const PNG_1X1 = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
  (char) => char.charCodeAt(0),
);

const readPdfContent = async (blob: Blob | null): Promise<string> => {
  const pdf = await readPdf(blob);

  return pdf.context
    .enumerateIndirectObjects()
    .map(([, object]) => (object instanceof PDFRawStream ? new TextDecoder('latin1').decode(decodePDFRawStream(object).decode()) : ''))
    .join('\n');
};

const readPdf = async (blob: Blob | null): Promise<PDFDocument> => {
  const bytes = await new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader();

    reader.onload = (): void => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob as Blob);
  });

  return PDFDocument.load(bytes);
};

describe('createPdfBlob', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    renderNodeForExportMock.mockReset();
    createImageBlobFromPixelsMock.mockReset();
    renderNodeForExportMock.mockResolvedValue({ height: 1, pixels: new Uint8Array(4), width: 1 });
    createImageBlobFromPixelsMock.mockResolvedValue({ arrayBuffer: () => Promise.resolve(PNG_1X1.buffer) });
  });

  it('should return null when the node does not exist', async () => {
    // action
    const result = await createPdfBlob('missing', 2, true, ExportImageResampling.detailed);

    // result
    expect(result).toBeNull();
  });

  it('should build one page sized like the node with a raster layer under real text', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: ['pdf-text'],
            clipContent: false,
            fills: [{ opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' }],
            height: 80,
            id: 'pdf-frame',
            name: 'Frame',
            parentId: null,
            rotation: 0,
            type: NodeType.frame,
            width: 120,
            x: 0,
            y: 0,
          },
          {
            content: 'Hi',
            fill: '#000000',
            flipX: false,
            flipY: false,
            fontFamily: 'Inter',
            fontSize: 16,
            height: 20,
            id: 'pdf-text',
            name: 'Label',
            parentId: 'pdf-frame',
            rotation: 0,
            type: NodeType.text,
            width: 60,
            x: 10,
            y: 10,
          },
        ],
        rootIds: ['pdf-frame'],
      }),
    );

    // action
    const blob = await createPdfBlob('pdf-frame', 2, true, ExportImageResampling.basic);
    const pdf = await readPdf(blob);

    // result
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ height: 80, width: 120 });
    expect(renderNodeForExportMock).toHaveBeenCalledTimes(1);
    expect(renderNodeForExportMock).toHaveBeenCalledWith('pdf-frame', 2, true, ExportImageResampling.basic, new Set(['pdf-frame']));
  });

  it('should skip a raster layer that could not be rendered or encoded', async () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' }],
        height: 30,
        name: 'Rect',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 40,
        x: 0,
        y: 0,
      }),
    );

    const rectId = Object.keys(selectNodes(store.getState())).slice(-1)[0];

    renderNodeForExportMock.mockResolvedValueOnce(null);

    // action
    const withoutRender = await readPdf(await createPdfBlob(rectId, 2, true, ExportImageResampling.basic));

    createImageBlobFromPixelsMock.mockResolvedValueOnce(null);

    const withoutBlob = await readPdf(await createPdfBlob(rectId, 2, true, ExportImageResampling.basic));

    // result
    expect(withoutRender.getPage(0).getSize()).toEqual({ height: 30, width: 40 });
    expect(withoutBlob.getPage(0).getSize()).toEqual({ height: 30, width: 40 });
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledTimes(1);
  });

  it('should draw a solid rectangle with a stroke as real vector paths without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
            height: 30,
            id: 'pdf-rect',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            strokeWidth: 2,
            strokes: [{ color: '#0000ff', opacity: 50, type: 'solid' }],
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['pdf-rect'],
      }),
    );

    // action
    const text = await readPdfContent(await createPdfBlob('pdf-rect', 2, true, ExportImageResampling.basic));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('f*');
    expect(text).toContain('/XigmaOpacity0');
    expect(text).toContain('/XigmaOpacity1');
  });

  it('should draw a plain ellipse as a real vector path without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fill: '#00ff00',
            height: 30,
            id: 'pdf-ellipse',
            name: 'Ellipse',
            parentId: null,
            rotation: 0,
            type: NodeType.ellipse,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['pdf-ellipse'],
      }),
    );

    // action
    const text = await readPdfContent(await createPdfBlob('pdf-ellipse', 2, true, ExportImageResampling.basic));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('f*');
  });
});
