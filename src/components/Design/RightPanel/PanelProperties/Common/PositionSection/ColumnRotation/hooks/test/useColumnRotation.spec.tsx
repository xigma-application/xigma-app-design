import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnRotation } from '../useColumnRotation';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnRotation = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnRotation>, unknown>> =>
  renderHook(() => useColumnRotation(), { wrapper });

const addFrameNode = (rotation: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readRotation = (id: string): number => (selectActivePage(store.getState()).nodes[id] as { rotation: number }).rotation;

const addImageFrameNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [paint],
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readCrop = (id: string): TImagePaint['crop'] =>
  (selectActivePage(store.getState()).nodes[id] as { fills: TImagePaint[] }).fills[0].crop;

describe('useColumnRotation', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should do nothing on scrub or blur when nothing is selected', () => {
    // before — no selection at all
    const { result } = renderUseColumnRotation();
    const input = Object.assign(document.createElement('input'), { value: '90°' });

    // action / result — no throw, and there's no frame to have moved
    expect(() => {
      act(() => result.current.onScrub(45));
      act(() => result.current.onBlur({ target: input } as unknown as Parameters<typeof result.current.onBlur>[0]));
    }).not.toThrow();
    expect(result.current.rotation).toBe(0);
  });

  it('should expose the selected frame rotation', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // result
    expect(result.current.rotation).toBe(20);
  });

  it('should expose three rotation/flip buttons', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // result
    expect(result.current.buttons).toHaveLength(3);
  });

  it('should commit a new rotation on scrub', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // action
    act(() => result.current.onScrub(45));

    // result
    expect(readRotation(frameId)).toBe(45);
  });

  it('should commit a new rotation on blur', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();
    const input = Object.assign(document.createElement('input'), { value: '90°' });

    // action
    act(() => result.current.onBlur({ target: input } as unknown as Parameters<typeof result.current.onBlur>[0]));

    // result
    expect(readRotation(frameId)).toBe(90);
  });

  it('should coalesce every scrub between onDragStart and onDragEnd into a single undo step', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrub(10);
      result.current.onScrub(20);
      result.current.onScrub(30);
      result.current.onDragEnd();
    });

    expect(readRotation(frameId)).toBe(30);

    // action
    store.dispatch(undo());

    // result
    expect(readRotation(frameId)).toBe(0);
  });

  it('should expose the image crop’s own rotation instead of the frame’s, when the image is the selected crop target', () => {
    // mock — the frame itself never rotated, but its image crop was rotated independently
    const paint: TImagePaint = {
      crop: { height: 10, rotation: 35, width: 10, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const frameId = addImageFrameNode(paint);

    store.dispatch(setSelection([frameId]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'image' }));

    // before
    const { result } = renderUseColumnRotation();

    // result
    expect(result.current.rotation).toBe(35);
  });

  it('should commit a scrubbed rotation to the crop, leaving the frame’s own rotation untouched', () => {
    // mock
    const paint: TImagePaint = {
      crop: { height: 10, rotation: 0, width: 10, x: 5, y: 5 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const frameId = addImageFrameNode(paint);

    store.dispatch(setSelection([frameId]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'image' }));

    // before
    const { result } = renderUseColumnRotation();

    // action — the crop is centred on (10,10), so rotating around its own centre keeps its top-left fixed
    act(() => result.current.onScrub(90));

    // result
    expect(readCrop(frameId)).toEqual({ height: 10, rotation: 90, width: 10, x: 5, y: 5 });
    expect(readRotation(frameId)).toBe(0);
  });
});
