// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawBoxPaints } from '../drawBoxPaints';

const drawVectorFillGroupMock = vi.fn();
const resolvePatternPaintTileMock = vi.fn();

vi.mock('../../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup', () => ({
  drawVectorFillGroup: (...args: unknown[]): void => drawVectorFillGroupMock(...args),
}));
vi.mock('../resolvePatternPaintTile', () => ({
  resolvePatternPaintTile: (...args: unknown[]): unknown => resolvePatternPaintTileMock(...args),
}));

const context = {} as TDrawSceneContext;
const refs = createCanvasRefs();
const node: TRectangleNode = {
  fills: [],
  height: 20,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 30,
  type: NodeType.rectangle,
  width: 40,
  x: 10,
  y: 20,
};
const polygons = [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]];

describe('drawBoxPaints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvePatternPaintTileMock.mockReturnValue(null);
  });

  it('should draw each paint through its own fill group with the given polygons and the node’s box rotation', () => {
    // action
    drawBoxPaints(context, node, [{ color: '#f00', opacity: 100, type: 'solid' }], polygons, 1, {}, new Map(), refs, null, 0);

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      null,
      polygons,
      [{ color: '#f00', opacity: 100, type: 'solid' }],
      [null],
      { center: { x: 30, y: 30 }, degrees: 30, localBounds: { height: 20, width: 40, x: 10, y: 20 } },
    );
  });

  it('should paint in reverse-list order so the first paint ends up on top, scaling node opacity into each paint', () => {
    // action
    drawBoxPaints(
      context,
      node,
      [
        { color: '#111', opacity: 100, type: 'solid' },
        { color: '#222', opacity: 100, type: 'solid' },
      ],
      polygons,
      0.5,
      {},
      new Map(),
      refs,
      null,
      0,
    );

    // result
    expect(drawVectorFillGroupMock.mock.calls.map((call) => (call[4] as { color: string; opacity: number }[])[0])).toEqual([
      { color: '#222', opacity: 50, type: 'solid' },
      { color: '#111', opacity: 50, type: 'solid' },
    ]);
  });

  it('should release every resolved pattern tile after drawing', () => {
    // mock
    const release = vi.fn();

    resolvePatternPaintTileMock.mockReturnValue({ release, tile: 'tile' });

    // action
    drawBoxPaints(context, node, [{ color: '#f00', opacity: 100, type: 'solid' }], polygons, 1, {}, new Map(), refs, null, 0);

    // result
    expect(release).toHaveBeenCalledTimes(1);
    expect(drawVectorFillGroupMock.mock.calls[0][5]).toEqual(['tile']);
  });
});
