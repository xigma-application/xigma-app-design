// store
import { addNodes, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { dispatchFlowReorder } from '../dispatchFlowReorder';

let seq = 0;

const setupFrame = (childIds: string[]): TFrameNode => {
  seq += 1;

  const frameId = `dispatch-flow-reorder-frame-${seq}`;
  const frame: TFrameNode = {
    childIds,
    clipContent: true,
    fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
    height: 100,
    id: frameId,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
  };

  store.dispatch(
    addNodes({
      nodes: [
        frame,
        ...childIds.map((id) => ({
          fill: '#000',
          height: 20,
          id,
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: 20,
          x: 0,
          y: 0,
        })),
      ] as any,
      rootIds: [frameId],
    }),
  );

  return frame;
};

const childIds = (frameId: string): string[] => (selectActivePage(store.getState()).nodes[frameId] as TFrameNode).childIds;

describe('dispatchFlowReorder', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should move the given nodes to sit right before the anchor', () => {
    // before
    const frame = setupFrame(['a', 'b', 'c']);

    dispatchFlowReorder(store.dispatch, createCanvasRefs(), frame, ['c'], 'a', 'before');

    // result
    expect(childIds(frame.id)).toEqual(['c', 'a', 'b']);
  });

  it('should move the given nodes to sit right after the anchor', () => {
    // before
    const frame = setupFrame(['a', 'b', 'c']);

    dispatchFlowReorder(store.dispatch, createCanvasRefs(), frame, ['a'], 'b', 'after');

    // result
    expect(childIds(frame.id)).toEqual(['b', 'a', 'c']);
  });

  it('should append at the end when no anchor is given', () => {
    // before
    const frame = setupFrame(['a', 'b', 'c']);

    dispatchFlowReorder(store.dispatch, createCanvasRefs(), frame, ['a'], undefined, 'before');

    // result
    expect(childIds(frame.id)).toEqual(['b', 'c', 'a']);
  });

  it('should be undoable as a single step', () => {
    // before
    const frame = setupFrame(['a', 'b', 'c']);

    dispatchFlowReorder(store.dispatch, createCanvasRefs(), frame, ['c'], 'a', 'before');
    store.dispatch(undo());

    // result
    expect(childIds(frame.id)).toEqual(['a', 'b', 'c']);
  });
});
