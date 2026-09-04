// store
import { deleteNode, setActiveTool, setSelection, setViewport } from 'store/design/slice';
import { selectActivePage, selectActiveTool, selectSelectedIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handleCreateFramePreset } from '../handleCreateFramePreset';

const PRESET = { height: 874, label: 'iPhone 17', width: 402 };

describe('handleCreateFramePreset', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should create a frame with the preset dimensions', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    const page = selectActivePage(store.getState());
    const [nodeId] = page.rootOrder;
    expect(page.nodes[nodeId]).toMatchObject({ height: 874, type: NodeType.frame, width: 402 });
  });

  it('should center the frame in the visible canvas area', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    const page = selectActivePage(store.getState());
    const [nodeId] = page.rootOrder;
    expect(page.nodes[nodeId]).toMatchObject({ x: 500 - 402 / 2, y: 300 - 874 / 2 });
  });

  it('should account for the left and right panel widths when centering', () => {
    // mock
    const refs = createCanvasRefs({
      canvasRef: { current: canvas },
      layout: { leftPanelWidthRef: { current: 200 }, rightPanelWidthRef: { current: 100 } },
    });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    const page = selectActivePage(store.getState());
    const [nodeId] = page.rootOrder;
    const expectedCenterX = 200 + (1000 - 200 - 100) / 2;
    expect(page.nodes[nodeId]).toMatchObject({ x: expectedCenterX - 402 / 2 });
  });

  it('should account for the current viewport pan and zoom when centering', () => {
    // mock
    store.dispatch(setViewport({ x: 100, y: 50, zoom: 2 }));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    const page = selectActivePage(store.getState());
    const [nodeId] = page.rootOrder;
    expect(page.nodes[nodeId]).toMatchObject({ x: (500 - 100) / 2 - 402 / 2, y: (300 - 50) / 2 - 874 / 2 });
  });

  it('should select the created frame', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    const page = selectActivePage(store.getState());
    expect(selectSelectedIds(store.getState())).toEqual([page.rootOrder[0]]);
  });

  it('should switch the active tool back to default', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.frame));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    expect(selectActiveTool(store.getState())).toBe(ToolName.default);
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleCreateFramePreset(store.dispatch, refs, PRESET);

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
