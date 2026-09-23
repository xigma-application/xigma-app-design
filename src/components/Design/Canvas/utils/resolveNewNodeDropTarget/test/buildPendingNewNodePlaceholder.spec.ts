// types
import { NodeType } from 'types/design/enums';

// utils
import { buildPendingNewNodePlaceholder } from '../buildPendingNewNodePlaceholder';

describe('buildPendingNewNodePlaceholder', () => {
  it('should build a default-sized rectangle placeholder centered on the given point', () => {
    // before
    const placeholder = buildPendingNewNodePlaceholder({ x: 100, y: 200 });

    // result
    expect(placeholder).toMatchObject({ height: 100, type: NodeType.rectangle, width: 100, x: 50, y: 150 });
  });
});
