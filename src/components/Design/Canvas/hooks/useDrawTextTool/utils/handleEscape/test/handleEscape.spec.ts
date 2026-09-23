// store
import { addNode, setActiveTool } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handleEscape } from '../handleEscape';

const createTextNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      content: '',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter MSDF',
      fontSize: 14,
      height: 10,
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  return payload.id;
};

describe('handleEscape', () => {
  it('should delete the in-progress node, clear the refs, and reset the tool', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.text));

    const nodeId = createTextNode();
    const startRef = { current: { x: 1, y: 1 } };
    const nodeIdRef = { current: nodeId };
    const dropTargetRef = { current: { parentId: null, targetIndex: 0 } };
    const refs = createCanvasRefs();

    refs.drawing.cancelDrawRef.current = (): void => undefined;

    // before
    handleEscape(store.dispatch, refs, startRef, nodeIdRef, dropTargetRef);

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
    expect(startRef.current).toBeNull();
    expect(nodeIdRef.current).toBeNull();
    expect(dropTargetRef.current).toBeNull();
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
    expect(refs.drawing.cancelDrawRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
