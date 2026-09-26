// store
import { addNode, setActiveTool } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handleEscape } from '../handleEscape';

const createMediaNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      flipX: false,
      flipY: false,
      height: 10,
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'blob:mock-url',
      type: NodeType.media,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  return payload.id;
};

describe('handleEscape', () => {
  it('should delete the in-progress node, clear the armed queue, and reset the tool', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.media));

    const nodeId = createMediaNode();
    const armedRef = { current: { kind: 'image' as const, naturalHeight: 1, naturalWidth: 1, src: 'blob:mock-url' } };
    const queueRef = { current: [new File(['x'], 'next.png', { type: 'image/png' })] };
    const startRef = { current: { x: 1, y: 1 } };
    const nodeIdRef = { current: nodeId };
    const dropTargetRef = { current: { parentId: null, targetIndex: 0 } };
    const aspectRatioLockGuideRef = { current: { height: 1, rotation: 0, width: 1, x: 0, y: 0 } };
    const refs = createCanvasRefs();

    refs.drawing.cancelDrawRef.current = (): void => undefined;

    // before
    handleEscape(store.dispatch, refs, armedRef, queueRef, startRef, nodeIdRef, dropTargetRef, aspectRatioLockGuideRef);

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
    expect(armedRef.current).toBeNull();
    expect(queueRef.current).toEqual([]);
    expect(startRef.current).toBeNull();
    expect(nodeIdRef.current).toBeNull();
    expect(dropTargetRef.current).toBeNull();
    expect(aspectRatioLockGuideRef.current).toBeNull();
    expect(refs.drawing.cancelDrawRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
