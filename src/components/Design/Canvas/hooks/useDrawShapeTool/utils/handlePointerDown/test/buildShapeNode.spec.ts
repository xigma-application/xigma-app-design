// types
import { NodeType } from 'types/design/enums';

// utils
import { buildShapeNode } from '../buildShapeNode';

const RECT = { height: 10, width: 10, x: 0, y: 0 };

describe('buildShapeNode', () => {
  it('should build a frame with childIds, clipContent, and a solid fills array', () => {
    // before
    const node = buildShapeNode(RECT, '#ffffff', 'Frame', NodeType.frame, null);

    // result
    expect(node).toMatchObject({ childIds: [], clipContent: true, name: 'Frame', parentId: null, type: NodeType.frame });
    expect(node).toHaveProperty('fills');
  });

  it('should build a section with childIds but no clipContent, and a single fill string', () => {
    // before
    const node = buildShapeNode(RECT, '#444444', 'Section', NodeType.section, 'parent-id');

    // result
    expect(node).toMatchObject({ childIds: [], cornerRadius: 2, fill: '#444444', parentId: 'parent-id', type: NodeType.section });
    expect(node).not.toHaveProperty('clipContent');
  });

  it('should build a rectangle with a solid fills array and no childIds', () => {
    // before
    const node = buildShapeNode(RECT, '#0000ff', 'Rectangle', NodeType.rectangle, null);

    // result
    expect(node).toMatchObject({ type: NodeType.rectangle });
    expect(node).toHaveProperty('fills');
    expect(node).not.toHaveProperty('childIds');
  });

  it('should build an ellipse with a single fill string, not a fills array', () => {
    // before
    const node = buildShapeNode(RECT, '#00ff00', 'Ellipse', NodeType.ellipse, null);

    // result
    expect(node).toMatchObject({ fill: '#00ff00', type: NodeType.ellipse });
    expect(node).not.toHaveProperty('fills');
  });
});
