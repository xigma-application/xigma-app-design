// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { drawTextHoverOutline } from '../drawTextHoverOutline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const buildText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'hello',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 120,
  x: 0,
  y: 0,
  ...overrides,
});

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vec-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 60, y: 0 }, v3: { id: 'v3', x: 120, y: 30 } },
  ...overrides,
});

const byId = (...nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('drawTextHoverOutline', () => {
  it('should draw a thin underline for a plain text box (no path binding)', () => {
    const gl = createGlMock();
    const text = buildText();

    drawTextHoverOutline(gl, {} as WebGLProgram, {} as WebGLBuffer, text, byId(text), 100, 100, IDENTITY_VIEWPORT);

    // a single thin quad
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw the bound vector contour along the curve for a text on path, not an underline', () => {
    const gl = createGlMock();
    const vector = buildVector();
    const text = buildText({ pathId: 'vec-1' });

    drawTextHoverOutline(gl, {} as WebGLProgram, {} as WebGLBuffer, text, byId(text, vector), 100, 100, IDENTITY_VIEWPORT);

    const [firstCall] = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls;
    expect(firstCall[0]).toBe(gl.TRIANGLES);
    expect(firstCall[2]).toBeGreaterThan(6);
  });

  it('should still draw the contour (mirrored) when the text on path has been flipped', () => {
    const gl = createGlMock();
    const vector = buildVector();
    const text = buildText({ flipX: true, pathId: 'vec-1' });

    drawTextHoverOutline(gl, {} as WebGLProgram, {} as WebGLBuffer, text, byId(text, vector), 100, 100, IDENTITY_VIEWPORT);

    const [firstCall] = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls;
    expect(firstCall[0]).toBe(gl.TRIANGLES);
    expect(firstCall[2]).toBeGreaterThan(6);
  });
});
