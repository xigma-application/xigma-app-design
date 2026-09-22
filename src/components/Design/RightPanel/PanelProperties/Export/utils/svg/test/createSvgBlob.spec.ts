// store
import { selectNodes } from 'store/design/selectors';
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../../enums';
import { NodeType } from 'types/design/enums';

// utils
import { createSvgBlob } from '../createSvgBlob';

const JPEG_QUALITY = 0.92;

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();
const blobToDataUrlMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));
vi.mock('utils/blobToDataUrl', () => ({ blobToDataUrl: (...args: unknown[]): unknown => blobToDataUrlMock(...args) }));
vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (): { x: number; y: number }[] => [
    { x: 5, y: 5 },
    { x: 35, y: 5 },
    { x: 35, y: 25 },
  ],
}));

const readSvgText = async (blob: Blob | null): Promise<string> => (blob ? blob.text() : '');

describe('createSvgBlob', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    renderNodeForExportMock.mockReset();
    createImageBlobFromPixelsMock.mockReset();
    blobToDataUrlMock.mockReset();
    renderNodeForExportMock.mockResolvedValue({ height: 1, pixels: new Uint8Array(4), width: 1 });
    createImageBlobFromPixelsMock.mockResolvedValue('raster-blob');
    blobToDataUrlMock.mockResolvedValue('data:image/png;base64,AAAA');
  });

  it('should return null when the node does not exist', async () => {
    // action
    const result = await createSvgBlob('missing', 2, true, ExportImageResampling.detailed, JPEG_QUALITY);

    // result
    expect(result).toBeNull();
  });

  it('should build one svg document sized like the node', async () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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
    const text = await readSvgText(await createSvgBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(text).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30">');
    expect(text).toContain('</svg>');
  });

  it('should draw a solid rectangle with a stroke as a real vector path without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
            height: 30,
            id: 'svg-rect',
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
        rootIds: ['svg-rect'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-rect', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('fill="#ff0000"');
    expect(text).toContain('fill="#0000ff"');
    expect(text).toContain('fill-opacity="0.5"');
  });

  it('should draw a plain ellipse as a real vector path without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fill: '#00ff00',
            height: 30,
            id: 'svg-ellipse',
            name: 'Ellipse',
            parentId: null,
            rotation: 0,
            type: NodeType.ellipse,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-ellipse'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-ellipse', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('fill="#00ff00"');
  });

  it('should draw a plain line as a real vector path without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            id: 'svg-line',
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
        rootIds: ['svg-line'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-line', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('fill="#0000ff"');
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
            id: 'svg-vector',
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
        rootIds: ['svg-vector'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-vector', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('fill="#ff00ff"');
  });

  it('should draw a linear gradient fill as a real <linearGradient> without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
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
            id: 'svg-linear-gradient',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 15,
            y: 22,
          },
        ],
        rootIds: ['svg-linear-gradient'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-linear-gradient', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('<defs><linearGradient');
    expect(text).toContain('stop-color="#ff0000"');
    expect(text).toContain('stop-color="#0000ff" stop-opacity="0.5"');
    expect(text).toContain('fill="url(#XigmaGradient0)"');
  });

  it('should draw a radial gradient fill as a real <radialGradient> without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                radiusRatio: 0.5,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ff0000', opacity: 100, position: 0 },
                  { color: '#0000ff', opacity: 100, position: 1 },
                ],
                type: 'gradient-radial',
              },
            ],
            height: 30,
            id: 'svg-radial-gradient',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 8,
            y: 12,
          },
        ],
        rootIds: ['svg-radial-gradient'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-radial-gradient', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('<defs><radialGradient');
    expect(text).toContain('gradientTransform="matrix(');
    expect(text).toContain('fill="url(#XigmaGradient0)"');
  });

  it('should fall back to an embedded raster image for an angular/diamond gradient fill (no native SVG primitive yet)', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ff0000', opacity: 100, position: 0 },
                  { color: '#0000ff', opacity: 100, position: 1 },
                ],
                type: 'gradient-angular',
              },
            ],
            height: 30,
            id: 'svg-gradient',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-gradient'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-gradient', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).toHaveBeenCalledWith('svg-gradient', 2, true, ExportImageResampling.basic, new Set(['svg-gradient']));
    expect(text).toContain('<image href="data:image/png;base64,AAAA"');
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
    await createSvgBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY);

    // result
    expect(createImageBlobFromPixelsMock.mock.calls[0][3]).toBe('image/jpeg');
    expect(createImageBlobFromPixelsMock.mock.calls[0][4]).toBe(JPEG_QUALITY);
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
    const withoutRender = await readSvgText(await createSvgBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    createImageBlobFromPixelsMock.mockResolvedValueOnce(null);

    const withoutBlob = await readSvgText(await createSvgBlob(rectId, 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(withoutRender).not.toContain('<image');
    expect(withoutBlob).not.toContain('<image');
  });
});
