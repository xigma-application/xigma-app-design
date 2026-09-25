// types
import { NodeType } from 'types/design/enums';

// utils
import { isPanelNodeType } from '../isPanelNodeType';

describe('isPanelNodeType', () => {
  it('should accept the types that have a panel', () => {
    // action / result
    expect([NodeType.frame, NodeType.rectangle, NodeType.boolean].every(isPanelNodeType)).toBe(true);
  });

  it('should reject a type without a panel', () => {
    // action / result
    expect(isPanelNodeType(NodeType.star)).toBe(false);
  });
});
