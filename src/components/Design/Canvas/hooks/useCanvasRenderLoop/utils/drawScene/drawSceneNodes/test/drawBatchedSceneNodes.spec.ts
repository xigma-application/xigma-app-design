// types
import { TDrawSceneContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawBatchedSceneNodes } from '../drawBatchedSceneNodes';

const createRect = (id: string, x: number, parentId: string | null = null, opacity?: number): TSceneNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id,
    name: id,
    opacity,
    parentId,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x,
    y: 0,
  }) as unknown as TSceneNode;

const createEllipse = (id: string): TSceneNode => ({ id, type: 'ellipse' }) as unknown as TSceneNode;

const createContext = (compiles = true): TDrawSceneContext => {
  const gl = {
    ARRAY_BUFFER: 1,
    FLOAT: 5,
    STATIC_DRAW: 2,
    STREAM_DRAW: 3,
    TRIANGLES: 4,
    attachShader: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => (compiles ? {} : null)),
    deleteBuffer: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    getUniformLocation: vi.fn(() => ({})),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  } as unknown as WebGL2RenderingContext;

  return {
    buffer: {} as WebGLBuffer,
    canvasHeight: 100,
    canvasWidth: 100,
    gl,
    imageContext: {} as TDrawSceneContext['imageContext'],
    program: {} as WebGLProgram,
    viewport: { x: 0, y: 0, zoom: 1 },
  };
};

describe('drawBatchedSceneNodes', () => {
  it('should paint every node individually when the batch program is unavailable', () => {
    // mock
    const paintLeaf = vi.fn();
    const nodes = [createRect('a', 0), createEllipse('e')];

    // before
    drawBatchedSceneNodes(createContext(false), nodes, {}, createCanvasRefs(), paintLeaf);

    // result
    expect(paintLeaf).toHaveBeenCalledTimes(2);
  });

  it('should draw plain top-level rectangles as one chunk without touching paintLeaf', () => {
    // mock
    const context = createContext();
    const paintLeaf = vi.fn();

    // before
    drawBatchedSceneNodes(context, [createRect('a', 0), createRect('b', 20)], {}, createCanvasRefs(), paintLeaf);

    // result
    expect(paintLeaf).not.toHaveBeenCalled();
    expect(context.gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(context.gl.drawArrays).toHaveBeenCalledWith(4, 0, 12);
  });

  it('should hand a node that cannot be batched to paintLeaf between two chunks', () => {
    // mock
    const context = createContext();
    const paintLeaf = vi.fn();
    const ellipse = createEllipse('e');

    // before
    drawBatchedSceneNodes(context, [createRect('a', 0), ellipse, createRect('b', 20)], {}, createCanvasRefs(), paintLeaf);

    // result
    expect(paintLeaf).toHaveBeenCalledWith(ellipse);
    expect(context.gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should batch a nested rectangle dynamically with its inherited opacity', () => {
    // mock
    const context = createContext();
    const paintLeaf = vi.fn();
    const parent = { ...createRect('p', 0, null, 0.5), type: 'frame' } as unknown as TSceneNode;
    const nested = createRect('n', 0, 'p');

    // before
    drawBatchedSceneNodes(context, [nested], { n: nested, p: parent }, createCanvasRefs(), paintLeaf);

    // result
    const uploaded = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(paintLeaf).not.toHaveBeenCalled();
    expect(uploaded[5]).toBeCloseTo(0.5);
    expect(context.gl.drawArrays).toHaveBeenCalledWith(4, 0, 6);
  });

  it('should skip retained chunks and draw dynamically while a drag preview overrides rendering', () => {
    // mock
    const context = createContext();
    const paintLeaf = vi.fn();
    const refs = createCanvasRefs();
    const node = createRect('a', 0);

    refs.transform.gridDropTargetRef.current = {} as never;

    // before
    drawBatchedSceneNodes(context, [node], { a: node }, refs, paintLeaf);

    // result
    expect(paintLeaf).not.toHaveBeenCalled();
    expect(context.gl.bufferData).toHaveBeenCalledWith(1, expect.any(Float32Array), 3);
    expect(context.gl.drawArrays).toHaveBeenCalledWith(4, 0, 6);
  });

  it('should dim a rectangle that is being dragged while a drop target is active', () => {
    // mock
    const context = createContext();
    const refs = createCanvasRefs();
    const node = createRect('a', 0);

    refs.transform.autoLayoutDropTargetRef.current = {} as never;
    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    // before
    drawBatchedSceneNodes(context, [node], { a: node }, refs, vi.fn());

    // result
    const uploaded = (context.gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(uploaded[5]).toBeCloseTo(0.5);
  });
});
