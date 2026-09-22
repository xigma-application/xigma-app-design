import { readFileSync } from 'fs';
import { decodePDFRawStream, PDFDocument, PDFRawStream } from 'pdf-lib';

// store
import { selectNodes } from 'store/design/selectors';
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../../enums';
import { NodeType, PathType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createPdfBlob } from '../createPdfBlob';

const JPEG_QUALITY = 0.92;

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();
const getTextFlattenVectorMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));
vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({
  getTextFlattenVector: (...args: unknown[]): unknown => getTextFlattenVectorMock(...args),
}));
vi.mock('../loadPdfFontBytes', () => ({
  loadPdfFontBytes: (): Promise<ArrayBuffer> =>
    Promise.resolve(new Uint8Array(readFileSync('src/assets/fonts/inter/source/Inter-Regular.ttf')) as unknown as ArrayBuffer),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (): { x: number; y: number }[] => [
    { x: 5, y: 5 },
    { x: 35, y: 5 },
    { x: 35, y: 25 },
  ],
}));

const PNG_1X1 = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
  (char) => char.charCodeAt(0),
);

const JPEG_1X1 = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  ),
  (char) => char.charCodeAt(0),
);

const readPdfContent = async (blob: Blob | null): Promise<string> => {
  const pdf = await readPdf(blob);

  return pdf.context
    .enumerateIndirectObjects()
    .map(([, object]) => (object instanceof PDFRawStream ? new TextDecoder('latin1').decode(decodePDFRawStream(object).decode()) : ''))
    .join('\n');
};

const hasDctDecodeFilter = async (blob: Blob | null): Promise<boolean> => {
  const pdf = await readPdf(blob);

  return pdf.context.enumerateIndirectObjects().some(([, object]) => object.toString().includes('DCTDecode'));
};

const readPdfObjectDictText = async (blob: Blob | null): Promise<string> => {
  const pdf = await readPdf(blob);

  return pdf.context
    .enumerateIndirectObjects()
    .map(([, object]) => object.toString())
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
    getTextFlattenVectorMock.mockReset();
    renderNodeForExportMock.mockResolvedValue({ height: 1, pixels: new Uint8Array(4), width: 1 });
    createImageBlobFromPixelsMock.mockImplementation((_pixels: Uint8Array, _width: number, _height: number, mimeType: string) =>
      Promise.resolve({ arrayBuffer: () => Promise.resolve((mimeType === 'image/jpeg' ? JPEG_1X1 : PNG_1X1).buffer) }),
    );
  });

  it('should return null when the node does not exist', async () => {
    // action
    const result = await createPdfBlob('missing', 2, true, ExportImageResampling.detailed, JPEG_QUALITY);

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
    const blob = await createPdfBlob('pdf-frame', 2, true, ExportImageResampling.basic, JPEG_QUALITY);
    const pdf = await readPdf(blob);

    // result
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ height: 80, width: 120 });
    expect(renderNodeForExportMock).toHaveBeenCalledTimes(1);
    expect(renderNodeForExportMock).toHaveBeenCalledWith('pdf-frame', 2, true, ExportImageResampling.basic, new Set(['pdf-frame']));
    expect(createImageBlobFromPixelsMock.mock.calls[0][3]).toBe('image/png');
  });

  it('should skip a png raster layer that could not be encoded when it is not the sole layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: ['pdf-text-2'],
            clipContent: false,
            fills: [{ opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' }],
            height: 80,
            id: 'pdf-frame-2',
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
            id: 'pdf-text-2',
            name: 'Label',
            parentId: 'pdf-frame-2',
            rotation: 0,
            type: NodeType.text,
            width: 60,
            x: 10,
            y: 10,
          },
        ],
        rootIds: ['pdf-frame-2'],
      }),
    );

    createImageBlobFromPixelsMock.mockResolvedValueOnce(null);

    // action
    const pdf = await readPdf(await createPdfBlob('pdf-frame-2', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(pdf.getPage(0).getSize()).toEqual({ height: 80, width: 120 });
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
    const withoutRender = await readPdf(await createPdfBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    createImageBlobFromPixelsMock.mockResolvedValueOnce(null);

    const withoutBlob = await readPdf(await createPdfBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(withoutRender.getPage(0).getSize()).toEqual({ height: 30, width: 40 });
    expect(withoutBlob.getPage(0).getSize()).toEqual({ height: 30, width: 40 });
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledTimes(1);
  });

  it('should encode a page that is entirely one raster layer as an opaque-white-flattened jpeg at the given quality', async () => {
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

    // action
    const blob = await createPdfBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY);

    // result
    expect(createImageBlobFromPixelsMock.mock.calls[0][3]).toBe('image/jpeg');
    expect(createImageBlobFromPixelsMock.mock.calls[0][4]).toBe(JPEG_QUALITY);
    expect(Array.from(createImageBlobFromPixelsMock.mock.calls[0][0] as Uint8Array)).toEqual([255, 255, 255, 255]);
    expect(await hasDctDecodeFilter(blob)).toBe(true);
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
    const text = await readPdfContent(await createPdfBlob('pdf-rect', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

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
    const text = await readPdfContent(await createPdfBlob('pdf-ellipse', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('f*');
  });

  it('should draw a plain line as a real vector path without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            id: 'pdf-line',
            name: 'Line',
            parentId: null,
            stroke: '#0000ff',
            type: NodeType.line,
            x1: 0,
            x2: 40,
            y1: 0,
            y2: 30,
          },
        ],
        rootIds: ['pdf-line'],
      }),
    );

    // action
    const text = await readPdfContent(await createPdfBlob('pdf-line', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('f*');
  });

  it('should draw a plain filled pen-tool vector node as a real vector path without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            defaultFill: [{ color: '#ff00ff', opacity: 100, type: 'solid' }],
            fillByKey: { face: [{ color: '#ff00ff', opacity: 100, type: 'solid' }] },
            filledFaceKeys: ['face'],
            id: 'pdf-vector',
            name: 'Vector',
            parentId: null,
            rotation: 0,
            segments: {
              s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
              s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
              s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
            },
            strokeColor: '',
            strokeWidth: 0,
            type: NodeType.vector,
            vertexHandleModes: {},
            vertices: {
              a: { id: 'a', x: 5, y: 5 },
              b: { id: 'b', x: 35, y: 5 },
              c: { id: 'c', x: 35, y: 25 },
            },
          },
        ],
        rootIds: ['pdf-vector'],
      }),
    );

    // action
    const text = await readPdfContent(await createPdfBlob('pdf-vector', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('f*');
  });

  it('should draw a linear gradient fill as a real axial shading pattern without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                // start/end are normalized 0..1 fractions of the shape's own bounds, not absolute
                // points — the shape below sits well away from the page origin specifically so this
                // test would fail if that normalization were skipped (a real bug caught in production:
                // treating them as absolute collapsed the gradient axis to a near-zero segment far
                // off-page, which rendered as one flat color)
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ff0000', opacity: 100, position: 0 },
                  { color: '#0000ff', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
            height: 30,
            id: 'pdf-linear',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 15,
            y: 22,
          },
        ],
        rootIds: ['pdf-linear'],
      }),
    );

    // action
    const blob = await createPdfBlob('pdf-linear', 2, true, ExportImageResampling.basic, JPEG_QUALITY);

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(await readPdfContent(blob)).toContain('/Pattern cs');
    expect(await readPdfObjectDictText(blob)).toContain('ShadingType 2');
  });

  it('should draw an angular gradient fill as a real function-based shading pattern without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                // normalized fractions (see the linear gradient test above for why)
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ff0000', opacity: 100, position: 0 },
                  { color: '#0000ff', opacity: 100, position: 1 },
                ],
                type: 'gradient-angular',
              },
            ],
            height: 30,
            id: 'pdf-angular',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 8,
            y: 12,
          },
        ],
        rootIds: ['pdf-angular'],
      }),
    );

    // action
    const blob = await createPdfBlob('pdf-angular', 2, true, ExportImageResampling.basic, JPEG_QUALITY);

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(await readPdfContent(blob)).toContain('/Pattern cs');

    const objectDictText = await readPdfObjectDictText(blob);

    expect(objectDictText).toContain('ShadingType 1');
    expect(objectDictText).toContain('FunctionType 4');
    expect(await readPdfContent(blob)).toContain('atan');
  });

  it('should draw a gradient with a translucent stop as a vector shading behind a luminosity soft mask, without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                // normalized fractions (see the linear gradient test above for why)
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ff0000', opacity: 100, position: 0 },
                  { color: '#0000ff', opacity: 50, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
            height: 30,
            id: 'pdf-translucent',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 33,
            y: 7,
          },
        ],
        rootIds: ['pdf-translucent'],
      }),
    );

    // action
    const blob = await createPdfBlob('pdf-translucent', 2, true, ExportImageResampling.basic, JPEG_QUALITY);

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(await readPdfContent(blob)).toContain('/Pattern cs');

    const objectDictText = await readPdfObjectDictText(blob);

    expect(objectDictText).toContain('/Luminosity');
    expect(objectDictText).toContain('/DeviceGray');
    expect(objectDictText).toContain('/Subtype /Form');
  });

  it('should draw text bound to a path as vector curves instead of raster, since it cannot be real selectable text', async () => {
    // mock
    const flattenedVector: TVectorNode = {
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      fillByKey: {},
      filledFaceKeys: ['face-1'],
      holeParentByKey: {},
      id: 'flattened',
      name: 'flattened',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '',
      strokeWidth: 0,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 10, y: 10 } },
    };

    getTextFlattenVectorMock.mockResolvedValue(flattenedVector);

    store.dispatch(
      addNodes({
        nodes: [
          {
            height: 40,
            id: 'pdf-path',
            name: 'Path',
            parentId: null,
            pathType: PathType.ellipse,
            rotation: 0,
            type: NodeType.path,
            width: 40,
            x: 0,
            y: 0,
          },
          {
            content: 'Hi',
            fill: '#ff0000',
            flipX: false,
            flipY: false,
            fontFamily: 'Inter',
            fontSize: 20,
            height: 40,
            id: 'pdf-text-path',
            name: 'Text',
            parentId: null,
            pathId: 'pdf-path',
            rotation: 0,
            type: NodeType.text,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['pdf-path', 'pdf-text-path'],
      }),
    );

    // action
    const blob = await createPdfBlob('pdf-text-path', 2, true, ExportImageResampling.basic, JPEG_QUALITY);

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 'pdf-text-path', pathId: 'pdf-path' }),
      expect.objectContaining({ id: 'pdf-path' }),
    );
    expect(await readPdfContent(blob)).toContain('f*');
  });

  it('should force even plain (non-path) text through the outline/curves tier when outlineText is on, skipping real text entirely', async () => {
    // mock
    const flattenedVector: TVectorNode = {
      defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
      fillByKey: {},
      filledFaceKeys: ['face-1'],
      holeParentByKey: {},
      id: 'flattened',
      name: 'flattened',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '',
      strokeWidth: 0,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 10, y: 10 } },
    };

    getTextFlattenVectorMock.mockResolvedValue(flattenedVector);

    store.dispatch(
      addNodes({
        nodes: [
          {
            content: 'Hi',
            fill: '#000000',
            flipX: false,
            flipY: false,
            fontFamily: 'Inter',
            fontSize: 16,
            height: 20,
            id: 'pdf-outline-text',
            name: 'Label',
            parentId: null,
            rotation: 0,
            type: NodeType.text,
            width: 60,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['pdf-outline-text'],
      }),
    );

    // action
    const blob = await createPdfBlob('pdf-outline-text', 2, true, ExportImageResampling.basic, JPEG_QUALITY, true);

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 'pdf-outline-text' }),
      undefined,
    );
    expect(await readPdfContent(blob)).toContain('f*');
  });
});
