// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TKeyMap } from 'hooks';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { nudgeMap } from '../nudgeMap';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const resetNodePosition = (id: string): void => {
  store.dispatch(updateNode({ changes: { x: 0, y: 0 }, id }));
};

const triggerAndReadDelta = (keyMap: TKeyMap, id: string): { x: number; y: number } => {
  const event = new KeyboardEvent('keydown', { code: keyMap.secondaryKey });

  keyMap.action(event, event.code);

  const node = store.getState().design.nodes[id];

  resetNodePosition(id);

  return { x: (node as { x: number }).x, y: (node as { y: number }).y };
};

describe('nudgeMap', () => {
  it('should build exactly 8 key map entries — one plain and one Shift-modified per arrow direction', () => {
    // action
    const keyMaps = nudgeMap(store.dispatch, createCanvasRefs());

    // result
    expect(keyMaps).toHaveLength(8);
    expect(keyMaps.filter((keyMap) => (keyMap.primaryKeys as string[] | undefined)?.includes('shift'))).toHaveLength(4);
  });

  it('should nudge by 1px on the plain arrows and by 10px on the Shift-modified arrows, in the correct direction', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    const [left, right, up, down, leftLarge, rightLarge, upLarge, downLarge] = nudgeMap(store.dispatch, createCanvasRefs());

    // result
    expect(triggerAndReadDelta(left, frameId)).toEqual({ x: -1, y: 0 });
    expect(triggerAndReadDelta(right, frameId)).toEqual({ x: 1, y: 0 });
    expect(triggerAndReadDelta(up, frameId)).toEqual({ x: 0, y: -1 });
    expect(triggerAndReadDelta(down, frameId)).toEqual({ x: 0, y: 1 });
    expect(triggerAndReadDelta(leftLarge, frameId)).toEqual({ x: -10, y: 0 });
    expect(triggerAndReadDelta(rightLarge, frameId)).toEqual({ x: 10, y: 0 });
    expect(triggerAndReadDelta(upLarge, frameId)).toEqual({ x: 0, y: -10 });
    expect(triggerAndReadDelta(downLarge, frameId)).toEqual({ x: 0, y: 10 });
  });
});
