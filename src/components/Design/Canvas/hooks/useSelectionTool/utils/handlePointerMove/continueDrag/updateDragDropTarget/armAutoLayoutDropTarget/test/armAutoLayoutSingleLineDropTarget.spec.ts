// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';
import { TSceneNode } from 'types/design/types';

// others
import { AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS } from 'components/Design/Canvas/constants';

// utils
import { armAutoLayoutSingleLineDropTarget } from '../armAutoLayoutSingleLineDropTarget';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getAutoLayoutDropTargetContext } from '../getAutoLayoutDropTargetContext';

const autoLayoutFrame: TAutoLayoutFrame = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 300,
  id: 'frame-1',
  layoutMode: LayoutMode.vertical,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const draggedRect: TSceneNode = {
  fill: '#000',
  height: 20,
  id: 'dragged',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 500,
  y: 500,
} as TSceneNode;

describe('armAutoLayoutSingleLineDropTarget', () => {
  it('arms the reorder preview when the drop stays inside the node’s current parent', () => {
    // mock
    const refs = createCanvasRefs();
    const context = getAutoLayoutDropTargetContext(autoLayoutFrame, 'frame-1', 'frame-1', [draggedRect], ['dragged'], {}, false);

    // action
    armAutoLayoutSingleLineDropTarget(refs, autoLayoutFrame, 'frame-1', [draggedRect], null, { x: 10, y: 10 }, context);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).not.toBeNull();
    expect(refs.transform.autoLayoutDropTargetRef.current).toBeNull();
  });

  it('arms the drop indicator when dropping into a different parent', () => {
    // mock
    const refs = createCanvasRefs();
    const context = getAutoLayoutDropTargetContext(autoLayoutFrame, 'frame-1', null, [draggedRect], ['dragged'], {}, false);

    // action
    armAutoLayoutSingleLineDropTarget(refs, autoLayoutFrame, 'frame-1', [draggedRect], null, { x: 10, y: 10 }, context);

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });

  describe('inside a rotated frame', () => {
    let rafCallbacks: FrameRequestCallback[];
    let now: number;

    beforeEach(() => {
      now = 1000;
      rafCallbacks = [];
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);

        return rafCallbacks.length;
      });
      vi.spyOn(performance, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    const settleTween = (): void => {
      rafCallbacks.shift()?.(now);
      now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
      rafCallbacks.shift()?.(now);
    };

    it('reorders correctly — siblings and dragged slots come out anchored to the frame’s own centre, not the world axes', () => {
      // mock — a 200x100 frame rotated 90deg (centre 100,50), two 60x20 siblings that already
      // rigidly share the frame's own rotation (as continueRotateDrag/rotateNodesRigidly leave
      // them): sibling 'a' sits at the frame's own local slot 0 (0,0)-(60,20), 'b' at local slot 1
      // (60,0)-(120,20) — both expressed here in their real WORLD positions, i.e. those local slots
      // orbited 90deg around the frame's centre (matches getAutoLayoutNodeLocalBounds's own
      // round-trip test)
      const rotatedFrame: TAutoLayoutFrame = {
        ...autoLayoutFrame,
        childIds: ['a', 'b'],
        height: 100,
        layoutMode: LayoutMode.horizontal,
        rotation: 90,
        width: 200,
      };
      const siblingA: TSceneNode = { ...draggedRect, height: 20, id: 'a', rotation: 90, width: 60, x: 110, y: -30 } as TSceneNode;
      const siblingB: TSceneNode = { ...draggedRect, height: 20, id: 'b', rotation: 90, width: 60, x: 110, y: 30 } as TSceneNode;
      const refs = createCanvasRefs();
      const context = getAutoLayoutDropTargetContext(
        rotatedFrame,
        'frame-1',
        'frame-1',
        [siblingB],
        ['b'],
        { a: siblingA, b: siblingB },
        false,
      );

      // action — drag 'b' to a point that, un-rotated into the frame's own local space, sits at the
      // very front (local ~0,10) — armAutoLayoutSingleLineDropTarget itself takes an already-local
      // point (the local conversion happens one level up, in armAutoLayoutDropTarget)
      armAutoLayoutSingleLineDropTarget(refs, rotatedFrame, 'frame-1', [siblingB], 'b', { x: 0, y: 10 }, context);
      settleTween();

      // result — 'a' is pushed to local slot 1 (60,0)-(120,20), which orbited 90deg around the
      // frame's centre lands at world (110,30) — exactly where 'b' itself used to sit, since
      // swapping the only two items in the row moves each into the other's old spot
      const preview = refs.transform.autoLayoutReorderPreviewRef.current;

      expect(preview?.activeIndex).toBe(0);
      expect(preview?.positions.a.x).toBeCloseTo(110, 5);
      expect(preview?.positions.a.y).toBeCloseTo(30, 5);
    });
  });
});
