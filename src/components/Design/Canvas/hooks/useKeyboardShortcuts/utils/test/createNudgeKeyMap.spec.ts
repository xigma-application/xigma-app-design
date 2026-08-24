// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { KeyboardKeys } from 'types/enums';
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { createNudgeKeyMap } from '../createNudgeKeyMap';

describe('createNudgeKeyMap', () => {
  it('should spread the given shortcut onto the resulting key map entry', () => {
    // action
    const keyMap = createNudgeKeyMap(store.dispatch, createCanvasRefs(), 1, 0, { secondaryKey: KeyboardKeys.arrowRight });

    // result
    expect(keyMap.secondaryKey).toBe(KeyboardKeys.arrowRight);
  });

  it('should prevent the default browser behavior and nudge the selection by the given delta when triggered', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );

    const { rootOrder } = store.getState().design;
    const frameId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([frameId]));

    const keyMap = createNudgeKeyMap(store.dispatch, createCanvasRefs(), 1, 2, { secondaryKey: KeyboardKeys.arrowRight });
    const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // action
    keyMap.action(event, event.code);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(store.getState().design.nodes[frameId]).toMatchObject({ x: 1, y: 2 });
  });
});
