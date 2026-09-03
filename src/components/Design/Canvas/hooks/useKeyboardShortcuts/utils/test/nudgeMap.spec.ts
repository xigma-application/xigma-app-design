// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TKeyMap } from 'hooks';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { nudgeMap } from '../nudgeMap';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const resetNodePosition = (id: string): void => {
  store.dispatch(updateNode({ changes: { x: 0, y: 0 }, id }));
};

const triggerAndReadDelta = (keyMap: TKeyMap, id: string): { x: number; y: number } => {
  const event = new KeyboardEvent('keydown', { code: keyMap.secondaryKey });

  keyMap.action(event, event.code);

  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[id];

  resetNodePosition(id);

  return { x: (node as { x: number }).x, y: (node as { y: number }).y };
};

describe('nudgeMap', () => {
  it('should build exactly 16 key map entries — plain, Alt-modified, Shift-modified and Alt+Shift-modified per arrow direction', () => {
    // action
    const keyMaps = nudgeMap(store.dispatch, createCanvasRefs());

    // result
    expect(keyMaps).toHaveLength(16);
    expect(keyMaps.filter((keyMap) => (keyMap.primaryKeys as string[] | undefined)?.includes('shift'))).toHaveLength(8);
    expect(keyMaps.filter((keyMap) => (keyMap.primaryKeys as string[] | undefined)?.includes('alt'))).toHaveLength(8);
  });

  it('should nudge by 1px on the plain/Alt arrows and by 10px on the Shift/Alt+Shift arrows, in the correct direction', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    const [
      left,
      right,
      up,
      down,
      leftAlt,
      rightAlt,
      upAlt,
      downAlt,
      leftLarge,
      rightLarge,
      upLarge,
      downLarge,
      leftAltLarge,
      rightAltLarge,
      upAltLarge,
      downAltLarge,
    ] = nudgeMap(store.dispatch, createCanvasRefs());

    // result
    expect(triggerAndReadDelta(left, frameId)).toEqual({ x: -1, y: 0 });
    expect(triggerAndReadDelta(right, frameId)).toEqual({ x: 1, y: 0 });
    expect(triggerAndReadDelta(up, frameId)).toEqual({ x: 0, y: -1 });
    expect(triggerAndReadDelta(down, frameId)).toEqual({ x: 0, y: 1 });
    // Alt-modified variants nudge the same amount as their non-Alt counterpart — Alt isn't a step
    // modifier here, it exists only so nudging still fires while Alt is held (see shortcuts.ts's
    // nudge*Alt comment)
    expect(triggerAndReadDelta(leftAlt, frameId)).toEqual({ x: -1, y: 0 });
    expect(triggerAndReadDelta(rightAlt, frameId)).toEqual({ x: 1, y: 0 });
    expect(triggerAndReadDelta(upAlt, frameId)).toEqual({ x: 0, y: -1 });
    expect(triggerAndReadDelta(downAlt, frameId)).toEqual({ x: 0, y: 1 });
    expect(triggerAndReadDelta(leftLarge, frameId)).toEqual({ x: -10, y: 0 });
    expect(triggerAndReadDelta(rightLarge, frameId)).toEqual({ x: 10, y: 0 });
    expect(triggerAndReadDelta(upLarge, frameId)).toEqual({ x: 0, y: -10 });
    expect(triggerAndReadDelta(downLarge, frameId)).toEqual({ x: 0, y: 10 });
    expect(triggerAndReadDelta(leftAltLarge, frameId)).toEqual({ x: -10, y: 0 });
    expect(triggerAndReadDelta(rightAltLarge, frameId)).toEqual({ x: 10, y: 0 });
    expect(triggerAndReadDelta(upAltLarge, frameId)).toEqual({ x: 0, y: -10 });
    expect(triggerAndReadDelta(downAltLarge, frameId)).toEqual({ x: 0, y: 10 });
  });
});
