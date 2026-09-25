// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isBooleanOperandNode } from '../isBooleanOperandNode';

const node = (id: string, type: NodeType, extra: object = {}): TSceneNode => ({ id, type, ...extra }) as TSceneNode;

describe('isBooleanOperandNode', () => {
  it('should accept shapes, vectors, lines and booleans', () => {
    // result
    [NodeType.boolean, NodeType.ellipse, NodeType.line, NodeType.polygon, NodeType.rectangle, NodeType.star, NodeType.vector].forEach(
      (type) => {
        expect(isBooleanOperandNode(node('n', type), {})).toBe(true);
      },
    );
  });

  it('should reject containers and text', () => {
    // result
    expect(isBooleanOperandNode(node('n', NodeType.frame), {})).toBe(false);
    expect(isBooleanOperandNode(node('n', NodeType.text), {})).toBe(false);
  });

  it('should reject a vector used as a text path', () => {
    // mock
    const vector = node('v', NodeType.vector);
    const nodes = { t: node('t', NodeType.text, { pathId: 'v' }), v: vector };

    // result
    expect(isBooleanOperandNode(vector, nodes)).toBe(false);
  });
});
