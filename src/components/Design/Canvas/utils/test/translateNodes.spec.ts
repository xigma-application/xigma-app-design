// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { translateNodes } from '../translateNodes';

vi.mock('../getGeometryDeltaChanges', () => ({
  getGeometryDeltaChanges: (_node: unknown, dx: number, dy: number): unknown => ({ x: dx, y: dy }),
}));
vi.mock('../getCropPaintChanges', () => ({
  getCropPaintChanges: (_node: unknown, translate: (paints: unknown[]) => unknown): unknown => ({ fills: translate(['paint']) }),
}));
vi.mock('../translateFillsCrop', () => ({
  translateFillsCrop: (paints: unknown[], dx: number): unknown => paints.map((paint) => `${paint}+${dx}`),
}));

describe('translateNodes', () => {
  it('should move every node, shifting the image crops of nodes with paints', () => {
    // mock
    const dispatch = vi.fn();
    const nodes = [
      { id: 'r', type: NodeType.rectangle },
      { id: 't', type: NodeType.text },
    ] as TSceneNode[];

    // before
    translateNodes(dispatch, nodes, 5, 6);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, updateNode({ changes: { fills: ['paint+5'], x: 5, y: 6 } as never, id: 'r' }));
    expect(dispatch).toHaveBeenNthCalledWith(2, updateNode({ changes: { x: 5, y: 6 }, id: 't' }));
  });
});
