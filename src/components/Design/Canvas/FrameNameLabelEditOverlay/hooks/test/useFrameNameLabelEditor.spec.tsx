import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../../../hooks/useCanvasRefs/createCanvasRefs';
import { TFrameNameLabelEdit } from '../utils/getFrameNameLabelEditTarget';
import { useFrameNameLabelEditor } from '../useFrameNameLabelEditor';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

const getFrameNameLabelEditTargetMock = vi.fn();

vi.mock('../utils/getFrameNameLabelEditTarget', () => ({
  getFrameNameLabelEditTarget: (...args: unknown[]): unknown => getFrameNameLabelEditTargetMock(...args),
}));

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

// each frame gets auto-numbered off every frame created so far in the shared store, so read the
// name back rather than assuming "Frame 1"
const addFrame = (): { id: string; name: string } => {
  store.dispatch(
    addNode({ fill: '#ffffff', height: 100, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 200, x: 0, y: 0 }),
  );

  const { nodes, rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  return { id, name: nodes[id].name };
};

const editFor = (frame: { id: string; name: string }): TFrameNameLabelEdit => ({
  angleDeg: 0,
  centerY: -20,
  height: 24,
  left: 100,
  nodeId: frame.id,
  value: frame.name,
});

const renderEditor = (): {
  canvas: HTMLCanvasElement;
  refs: TCanvasRefs;
  result: { current: ReturnType<typeof useFrameNameLabelEditor> };
} => {
  const canvas = createCanvas();
  const refs = createCanvasRefs();
  refs.canvasRef.current = canvas;

  const { result } = renderHook(() => useFrameNameLabelEditor(refs), { wrapper });

  return { canvas, refs, result };
};

const doubleClick = (canvas: HTMLCanvasElement, x: number, y: number): void => {
  act(() => {
    canvas.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: x, clientY: y }));
  });
};

describe('useFrameNameLabelEditor', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    getFrameNameLabelEditTargetMock.mockReset().mockReturnValue(null);
  });

  it('should stay idle until a double-click hits a label', () => {
    // before
    const { canvas, result } = renderEditor();

    doubleClick(canvas, 500, 500);

    // result
    expect(result.current.edit).toBeNull();
  });

  it('should open an edit with whatever the hit-target lookup returns', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { canvas, refs, result } = renderEditor();

    // before
    doubleClick(canvas, 100, -20);

    // result
    expect(result.current.edit).toEqual(editFor(frame));
    expect(refs.frameName.editingLabelRef.current).toBe(frame.id);
  });

  it('should rename the node on commit, and close', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { canvas, refs, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit('Header'));

    // result
    expect(selectActivePage(store.getState()).nodes[frame.id]).toMatchObject({ name: 'Header' });
    expect(result.current.edit).toBeNull();
    expect(refs.frameName.editingLabelRef.current).toBeNull();
  });

  it('should trim the committed name before writing it', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit('  Header  '));

    // result
    expect(selectActivePage(store.getState()).nodes[frame.id]).toMatchObject({ name: 'Header' });
  });

  it('should not dispatch a rename on commit of an empty string', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit('   '));

    // result — untouched
    expect(selectActivePage(store.getState()).nodes[frame.id]).toMatchObject({ name: frame.name });
    expect(result.current.edit).toBeNull();
  });

  it('should not dispatch a rename on commit of the unchanged current name', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit(frame.name));

    // result — untouched
    expect(selectActivePage(store.getState()).nodes[frame.id]).toMatchObject({ name: frame.name });
    expect(result.current.edit).toBeNull();
  });

  it('should close without any change on cancel', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { canvas, refs, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.cancel());

    // result
    expect(result.current.edit).toBeNull();
    expect(refs.frameName.editingLabelRef.current).toBeNull();
    expect(selectActivePage(store.getState()).nodes[frame.id]).toMatchObject({ name: frame.name });
  });

  it('should be a no-op when commit is called with nothing open', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    const { result } = renderEditor();

    // before — no double-click happened
    act(() => result.current.commit('Header'));

    // result
    expect(result.current.edit).toBeNull();
    expect(selectActivePage(store.getState()).nodes[frame.id]).toMatchObject({ name: frame.name });
  });

  it('should ignore double-clicks while a drawing tool is active', () => {
    // mock
    const frame = addFrame();

    getFrameNameLabelEditTargetMock.mockReturnValue(editFor(frame));
    store.dispatch(setActiveTool(ToolName.frame));
    const { canvas, result } = renderEditor();

    // before
    doubleClick(canvas, 100, -20);

    // result
    expect(result.current.edit).toBeNull();
  });
});
