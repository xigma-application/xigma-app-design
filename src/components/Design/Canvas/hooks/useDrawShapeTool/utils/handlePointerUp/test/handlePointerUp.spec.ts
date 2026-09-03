// store
import { setActiveTool, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerUp } from '../handlePointerUp';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerup', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.frame));
  });

  it('should do nothing but end the history gesture when the drag never started', () => {
    // mock
    const canvas = createCanvas();
    const nodesBefore = selectActivePage(store.getState()).rootOrder.length;

    // before & result — must not throw even with no pending shape
    expect(() =>
      handlePointerUp(
        canvas,
        pointerEvent(50, 50),
        store.dispatch,
        store,
        createCanvasRefs(),
        IDENTITY_VIEWPORT,
        { current: null },
        { current: [] },
        '#ff0000',
        'Rectangle',
        NodeType.rectangle,
      ),
    ).not.toThrow();

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(nodesBefore);
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should create a frame with childIds and clipContent, select it, and reset the tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(120, 130),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: [] },
      '#ff0000',
      'Frame',
      NodeType.frame,
    );

    // result
    const page = selectActivePage(store.getState());
    const newId = page.rootOrder.at(-1) as string;

    expect(page.nodes[newId]).toMatchObject({ childIds: [], clipContent: true, type: NodeType.frame } as Partial<TFrameNode>);
    expect(page.selectedIds).toEqual([newId]);
    expect(refs.draftRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should create a section with childIds but no clipContent', () => {
    // before
    handlePointerUp(
      createCanvas(),
      pointerEvent(120, 130),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: [] },
      '#444444',
      'Section',
      NodeType.section,
    );

    // result
    const page = selectActivePage(store.getState());
    const newId = page.rootOrder.at(-1) as string;

    expect(page.nodes[newId]).toMatchObject({ childIds: [], type: NodeType.section } as Partial<TSectionNode>);
    expect(page.nodes[newId]).not.toHaveProperty('clipContent');
  });

  it('should create a plain rectangle with neither childIds nor clipContent', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    handlePointerUp(
      createCanvas(),
      pointerEvent(120, 130),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: [] },
      '#0000ff',
      'Rectangle',
      NodeType.rectangle,
    );

    // result
    const page = selectActivePage(store.getState());
    const newId = page.rootOrder.at(-1) as string;

    expect(page.nodes[newId].type).toBe(NodeType.rectangle);
    expect(page.nodes[newId]).not.toHaveProperty('childIds');
  });
});
