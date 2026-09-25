// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { canFillAxis } from '../canFillAxis';

const child = { id: 'c', parentId: 'p' } as TBoxSceneNode;

const withParent = (parent: Partial<TSceneNode>): Record<string, TSceneNode> => ({ p: { id: 'p', ...parent } as TSceneNode });

describe('canFillAxis', () => {
  it('should allow fill inside a managed layout frame that does not hug that axis', () => {
    // mock
    const nodes = withParent({
      heightSizingMode: SizingMode.hug,
      layoutMode: LayoutMode.horizontal,
      type: NodeType.frame,
    } as Partial<TSceneNode>);

    // result
    expect(canFillAxis(child, nodes, 'width')).toBe(true);
    expect(canFillAxis(child, nodes, 'height')).toBe(false);
  });

  it('should treat a missing sizing mode as fixed', () => {
    // mock
    const nodes = withParent({ layoutMode: LayoutMode.vertical, type: NodeType.frame } as Partial<TSceneNode>);

    // result
    expect(canFillAxis(child, nodes, 'height')).toBe(true);
  });

  it('should not allow fill outside a managed layout frame', () => {
    // result
    expect(canFillAxis({ id: 'c', parentId: null } as TBoxSceneNode, {}, 'width')).toBe(false);
    expect(canFillAxis(child, withParent({ type: NodeType.frame } as Partial<TSceneNode>), 'width')).toBe(false);
  });
});
