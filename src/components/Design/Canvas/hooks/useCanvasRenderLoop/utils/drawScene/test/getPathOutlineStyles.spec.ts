// types
import { NodeType, PathType } from 'types/design/enums';
import { TPathNode, TTextNode } from 'types/design/types';

// utils
import { getPathOutlineStyles } from '../getPathOutlineStyles';

const buildTextNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 10,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'path-1',
  rotation: 0,
  type: NodeType.text,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildPathNode = (overrides: Partial<TPathNode> = {}): TPathNode => ({
  height: 10,
  id: 'path-1',
  name: 'Path',
  parentId: null,
  pathType: PathType.ellipse,
  rotation: 0,
  type: NodeType.path,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getPathOutlineStyles', () => {
  it('should return an empty map when no node is linked to a path', () => {
    const styles = getPathOutlineStyles([buildTextNode({ pathId: null }), buildPathNode()], new Set(), null, null);

    expect(styles.size).toBe(0);
  });

  it('should mark the linked path as selected when its text node is selected but not currently hovered', () => {
    const styles = getPathOutlineStyles([buildTextNode()], new Set(['text-1']), null, null);

    expect(styles.get('path-1')).toBe('selected');
  });

  it('should mark the linked path as hovered, not selected, when its already-selected text node is also hovered', () => {
    // mock — hovering the draggable text while selected should surface the hover affordance,
    // not stay on the static thin selected outline
    const styles = getPathOutlineStyles([buildTextNode()], new Set(['text-1']), null, 'text-1');

    expect(styles.get('path-1')).toBe('hover');
  });

  it('should mark the linked path as selected when its text node is being edited, even if not selected', () => {
    const styles = getPathOutlineStyles([buildTextNode()], new Set(), 'text-1', null);

    expect(styles.get('path-1')).toBe('selected');
  });

  it('should mark the linked path as hovered when its text node is hovered but not selected or editing', () => {
    const styles = getPathOutlineStyles([buildTextNode()], new Set(), null, 'text-1');

    expect(styles.get('path-1')).toBe('hover');
  });

  it('should leave the linked path unset when its text node is neither selected, editing, nor hovered', () => {
    const styles = getPathOutlineStyles([buildTextNode()], new Set(), null, null);

    expect(styles.has('path-1')).toBe(false);
  });

  it('should mark the path as selected while typing brand-new content, before any text node exists yet', () => {
    // mock — a fresh text-on-path draft has only the path node in the store; the text node isn't
    // created until the editor commits, so the outline has to key off the editing box's pathId
    const styles = getPathOutlineStyles([buildPathNode()], new Set(), null, null, 'path-1');

    expect(styles.get('path-1')).toBe('selected');
  });

  it('should leave the path unset when nothing is being edited', () => {
    const styles = getPathOutlineStyles([buildPathNode()], new Set(), null, null, null);

    expect(styles.has('path-1')).toBe(false);
  });
});
