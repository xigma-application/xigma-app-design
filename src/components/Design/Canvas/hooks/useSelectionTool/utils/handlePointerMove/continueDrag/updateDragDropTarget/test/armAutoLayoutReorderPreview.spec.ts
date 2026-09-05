// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutReorderPreview } from '../armAutoLayoutReorderPreview';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const sibling = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 20,
    id,
    name: 'Rectangle',
    parentId: 'frame-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x,
    y,
  }) as TSceneNode;

const dropTarget = (index: number): TAutoLayoutDropTarget => ({
  index,
  indicator: { height: 20, width: 100, x: 0, y: 0 },
  siblingPositions: { s1: { x: 0, y: 100 } },
});

describe('armAutoLayoutReorderPreview', () => {
  it('should arm a reorder animation seeded from each sibling’s own bounds when no preview is active yet', () => {
    // mock
    const refs = createCanvasRefs();
    const siblingEntries = [{ bounds: { height: 20, width: 20, x: 0, y: 0 }, sibling: sibling('s1', 0, 0) }];

    // action
    armAutoLayoutReorderPreview(refs, 'frame-1', dropTarget(1), siblingEntries);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toEqual({
      activeIndex: 1,
      frameId: 'frame-1',
      positions: { s1: { x: 0, y: 0 } },
    });
  });

  it('should seed the animation from a sibling’s already-tracked preview position instead of its raw bounds', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'frame-1', positions: { s1: { x: 30, y: 30 } } } },
      },
    });
    const siblingEntries = [{ bounds: { height: 20, width: 20, x: 0, y: 0 }, sibling: sibling('s1', 0, 0) }];

    // action
    armAutoLayoutReorderPreview(refs, 'frame-1', dropTarget(1), siblingEntries);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions.s1).toEqual({ x: 30, y: 30 });
  });

  it('should not restart the animation when a preview is already animating this exact frame and index', () => {
    // mock
    const activePreview = { activeIndex: 1, frameId: 'frame-1', positions: { s1: { x: 999, y: 999 } } };
    const refs = createCanvasRefs({ transform: { autoLayoutReorderPreviewRef: { current: activePreview } } });
    const siblingEntries = [{ bounds: { height: 20, width: 20, x: 0, y: 0 }, sibling: sibling('s1', 0, 0) }];

    // action
    armAutoLayoutReorderPreview(refs, 'frame-1', dropTarget(1), siblingEntries);

    // result — untouched: a fresh trigger would have overwritten this with the freshly computed "from" position
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBe(activePreview);
  });
});
