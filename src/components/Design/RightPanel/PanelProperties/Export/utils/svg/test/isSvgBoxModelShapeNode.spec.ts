// types
import { NodeType } from 'types/design/enums';
import { TSvgShapeNode } from '../types';

// utils
import { isSvgBoxModelShapeNode } from '../isSvgBoxModelShapeNode';

const node = (type: NodeType): TSvgShapeNode => ({ type }) as TSvgShapeNode;

describe('isSvgBoxModelShapeNode', () => {
  it.each([NodeType.frame, NodeType.rectangle, NodeType.ellipse, NodeType.polygon, NodeType.star, NodeType.media])(
    'should accept %s',
    (type) => {
      expect(isSvgBoxModelShapeNode(node(type))).toBe(true);
    },
  );

  it.each([NodeType.line, NodeType.vector])('should reject %s (its own geometry is already fully baked, absolute)', (type) => {
    expect(isSvgBoxModelShapeNode(node(type))).toBe(false);
  });
});
