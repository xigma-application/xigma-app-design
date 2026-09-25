// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getFlattenOperandVector } from '../getFlattenOperandVector';

vi.mock('../../booleanOperation/getBooleanVectorNode', () => ({ getBooleanVectorNode: (): string => 'boolean-vector' }));
vi.mock('../../render/getRenderedVectorNode', () => ({ getRenderedVectorNode: (node: unknown): unknown => ({ rendered: node }) }));
vi.mock('../../vectorNetwork/convertShapeToVector/convertNodeToVector', () => ({
  convertNodeToVector: (): string => 'converted',
  isConvertibleToVectorNode: (node: { type: NodeType }): boolean => node.type === NodeType.rectangle,
}));

const node = (type: NodeType): TSceneNode => ({ id: type, type }) as TSceneNode;

describe('getFlattenOperandVector', () => {
  it('should use the boolean result for a boolean', () => {
    // result
    expect(getFlattenOperandVector(node(NodeType.boolean), {})).toBe('boolean-vector');
  });

  it('should render a vector as is', () => {
    // mock
    const vector = node(NodeType.vector);

    // result
    expect(getFlattenOperandVector(vector, {})).toEqual({ rendered: vector });
  });

  it('should convert a shape and skip anything that cannot become a vector', () => {
    // result
    expect(getFlattenOperandVector(node(NodeType.rectangle), {})).toEqual({ rendered: 'converted' });
    expect(getFlattenOperandVector(node(NodeType.text), {})).toBeNull();
  });
});
