import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../../../hooks/useCanvasRefs/createCanvasRefs';
import { TSectionNameLabelEdit } from '../utils/getSectionNameLabelEditTarget';
import { useSectionNameLabelEditor } from '../useSectionNameLabelEditor';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

const getSectionNameLabelEditTargetMock = vi.fn();

vi.mock('../utils/getSectionNameLabelEditTarget', () => ({
  getSectionNameLabelEditTarget: (...args: unknown[]): unknown => getSectionNameLabelEditTargetMock(...args),
}));

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

// each section gets auto-numbered off every section created so far in the shared store, so read
// the name back rather than assuming "Section 1"
const addSection = (): { id: string; name: string } => {
  store.dispatch(
    addNode({
      childIds: [],
      fill: '#444444',
      height: 100,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { nodes, rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  return { id, name: nodes[id].name };
};

const editFor = (section: { id: string; name: string }): TSectionNameLabelEdit => ({
  centerY: -20,
  height: 24,
  left: 100,
  nodeId: section.id,
  value: section.name,
});

const renderEditor = (): {
  canvas: HTMLCanvasElement;
  refs: TCanvasRefs;
  result: { current: ReturnType<typeof useSectionNameLabelEditor> };
} => {
  const canvas = createCanvas();
  const refs = createCanvasRefs();
  refs.canvasRef.current = canvas;

  const { result } = renderHook(() => useSectionNameLabelEditor(refs), { wrapper });

  return { canvas, refs, result };
};

const doubleClick = (canvas: HTMLCanvasElement, x: number, y: number): void => {
  act(() => {
    canvas.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: x, clientY: y }));
  });
};

describe('useSectionNameLabelEditor', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    getSectionNameLabelEditTargetMock.mockReset().mockReturnValue(null);
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
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { canvas, refs, result } = renderEditor();

    // before
    doubleClick(canvas, 100, -20);

    // result
    expect(result.current.edit).toEqual(editFor(section));
    expect(refs.sectionName.editingLabelRef.current).toBe(section.id);
  });

  it('should rename the node on commit, and close', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { canvas, refs, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit('Header'));

    // result
    expect(selectActivePage(store.getState()).nodes[section.id]).toMatchObject({ name: 'Header' });
    expect(result.current.edit).toBeNull();
    expect(refs.sectionName.editingLabelRef.current).toBeNull();
  });

  it('should trim the committed name before writing it', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit('  Header  '));

    // result
    expect(selectActivePage(store.getState()).nodes[section.id]).toMatchObject({ name: 'Header' });
  });

  it('should not dispatch a rename on commit of an empty string', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit('   '));

    // result — untouched
    expect(selectActivePage(store.getState()).nodes[section.id]).toMatchObject({ name: section.name });
    expect(result.current.edit).toBeNull();
  });

  it('should not dispatch a rename on commit of the unchanged current name', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { canvas, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.commit(section.name));

    // result — untouched
    expect(selectActivePage(store.getState()).nodes[section.id]).toMatchObject({ name: section.name });
    expect(result.current.edit).toBeNull();
  });

  it('should close without any change on cancel', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { canvas, refs, result } = renderEditor();
    doubleClick(canvas, 100, -20);

    // before
    act(() => result.current.cancel());

    // result
    expect(result.current.edit).toBeNull();
    expect(refs.sectionName.editingLabelRef.current).toBeNull();
    expect(selectActivePage(store.getState()).nodes[section.id]).toMatchObject({ name: section.name });
  });

  it('should be a no-op when commit is called with nothing open', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    const { result } = renderEditor();

    // before — no double-click happened
    act(() => result.current.commit('Header'));

    // result
    expect(result.current.edit).toBeNull();
    expect(selectActivePage(store.getState()).nodes[section.id]).toMatchObject({ name: section.name });
  });

  it('should ignore double-clicks while a drawing tool is active', () => {
    // mock
    const section = addSection();

    getSectionNameLabelEditTargetMock.mockReturnValue(editFor(section));
    store.dispatch(setActiveTool(ToolName.frame));
    const { canvas, result } = renderEditor();

    // before
    doubleClick(canvas, 100, -20);

    // result
    expect(result.current.edit).toBeNull();
  });
});
