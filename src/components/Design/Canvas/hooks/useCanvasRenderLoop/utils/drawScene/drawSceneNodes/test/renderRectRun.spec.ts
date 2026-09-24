// types
import { TMaskRenderer } from '../types';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { renderRectRun } from '../renderRectRun';

const createRect = (id: string, parentId: string | null = null): TRectangleNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id,
    name: id,
    parentId,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TRectangleNode;

const createGl = (hasBuffer = true, compiles = true): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    FLOAT: 5,
    STATIC_DRAW: 2,
    TRIANGLES: 4,
    attachShader: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffer ? {} : null)),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => (compiles ? {} : null)),
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
  }) as unknown as WebGL2RenderingContext;

const createRenderer = (gl: WebGL2RenderingContext, nodes: TSceneNode[] = []): TMaskRenderer =>
  ({
    context: { canvasHeight: 100, canvasWidth: 100, viewport: { x: 0, y: 0, zoom: 1 } },
    gl,
    paintLeaf: vi.fn(),
    sceneNodeById: new Map(nodes.map((node) => [node.id, node])),
  }) as unknown as TMaskRenderer;

describe('renderRectRun', () => {
  it('should draw nothing for an empty run', () => {
    // mock
    const gl = createGl();

    // before
    renderRectRun(createRenderer(gl), []);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a run as a single chunk', () => {
    // mock
    const gl = createGl();

    // before
    renderRectRun(createRenderer(gl), [createRect('a'), createRect('b')]);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(4, 0, 12);
  });

  it('should split a run longer than a chunk', () => {
    // mock
    const gl = createGl();
    const run = Array.from({ length: 513 }, (_, index) => createRect(`r${index}`));

    // before
    renderRectRun(createRenderer(gl), run);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should bake the parent opacity found in the scene into the chunk', () => {
    // mock
    const gl = createGl();
    const parent = { id: 'p', opacity: 0.5, parentId: null, type: 'frame', x: 0, y: 0 } as unknown as TSceneNode;

    // before
    renderRectRun(createRenderer(gl, [parent]), [createRect('a', 'p')]);

    // result
    const uploaded = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(uploaded[5]).toBeCloseTo(0.5);
  });

  it('should fall back to painting each node when no chunk buffer can be created', () => {
    // mock
    const gl = createGl(false);
    const renderer = createRenderer(gl);
    const run = [createRect('a'), createRect('b')];

    // before
    renderRectRun(renderer, run);

    // result
    expect(renderer.paintLeaf).toHaveBeenCalledTimes(2);
    expect(renderer.paintLeaf).toHaveBeenCalledWith(run[0]);
  });
});
