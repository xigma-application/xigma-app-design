// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getBooleanOperandVector } from '../getBooleanOperandVector';

vi.mock('../getBooleanVectorNode', () => ({ getBooleanVectorNode: (): string => 'boolean-vector' }));
vi.mock('../getBooleanStrokeShapeVector', () => ({ getBooleanStrokeShapeVector: (): string => 'stroke-vector' }));
vi.mock('../../render/getRenderedVectorNode', () => ({ getRenderedVectorNode: (node: object): object => ({ rendered: node }) }));
vi.mock('../../vectorNetwork/convertShapeToVector/convertNodeToVector', () => ({
  convertNodeToVector: (node: { id: string }): string => `converted-${node.id}`,
  isConvertibleToVectorNode: (node: { type: NodeType }): boolean => node.type === NodeType.rectangle,
}));

const node = (type: NodeType, extra: object = {}): TSceneNode => ({ id: type, type, ...extra }) as TSceneNode;

describe('getBooleanOperandVector', () => {
  it('should skip a hidden operand', () => {
    // result
    expect(getBooleanOperandVector(node(NodeType.rectangle, { hidden: true }), {})).toBeNull();
  });

  it('should use the nested boolean result for a boolean', () => {
    // result
    expect(getBooleanOperandVector(node(NodeType.boolean), {})).toBe('boolean-vector');
  });

  it('should use the stroke outline for a line and for a vector without filled faces', () => {
    // result
    expect(getBooleanOperandVector(node(NodeType.line), {})).toBe('stroke-vector');
    expect(getBooleanOperandVector(node(NodeType.vector, { filledFaceKeys: [] }), {})).toBe('stroke-vector');
  });

  it('should use the rendered vector for a vector with filled faces', () => {
    // mock
    const vector = node(NodeType.vector, { filledFaceKeys: ['a'] });

    // result
    expect(getBooleanOperandVector(vector, {})).toEqual({ rendered: vector });
  });

  it('should convert a shape to a vector once and reuse it', () => {
    // mock
    const rectangle = node(NodeType.rectangle);

    // before
    const first = getBooleanOperandVector(rectangle, {});

    // result
    expect(first).toEqual({ rendered: 'converted-rectangle' });
    expect(getBooleanOperandVector(rectangle, {})).toBe(first);
  });

  it('should skip a node that cannot become a vector', () => {
    // result
    expect(getBooleanOperandVector(node(NodeType.text), {})).toBeNull();
  });
});
