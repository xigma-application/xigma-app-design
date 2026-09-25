// types
import { NodeType } from 'types/design/enums';
import { TFlattenEntry } from '../types';

// utils
import { getMergedFlattenVector } from '../getMergedFlattenVector';

const computeMock = vi.fn(() => 'merged');

vi.mock('utils/canvas/flatten/computeFlattenVectorNode', () => ({
  computeFlattenVectorNode: (...args: unknown[]): unknown => computeMock(...(args as [])),
}));
vi.mock('utils/canvas/render/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (vector: { id: string }): string => `rendered-${vector.id}`,
}));
vi.mock('store/design/utils/getNodePaintStyle', () => ({ getNodePaintStyle: (node: { id: string }): string => `style-${node.id}` }));

describe('getMergedFlattenVector', () => {
  it('should flatten every entry into the topmost layer, styled like it', () => {
    // mock
    const entries = [
      { node: { id: 'a', name: 'A', parentId: 'p', type: NodeType.rectangle }, renderIndex: 0, vector: { id: 'va' } },
      { node: { id: 'b', name: 'B', parentId: 'p', type: NodeType.rectangle }, renderIndex: 1, vector: { id: 'vb' } },
    ] as unknown as TFlattenEntry[];

    // before
    const result = getMergedFlattenVector(entries);

    // result
    expect(result).toBe('merged');
    expect(computeMock).toHaveBeenCalledWith({ id: 'b', name: 'B', parentId: 'p' }, ['rendered-va', 'rendered-vb'], 'style-b');
  });
});
