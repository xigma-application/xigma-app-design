// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorMultiSelectBox } from '../drawVectorMultiSelectBox';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } },
};

describe('drawVectorMultiSelectBox', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw nothing when fewer than 2 points are selected', () => {
    // before
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1'],
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when 2+ ids are selected but none of them resolve to a real point on the node', () => {
    // before — both ids reference vertices that no longer exist on the node
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['missing-1', 'missing-2'],
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw a stroke-only rectangle over the bounds of 2+ selected points, with no fill and no corner handles', () => {
    // before
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1', 'v2'],
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 40, stroke: '#0d99ff', width: 100, x: 0, y: 0 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });
});
