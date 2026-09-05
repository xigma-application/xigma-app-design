// store
import { addGuide, addNode, setViewport, toggleRulers } from 'store/design/slice';
import { selectActivePage, selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TGuideDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1 });

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    if (!selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should do nothing when nothing is being dragged', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerUp(canvas, pointerEvent(200, 200), store.dispatch, refs);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should commit a new page guide dropped outside the gutter', () => {
    // mock
    const canvas = createCanvas();
    const draggingGuideRef = { current: { axis: 'x', frameId: null, hasMoved: true, id: null, position: 50 } as TGuideDragState | null };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before
    handlePointerUp(canvas, pointerEvent(200, 200), store.dispatch, refs);

    // result
    expect(selectActivePage(store.getState()).guides).toContainEqual({ axis: 'x', id: expect.any(String), position: 50 });
    expect(draggingGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should discard an uncommitted drag-out dropped back onto a gutter', () => {
    // mock
    const canvas = createCanvas();
    const guidesBefore = selectActivePage(store.getState()).guides;
    const draggingGuideRef = { current: { axis: 'x', frameId: null, hasMoved: true, id: null, position: 50 } as TGuideDragState | null };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before
    handlePointerUp(canvas, pointerEvent(5, 200), store.dispatch, refs);

    // result
    expect(selectActivePage(store.getState()).guides).toEqual(guidesBefore);
    expect(draggingGuideRef.current).toBeNull();
  });

  it('should commit the new position of a moved guide', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 50 }));
    const [guide] = selectActivePage(store.getState()).guides.filter((candidate) => candidate.position === 50);
    const canvas = createCanvas();
    const draggingGuideRef = {
      current: { axis: 'x', frameId: null, hasMoved: true, id: guide.id, position: 250 } as TGuideDragState | null,
    };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before
    handlePointerUp(canvas, pointerEvent(200, 200), store.dispatch, refs);

    // result
    expect(selectActivePage(store.getState()).guides.find((candidate) => candidate.id === guide.id)?.position).toBe(250);
  });

  it('should delete a moved guide dropped onto a gutter', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 60 }));
    const [guide] = selectActivePage(store.getState()).guides.filter((candidate) => candidate.position === 60);
    const canvas = createCanvas();
    const draggingGuideRef = {
      current: { axis: 'x', frameId: null, hasMoved: true, id: guide.id, position: 250 } as TGuideDragState | null,
    };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before
    handlePointerUp(canvas, pointerEvent(5, 200), store.dispatch, refs);

    // result
    expect(selectActivePage(store.getState()).guides.find((candidate) => candidate.id === guide.id)).toBeUndefined();
  });

  it('should do nothing to the store on a plain click (no movement) on an existing guide', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 80 }));
    const guidesBefore = selectActivePage(store.getState()).guides;
    const [guide] = guidesBefore.filter((candidate) => candidate.position === 80);
    const canvas = createCanvas();
    const draggingGuideRef = {
      current: { axis: 'x', frameId: null, hasMoved: false, id: guide.id, position: 80 } as TGuideDragState | null,
    };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before
    handlePointerUp(canvas, pointerEvent(80, 200), store.dispatch, refs);

    // result
    expect(selectActivePage(store.getState()).guides).toEqual(guidesBefore);
    expect(draggingGuideRef.current).toBeNull();
  });

  it('should attach a new guide to the frame under the drop point, stored frame-relative', () => {
    // mock
    const frameId = store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#fff',
        height: 400,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 100,
        y: 100,
      }),
    ).payload.id;
    const pageGuidesBefore = selectActivePage(store.getState()).guides;
    const canvas = createCanvas();
    const draggingGuideRef = { current: { axis: 'x', frameId: null, hasMoved: true, id: null, position: 200 } as TGuideDragState | null };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before — drop at world (200, 200), inside the frame whose origin is (100, 100)
    handlePointerUp(canvas, pointerEvent(200, 200), store.dispatch, refs);

    // result
    const frame = selectActivePage(store.getState()).nodes[frameId] as TFrameNode;

    expect(frame.guides).toContainEqual({ axis: 'x', id: expect.any(String), position: 100 });
    expect(selectActivePage(store.getState()).guides).toEqual(pageGuidesBefore);
  });

  it('should store a y-axis frame guide relative to the frame’s top edge', () => {
    // mock
    const frameId = store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#fff',
        height: 400,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 100,
        y: 100,
      }),
    ).payload.id;
    const canvas = createCanvas();
    const draggingGuideRef = { current: { axis: 'y', frameId: null, hasMoved: true, id: null, position: 250 } as TGuideDragState | null };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before — drop at world (200, 250), inside the frame whose origin is (100, 100)
    handlePointerUp(canvas, pointerEvent(200, 250), store.dispatch, refs);

    // result
    expect((selectActivePage(store.getState()).nodes[frameId] as TFrameNode).guides).toContainEqual({
      axis: 'y',
      id: expect.any(String),
      position: 150,
    });
  });

  it('should commit the moved position of a frame guide frame-relative', () => {
    // mock
    const frameId = store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#fff',
        height: 400,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 100,
        y: 100,
      }),
    ).payload.id;
    store.dispatch(addGuide({ axis: 'x', frameId, position: 50 }));
    const guideId = (selectActivePage(store.getState()).nodes[frameId] as TFrameNode).guides![0].id;
    const canvas = createCanvas();
    const draggingGuideRef = {
      current: { axis: 'x', frameId, hasMoved: true, id: guideId, position: 300 } as TGuideDragState | null,
    };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before — released at world x 300; frame origin x is 100
    handlePointerUp(canvas, pointerEvent(300, 200), store.dispatch, refs);

    // result
    expect((selectActivePage(store.getState()).nodes[frameId] as TFrameNode).guides![0].position).toBe(200);
  });

  it('should bracket the commit in a single undo step', () => {
    // mock
    const guidesBefore = selectActivePage(store.getState()).guides;
    const canvas = createCanvas();
    const draggingGuideRef = { current: { axis: 'x', frameId: null, hasMoved: true, id: null, position: 70 } as TGuideDragState | null };
    const refs = createCanvasRefs({ guides: { draggingGuideRef } });

    // before
    handlePointerUp(canvas, pointerEvent(200, 200), store.dispatch, refs);
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).guides).toEqual(guidesBefore);
  });
});
