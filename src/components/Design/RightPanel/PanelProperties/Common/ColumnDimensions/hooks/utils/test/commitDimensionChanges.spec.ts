// store
import { addNode, addNodes, groupNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { commitDimensionChanges } from '../commitDimensionChanges';

const addFrameNode = (width: number, height: number, widthSizingMode?: SizingMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      widthSizingMode,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

const addGroupOfTwo = (): { groupId: string; ids: string[] } => {
  const ids = ['group-child-a', 'group-child-b'];

  store.dispatch(
    addNodes({
      nodes: ids.map((id, index) => ({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' as const }],
        height: 40,
        id,
        name: id,
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle as const,
        width: 40,
        x: 1000 + index * 60,
        y: 1000,
      })),
      rootIds: ids,
    }),
  );
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return { groupId: selectActivePage(store.getState()).selectedIds[0], ids };
};

describe('commitDimensionChanges', () => {
  it('should dispatch the given dimension changes as-is when there is no selected node', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    // before
    commitDimensionChanges(store.dispatch, frameId, undefined, 100, 50, { height: 80, width: 100 });

    // result
    expect(readNode(frameId)).toMatchObject({ height: 80, width: 100 });
  });

  it('should clamp the dimension changes to the selected node’s own min/max bounds', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(updateNode({ changes: { maxWidth: 150 }, id: frameId }));

    const frameNode = readNode(frameId);

    // before
    commitDimensionChanges(store.dispatch, frameId, frameNode, 100, 50, { height: 50, width: 200 });

    // result
    expect(readNode(frameId)).toMatchObject({ width: 150 });
  });

  it('should switch a hugging width axis back to fixed once the width actually changes', () => {
    // mock
    const frameId = addFrameNode(100, 50, SizingMode.hug);
    const frameNode = readNode(frameId);

    // before
    commitDimensionChanges(store.dispatch, frameId, frameNode, 100, 50, { height: 50, width: 200 });

    // result
    expect(readNode(frameId)).toMatchObject({ width: 200, widthSizingMode: SizingMode.fixed });
  });

  it('should not touch the sizing mode when the dimension does not actually change', () => {
    // mock
    const frameId = addFrameNode(100, 50, SizingMode.hug);
    const frameNode = readNode(frameId);

    // before
    commitDimensionChanges(store.dispatch, frameId, frameNode, 100, 50, { height: 80, width: 100 });

    // result
    expect(readNode(frameId)).toMatchObject({ widthSizingMode: SizingMode.hug });
  });

  it('should scale a stored image fill’s crop proportionally with the new dimensions', () => {
    // mock
    const frameId = addFrameNode(100, 50);
    const paint: TImagePaint = {
      crop: { height: 25, rotation: 0, width: 50, x: 25, y: 12.5 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };

    store.dispatch(updateNode({ changes: { fills: [paint] }, id: frameId }));

    const frameNode = readNode(frameId);

    // before
    commitDimensionChanges(store.dispatch, frameId, frameNode, 100, 50, { height: 50, width: 200 });

    // result
    const updated = readNode(frameId);

    expect(updated.width).toBe(200);
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 25, rotation: 0, width: 100, x: 50, y: 12.5 });
  });

  it('should scale the children of a group from its top left corner instead of only resizing its box', () => {
    // mock
    const { groupId, ids } = addGroupOfTwo();
    const group = selectActivePage(store.getState()).nodes[groupId];

    // action
    commitDimensionChanges(store.dispatch, groupId, group, 100, 40, { height: 80, width: 200 });

    // result
    expect(readNode(groupId)).toMatchObject({ height: 80, width: 200, x: 1000, y: 1000 });
    expect(ids.map(readNode).map(({ height, width, x, y }) => ({ height, width, x, y }))).toEqual([
      { height: 80, width: 80, x: 1000, y: 1000 },
      { height: 80, width: 80, x: 1120, y: 1000 },
    ]);
  });
});
