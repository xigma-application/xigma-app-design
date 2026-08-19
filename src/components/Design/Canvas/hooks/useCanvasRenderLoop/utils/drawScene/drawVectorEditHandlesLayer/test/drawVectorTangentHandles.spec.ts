// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorTangentHandles } from '../drawVectorTangentHandles';

const drawEllipseMock = vi.fn();
const drawLineMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const buildNode = (segments: TVectorNode['segments']): TVectorNode => ({
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('drawVectorTangentHandles', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawLineMock.mockClear();
  });

  it('should draw a handle line and dot for the tangentStart end of a segment', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } });

    // before
    drawVectorTangentHandles({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result — only the tangentStart end (v1) has a handle; the tangentEnd-less end (v2) draws nothing
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#0d99ff', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
  });

  it('should draw nothing for a straight segment with no tangents on either end', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });

    // before
    drawVectorTangentHandles({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw a handle for both ends when both have a tangent', () => {
    // mock
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    });

    // before
    drawVectorTangentHandles({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, node, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
  });
});
