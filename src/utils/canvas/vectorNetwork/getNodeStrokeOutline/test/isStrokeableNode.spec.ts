// types
import { NodeType } from 'types/design/enums';

// utils
import { isStrokeableNode } from '../isStrokeableNode';

describe('isStrokeableNode', () => {
  it.each([NodeType.ellipse, NodeType.line, NodeType.rectangle, NodeType.vector])('should accept a %s node', (type) => {
    // result
    expect(isStrokeableNode({ type })).toBe(true);
  });

  it.each([NodeType.frame, NodeType.group, NodeType.section, NodeType.text, NodeType.path])('should reject a %s node', (type) => {
    // result
    expect(isStrokeableNode({ type })).toBe(false);
  });
});
