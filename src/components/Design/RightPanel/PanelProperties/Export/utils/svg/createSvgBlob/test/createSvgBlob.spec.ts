// store
import { selectNodes } from 'store/design/selectors';
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../../../enums';
import { BlendMode, NodeType, PathType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { createSvgBlob } from '../createSvgBlob';

const JPEG_QUALITY = 0.92;

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();
const blobToDataUrlMock = vi.fn();
const getTextFlattenVectorMock = vi.fn();

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
vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({
  getTextFlattenVector: (...args: unknown[]): unknown => getTextFlattenVectorMock(...args),
}));

const readSvgText = async (blob: Blob | null): Promise<string> => (blob ? blob.text() : '');
const sourceImageBlob = { tag: 'source-image' } as unknown as Blob;

describe('createSvgBlob', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    renderNodeForExportMock.mockReset();
    createImageBlobFromPixelsMock.mockReset();
    blobToDataUrlMock.mockReset();
    getTextFlattenVectorMock.mockReset();
    renderNodeForExportMock.mockResolvedValue({ height: 1, pixels: new Uint8Array(4), width: 1 });
    createImageBlobFromPixelsMock.mockResolvedValue('raster-blob');
    blobToDataUrlMock.mockResolvedValue('data:image/png;base64,AAAA');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<{ blob: () => Promise<Blob>; ok: boolean }> => ({
        blob: async (): Promise<Blob> => sourceImageBlob,
        ok: true,
      })),
    );
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async (): Promise<{ height: number; width: number }> => ({ height: 80, width: 100 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
            strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
            type: NodeType.line,
            ...getLineBoxFromPoints({ x1: 0, x2: 40, y1: 0, y2: 30 }),
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

  it('should draw an angular gradient fill as a clipped fan of vector sectors, not a raster image', async () => {
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
            id: 'svg-angular-gradient',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-angular-gradient'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-angular-gradient', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).not.toContain('<image');
    expect(text).toContain('<defs><clipPath id="XigmaClip0">');
    expect(text).toContain('<g clip-path="url(#XigmaClip0)">');

    const sectorFills = [...text.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((match) => match[1]);

    expect(sectorFills.length).toBeGreaterThan(100);
    expect(new Set(sectorFills).size).toBeGreaterThan(100);
    expect(sectorFills[0]?.startsWith('#f')).toBe(true); // near the red stop (position 0)
    expect(sectorFills[sectorFills.length - 1]?.endsWith('fe')).toBe(true); // near the blue stop (position 1)
  });

  it('should draw a diamond gradient fill as a clipped set of concentric vector rings, not a raster image', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#00ff00', opacity: 100, position: 0 },
                  { color: '#ff00ff', opacity: 100, position: 1 },
                ],
                type: 'gradient-diamond',
              },
            ],
            height: 30,
            id: 'svg-diamond-gradient',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-diamond-gradient'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-diamond-gradient', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).not.toContain('<image');
    expect(text).toContain('<g clip-path="url(#XigmaClip0)">');

    const ringFills = [...text.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((match) => match[1]);

    expect(ringFills.length).toBeGreaterThan(30);
    expect(new Set(ringFills).size).toBeGreaterThan(10);
    expect(ringFills[0]).toMatch(/^#0[0-9a-f]f[0-9a-f]0[0-9a-f]$/); // near the green stop (position 0)
    expect(ringFills).toContain('#ff00ff'); // the magenta stop (position 1), clamped flat beyond it
  });

  it('should encode a page that is entirely one raster layer as an opaque-white-flattened jpeg at the given quality', async () => {
    // mock
    store.dispatch(
      addNode({
        fills: [
          {
            adjustments: { contrast: 0, exposure: 10, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 },
            opacity: 100,
            ref: 'img',
            rotation: 0,
            scaleMode: 'fill',
            type: 'image',
          },
        ],
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
        fills: [
          {
            adjustments: { contrast: 0, exposure: 10, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 },
            opacity: 100,
            ref: 'img',
            rotation: 0,
            scaleMode: 'fill',
            type: 'image',
          },
        ],
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

  it('should draw plain text as real selectable <text> without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: ['svg-text'],
            clipContent: false,
            fills: [
              {
                adjustments: { contrast: 0, exposure: 10, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 },
                opacity: 100,
                ref: 'img',
                rotation: 0,
                scaleMode: 'fill',
                type: 'image',
              },
            ],
            height: 80,
            id: 'svg-text-frame',
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
            id: 'svg-text',
            name: 'Label',
            parentId: 'svg-text-frame',
            rotation: 0,
            type: NodeType.text,
            width: 60,
            x: 10,
            y: 10,
          },
        ],
        rootIds: ['svg-text-frame'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-text-frame', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).toHaveBeenCalledTimes(1);
    expect(renderNodeForExportMock).toHaveBeenCalledWith(
      'svg-text-frame',
      2,
      true,
      ExportImageResampling.basic,
      new Set(['svg-text-frame']),
      { height: 80, width: 120, x: 0, y: 0 },
    );
    expect(text).toContain('<text fill="#000000" font-family="Inter, sans-serif" font-size="16">');
    expect(text).toContain('<tspan');
    expect(text).toContain('>H</tspan>');
    expect(text).toContain('>i</tspan>');
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
            id: 'svg-path',
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
            id: 'svg-text-path',
            name: 'Text',
            parentId: null,
            pathId: 'svg-path',
            rotation: 0,
            type: NodeType.text,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-path', 'svg-text-path'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-text-path', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 'svg-text-path', pathId: 'svg-path' }),
      expect.objectContaining({ id: 'svg-path' }),
    );
    expect(text).toContain('<path d="M');
    expect(text).not.toContain('<tspan');
  });

  it('should force even plain (non-path) text through the outline/curves tier when outlineText is on, skipping real <text> entirely', async () => {
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
            id: 'svg-outline-text',
            name: 'Label',
            parentId: null,
            rotation: 0,
            type: NodeType.text,
            width: 60,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-outline-text'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-outline-text', 2, true, ExportImageResampling.basic, JPEG_QUALITY, true));

    // result
    expect(getTextFlattenVectorMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 'svg-outline-text' }),
      undefined,
    );
    expect(text).toContain('<path d="M');
    expect(text).not.toContain('<text');
    expect(text).not.toContain('<tspan');
  });

  it('should draw a simple image fill (mode fill) as a real, clipped <image> without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [{ opacity: 100, ref: 'https://assets.test/photo.png', rotation: 0, scaleMode: 'fill', type: 'image' }],
            height: 30,
            id: 'svg-image-fill',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-image-fill'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-image-fill', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(fetch).toHaveBeenCalledWith('https://assets.test/photo.png');
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('<defs><clipPath id="XigmaClip0">');
    expect(text).toContain('<image href="data:image/png;base64,AAAA" x="0" y="0" width="40" height="30"');
    expect(text).toContain('preserveAspectRatio="xMidYMid slice"');
    expect(text).toContain('clip-path="url(#XigmaClip0)"');
  });

  it('should draw a video fill the same way as an image fill', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [{ opacity: 100, ref: 'https://assets.test/frame.png', rotation: 0, scaleMode: 'fit', type: 'video' }],
            height: 30,
            id: 'svg-video-fill',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-video-fill'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-video-fill', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it('should fall back to raster for an image fill with non-default color adjustments (no SVG filter equivalent)', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                adjustments: { contrast: 0, exposure: 15, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 },
                opacity: 100,
                ref: 'https://assets.test/photo.png',
                rotation: 0,
                scaleMode: 'fill',
                type: 'image',
              },
            ],
            height: 30,
            id: 'svg-image-adjusted',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-image-adjusted'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-image-adjusted', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(fetch).not.toHaveBeenCalled();
    expect(renderNodeForExportMock).toHaveBeenCalledWith(
      'svg-image-adjusted',
      2,
      true,
      ExportImageResampling.basic,
      new Set(['svg-image-adjusted']),
      { height: 30, width: 40, x: 0, y: 0 },
    );
    expect(text).toContain('<image href="data:image/png;base64,AAAA"');
    expect(text).not.toContain('clip-path');
  });

  it('should draw a crop-mode image fill positioned at the crop rect with no aspect-ratio stretching', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [
              {
                crop: { height: 20, rotation: 10, width: 25, x: 5, y: 3 },
                opacity: 100,
                ref: 'https://assets.test/photo.png',
                rotation: 0,
                scaleMode: 'fill',
                type: 'image',
              },
            ],
            height: 30,
            id: 'svg-image-crop',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-image-crop'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-image-crop', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(text).toContain('x="5" y="3" width="25" height="20"');
    expect(text).toContain('preserveAspectRatio="none"');
    expect(text).toContain('transform="rotate(10 ');
  });

  it('should draw a tile-mode image fill as a pattern fill on the shape polygon, not a separate <image> element', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [{ opacity: 100, ref: 'https://assets.test/photo.png', rotation: 0, scale: 0.5, scaleMode: 'tile', type: 'image' }],
            height: 30,
            id: 'svg-image-tile',
            name: 'Rect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-image-tile'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-image-tile', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(text).toContain('<defs><pattern id="XigmaPattern0" patternUnits="userSpaceOnUse" width="50" height="40">');
    expect(text).toContain('fill="url(#XigmaPattern0)"');
    expect(text).not.toContain('<image href="data:image/png;base64,AAAA" x=');
  });

  it('should wrap a shape nested inside a rotated frame in a <g transform> group, using geometry decomposed relative to the frame', async () => {
    // mock
    // frame: x:100 y:100 w:100 h:100 rotation:90 -> center (150,150), a square so its rotated AABB is unchanged: bounds x:100 y:100 w:100 h:100
    // child: absolute center (180,150) rotation:90 (i.e. no rotation of its own beyond the frame's) -> local rotation 0,
    // local center (150,150) + rotate((30,0), -90 degrees) = (150,120) -> local x:140 y:110, translated into the g's pivot-relative page space: (40,10)-(60,30)
    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: ['svg-rotated-child'],
            clipContent: false,
            fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
            height: 100,
            id: 'svg-rotated-frame',
            name: 'Frame',
            parentId: null,
            rotation: 90,
            type: NodeType.frame,
            width: 100,
            x: 100,
            y: 100,
          },
          {
            fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
            height: 20,
            id: 'svg-rotated-child',
            name: 'Rect',
            parentId: 'svg-rotated-frame',
            rotation: 90,
            type: NodeType.rectangle,
            width: 20,
            x: 170,
            y: 140,
          },
        ],
        rootIds: ['svg-rotated-frame'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-rotated-frame', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();

    const frameFillIndex = text.indexOf('fill="#0000ff"');
    const groupOpenIndex = text.indexOf('<g transform="rotate(90, 50, 50)">');
    const childFillIndex = text.indexOf('fill="#ff0000"');
    const groupCloseIndex = text.lastIndexOf('</g>');

    expect(frameFillIndex).toBeGreaterThan(-1);
    expect(groupOpenIndex).toBeGreaterThan(frameFillIndex);
    expect(childFillIndex).toBeGreaterThan(groupOpenIndex);
    expect(groupCloseIndex).toBeGreaterThan(childFillIndex);
    expect(text.slice(groupOpenIndex, groupCloseIndex)).toContain('40 10');
    expect(text.slice(groupOpenIndex, groupCloseIndex)).toContain('60 30');
  });

  it('should wrap a shape nested inside a blended frame in a <g style="mix-blend-mode"> isolated group, instead of falling back to raster', async () => {
    // mock
    // the frame's own fill still falls back to raster, since a node's OWN non-normal blend mode was always
    // (and still is) excluded from that node's own eligibility — unrelated to the ancestor gate under test here
    store.dispatch(
      addNodes({
        nodes: [
          {
            blendMode: BlendMode.multiply,
            childIds: ['svg-blended-child'],
            clipContent: false,
            fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
            height: 100,
            id: 'svg-blended-frame',
            name: 'Frame',
            parentId: null,
            rotation: 0,
            type: NodeType.frame,
            width: 100,
            x: 0,
            y: 0,
          },
          {
            fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
            height: 20,
            id: 'svg-blended-child',
            name: 'Rect',
            parentId: 'svg-blended-frame',
            rotation: 0,
            type: NodeType.rectangle,
            width: 20,
            x: 10,
            y: 10,
          },
        ],
        rootIds: ['svg-blended-frame'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-blended-frame', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    const groupOpenIndex = text.indexOf('<g style="mix-blend-mode: multiply; isolation: isolate">');
    const childFillIndex = text.indexOf('fill="#ff0000"');
    const groupCloseIndex = text.lastIndexOf('</g>');

    expect(groupOpenIndex).toBeGreaterThan(-1);
    expect(childFillIndex).toBeGreaterThan(groupOpenIndex);
    expect(groupCloseIndex).toBeGreaterThan(childFillIndex);
  });

  it('should draw a standalone media (image/video) node as a full-stretch image without rendering any raster layer', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            flipX: false,
            flipY: false,
            height: 30,
            id: 'svg-media',
            name: 'Media',
            parentId: null,
            rotation: 0,
            src: 'https://assets.test/photo.png',
            type: NodeType.media,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['svg-media'],
      }),
    );

    // action
    const text = await readSvgText(await createSvgBlob('svg-media', 2, true, ExportImageResampling.basic, JPEG_QUALITY));

    // result
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(text).toContain('<image href="data:image/png;base64,AAAA" x="0" y="0" width="40" height="30" preserveAspectRatio="none"/>');
  });
});
