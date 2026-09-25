// types
import { NodeType } from 'types/design/enums';
import { TFlattenEntry } from '../types';

// utils
import { getSingleFlattenVector } from '../getSingleFlattenVector';

vi.mock('utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector', () => ({
  convertNodeToVector: (node: { id: string }): unknown => ({ converted: node.id }),
  isConvertibleToVectorNode: (node: { type: NodeType }): boolean => node.type === NodeType.rectangle,
}));

const entry = (type: NodeType): TFlattenEntry =>
  ({ node: { id: 'n', name: 'Node', parentId: 'p', type }, renderIndex: 0, vector: { id: 'v', segments: {} } }) as unknown as TFlattenEntry;

describe('getSingleFlattenVector', () => {
  it('should leave a vector as it is', () => {
    // result
    expect(getSingleFlattenVector(entry(NodeType.vector))).toBeNull();
  });

  it('should convert a shape directly', () => {
    // result
    expect(getSingleFlattenVector(entry(NodeType.rectangle))).toEqual({ converted: 'n' });
  });

  it('should take over the prepared vector for anything else, keeping the node identity', () => {
    // result
    expect(getSingleFlattenVector(entry(NodeType.text))).toEqual({ id: 'n', name: 'Node', parentId: 'p', segments: {} });
  });
});
