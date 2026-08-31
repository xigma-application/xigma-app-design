import { Provider } from 'react-redux';
import { RefObject } from 'react';
import { act, renderHook } from '@testing-library/react';

// core
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useClassNames } from 'components/Design/core/ClassNamesProvider/hooks/useClassNames';
import { useDrawTextOnPathTool } from './useDrawTextOnPathTool';

// store
import { addNode, setActiveTool, setSelection, stopTextEdit } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDraftEntity, TVectorNode } from 'types/design/types';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  // jsdom doesn't implement pointer capture on elements
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent(type, { button, clientX: x, clientY: y, pointerId: 1 });

const renderTextOnPathTool = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draftRef: RefObject<TDraftEntity | null>,
): RefObject<string | null> => {
  const classNameRef: RefObject<string | null> = { current: null };

  renderHook(
    () => {
      useDrawTextOnPathTool(createCanvasRefs({ canvasRef, draftRef }));
      classNameRef.current = useClassNames().className;
    },
    {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    },
  );

  return classNameRef;
};

const addOpenLineVectorNode = (a: { x: number; y: number }, b: { x: number; y: number }): string => {
  const segments: TVectorNode['segments'] = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };

  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      fillColorOverrideByKey: { face: '#ffffff' },
      filledFaceKeys: ['face'],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', ...a }, b: { id: 'b', ...b } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addBranchingVectorNode = (hub: { x: number; y: number }): string => {
  const segments: TVectorNode['segments'] = {
    s1: { endId: 'b', id: 's1', startId: 'hub', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'hub', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'hub', tangentEnd: null, tangentStart: null },
  };

  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        b: { id: 'b', x: hub.x + 50, y: hub.y },
        c: { id: 'c', x: hub.x, y: hub.y + 50 },
        d: { id: 'd', x: hub.x - 50, y: hub.y },
        hub: { id: 'hub', ...hub },
      },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useDrawTextOnPathTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(stopTextEdit());
  });

  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4000, 4000));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4020, 4020));
    });

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should show an ellipse-shaped path draft while dragging', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4100, 4100));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4150, 4140));
    });

    // result
    expect(draftRef.current).toEqual({ height: 40, pathType: 'ellipse', type: NodeType.path, width: 50, x: 4100, y: 4100 });
  });

  it('should create a path node and immediately start editing text on it when the drag completes', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4200, 4200));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4250, 4240));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 4250, 4240));
    });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];
    const [pathNodeId] = page.rootOrder;

    expect(page.nodes[pathNodeId]).toMatchObject({ height: 40, pathType: 'ellipse', type: NodeType.path, width: 50, x: 4200, y: 4200 });
    expect(page.selectedIds).toEqual([pathNodeId]);
    expect(design.editingTextBox).toMatchObject({ height: 40, pathId: pathNodeId, pathStartOffset: 0.75, width: 50, x: 4200, y: 4200 });
    expect(design.activeTool).toBe(ToolName.default);
    expect(draftRef.current).toBeNull();
  });

  it('should ignore a non-primary button press', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4300, 4300, 1));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4350, 4340));
    });

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should create a default 100x100 path centered on the click point and start editing on a plain click', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4400, 4400));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 4400, 4400));
    });

    // result
    const { design } = store.getState();

    expect(design.editingTextBox).toMatchObject({ height: 100, pathStartOffset: 0.75, width: 100, x: 4350, y: 4350 });
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should attach text to an eligible vector on a plain click, clearing its fill, skipping the ellipse path, and starting right at the clicked point', () => {
    // mock — a straight a(6000,6000)->b(6100,6000) open chain
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const vectorId = addOpenLineVectorNode({ x: 6000, y: 6000 }, { x: 6100, y: 6000 });
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action — a plain click at the chain's own midpoint, no drag
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 6050, 6000));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 6050, 6000));
    });

    // result — no new path node was created; the vector itself became the path, reading starts
    // from the clicked midpoint (offset 0.5) instead of always the chain's own start
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.nodes[vectorId]).toMatchObject({ fillColor: null, fillColorOverrideByKey: {}, filledFaceKeys: [] });
    expect(page.selectedIds).toEqual([vectorId]);
    expect(design.editingTextBox).toMatchObject({ pathFlip: false, pathId: vectorId, rotation: 0 });
    expect(design.editingTextBox?.pathStartOffset).toBeCloseTo(0.5, 5);
    expect(design.activeTool).toBe(ToolName.default);
    expect(draftRef.current).toBeNull();
  });

  it('should not attach to a branching (ineligible) vector, falling back to drawing an ellipse path instead', () => {
    // mock — a 3-way "Y" hub, ineligible for text-on-path (same condition as Variable Width)
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const vectorId = addBranchingVectorNode({ x: 6300, y: 6300 });
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action — click directly on the hub vertex, where the branching vector itself sits
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 6300, 6300));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 6300, 6300));
    });

    // result — the branching vector is untouched; a fresh default-sized ellipse path was drawn instead
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.nodes[vectorId]).toMatchObject({ fillColor: null, filledFaceKeys: [] });
    expect(design.editingTextBox).toMatchObject({ pathStartOffset: 0.75, width: 100, x: 6250, y: 6250 });
    expect(design.editingTextBox?.pathId).not.toBe(vectorId);
  });

  it('should disarm the attach and fall back to the ellipse draft once the drag moves past the attach slop', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    addOpenLineVectorNode({ x: 6400, y: 6400 }, { x: 6500, y: 6400 });

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action — pointerdown lands on the vector, but the drag then travels far past the slop
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 6450, 6400));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 6480, 6440));
    });

    // result — a live ellipse draft now shows instead of staying armed to attach
    expect(draftRef.current).toEqual({ height: 40, pathType: 'ellipse', type: NodeType.path, width: 30, x: 6450, y: 6400 });
  });

  it('should preview the attach cursor while hovering an eligible vector, and the plain drawing cursor elsewhere', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    addOpenLineVectorNode({ x: 6600, y: 6600 }, { x: 6700, y: 6600 });

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    const classNameRef = renderTextOnPathTool(canvasRef, draftRef);

    // action — hover directly over the vector's stroke
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 6650, 6600));
    });

    // result
    expect(classNameRef.current).toBe('text-on-path');

    // action — hover somewhere far from any vector
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 6650, 6900));
    });

    // result
    expect(classNameRef.current).toBe('drawing');
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 4500, 4500));
    });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.textOnPath);
  });
});
