import { RefObject } from 'react';

// store
import { addGuide, addNode, groupNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { armRotatedGroupResizeDrag } from '../armRotatedGroupResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const createResizeDragRef = (): RefObject<TResizeDragState | null> => ({ current: null });

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

describe('armRotatedGroupResizeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should capture origins for the whole subtree, including a nested group and its own children', () => {
    // mock — group two frames, then group that group with a third frame, then rotate the outer group
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(30, 0);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    const [innerGroupId] = selectSelectedIds(store.getState());
    const idC = addFrameNode(60, 60);

    store.dispatch(setSelection([innerGroupId, idC]));
    store.dispatch(groupNodes());

    const [outerGroupId] = selectSelectedIds(store.getState());

    store.dispatch(updateNode({ changes: { rotation: 25 }, id: outerGroupId }));

    const outerGroup = selectActivePage(store.getState()).nodes[outerGroupId] as TGroupNode;
    const resizeDragRef = createResizeDragRef();

    // action
    armRotatedGroupResizeDrag(createCanvas(), new PointerEvent('pointerdown', { pointerId: 1 }), resizeDragRef, outerGroup, 'se', {
      height: outerGroup.height,
      width: outerGroup.width,
      x: outerGroup.x,
      y: outerGroup.y,
    });

    // result — the nested group and every leaf are captured, the outer group itself is not among them
    const childOrigins = resizeDragRef.current?.rotatedGroupChildOrigins ?? {};
    expect(Object.keys(childOrigins).sort()).toEqual([idA, idB, idC, innerGroupId].sort());
    expect(resizeDragRef.current?.nodeOrigins).toEqual({
      [outerGroupId]: {
        flip: null,
        height: outerGroup.height,
        rotation: outerGroup.rotation,
        width: outerGroup.width,
        x: outerGroup.x,
        y: outerGroup.y,
      },
    });
  });

  it('should include a candidate shape for every guide', () => {
    // mock
    const idA = addFrameNode(0, 0);

    store.dispatch(setSelection([idA]));
    store.dispatch(groupNodes());

    const [groupId] = selectSelectedIds(store.getState());

    store.dispatch(updateNode({ changes: { rotation: 25 }, id: groupId }));

    const group = selectActivePage(store.getState()).nodes[groupId] as TGroupNode;
    const resizeDragRef = createResizeDragRef();
    const canvas = createCanvas();

    Object.defineProperty(canvas, 'clientWidth', { value: 800 });
    Object.defineProperty(canvas, 'clientHeight', { value: 600 });
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 15 }));

    // action
    armRotatedGroupResizeDrag(canvas, new PointerEvent('pointerdown', { pointerId: 1 }), resizeDragRef, group, 'se', {
      height: group.height,
      width: group.width,
      x: group.x,
      y: group.y,
    });

    // result
    expect(resizeDragRef.current?.candidateShapes).toContainEqual({
      bounds: { height: 600, width: 0, x: 15, y: 0 },
      points: expect.any(Array),
    });
  });
});
