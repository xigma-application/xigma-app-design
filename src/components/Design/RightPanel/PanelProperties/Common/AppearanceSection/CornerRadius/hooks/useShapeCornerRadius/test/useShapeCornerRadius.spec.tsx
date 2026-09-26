import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useShapeCornerRadius } from '../useShapeCornerRadius';

// store
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TVectorNode } from 'types/design/types';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addEllipse = (cornerRadius?: number, arcEndAngle?: number): string => {
  store.dispatch(
    addNode({
      arcEndAngle,
      cornerRadius,
      fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TEllipseNode => selectActivePage(store.getState()).nodes[id] as TEllipseNode;

describe('useShapeCornerRadius', () => {
  it('should show the shared corner radius and commit a typed one', () => {
    // mock
    const id = addEllipse(6);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.ellipse), { wrapper });

    // action
    act(() => result.current.onCommit('12'));

    // result
    expect(result.current.value).toBe(12);
    expect(read(id).cornerRadius).toBe(12);
  });

  it('should ignore invalid input', () => {
    // mock
    const id = addEllipse(6);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.ellipse), { wrapper });

    // action
    act(() => result.current.onCommit('abc'));

    // result
    expect(read(id).cornerRadius).toBe(6);
  });

  it('should show Mixed for different radii and scrub each by the same amount', () => {
    // mock
    const first = addEllipse();
    const second = addEllipse(10);

    store.dispatch(setSelection([first, second]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.ellipse), { wrapper });

    // action
    act(() => result.current.onScrub(5));

    // result
    expect(read(first).cornerRadius).toBe(5);
    expect(read(second).cornerRadius).toBe(15);
    expect(result.current.valueLabel).toBe('Mixed');
  });

  it('should read 0 with no ellipse selected', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.ellipse), { wrapper });

    // result
    expect(result.current.valueLabel).toBe(0);
  });

  it('should be disabled when no selected ellipse is cut', () => {
    // mock
    const id = addEllipse(6);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.ellipse), { wrapper });

    // result
    expect(result.current.isDisabled).toBe(true);
  });

  it('should be enabled when a selected ellipse is cut', () => {
    // mock
    const full = addEllipse(6);
    const cut = addEllipse(6, 0);

    store.dispatch(setSelection([full, cut]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.ellipse), { wrapper });

    // result
    expect(result.current.isDisabled).toBe(false);
  });

  it('should read and set the corner radius of the selected polygons, always enabled', () => {
    // mock
    store.dispatch(
      addNode({
        cornerRadius: 4,
        fills: [],
        flipX: false,
        flipY: false,
        height: 10,
        name: 'Polygon',
        parentId: null,
        rotation: 0,
        sides: 3,
        type: NodeType.polygon,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.polygon), { wrapper });

    // action
    act(() => result.current.onCommit('9'));

    // result
    expect(result.current.isDisabled).toBe(false);
    expect(selectActivePage(store.getState()).nodes[id]).toMatchObject({ cornerRadius: 9 });
  });

  it('should set one corner radius on every selected vector and show Mixed while they differ', () => {
    // mock
    const first = makeSquareVector({ cornerRadius: 4, id: 'cornerVectorA' });
    const second = makeSquareVector({ id: 'cornerVectorB' });

    store.dispatch(addNodes({ nodes: [first, second], rootIds: [first.id, second.id] }));
    store.dispatch(setSelection([first.id, second.id]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.vector), { wrapper });

    // result
    expect(result.current).toMatchObject({ isDisabled: false, valueLabel: 'Mixed' });

    // action
    act(() => result.current.onCommit('12'));

    // result
    expect([first.id, second.id].map((id) => (selectActivePage(store.getState()).nodes[id] as TVectorNode).cornerRadius)).toEqual([12, 12]);
  });

  it('should show Mixed for one vector whose points have different radii and drop them when a radius is set', () => {
    // mock
    const vector = makeSquareVector({ cornerRadius: 4, id: 'cornerVectorPoints' });
    const [vertexId] = Object.keys(vector.vertices);

    store.dispatch(addNodes({ nodes: [{ ...vector, cornerRadiusByVertexId: { [vertexId]: 9 } }], rootIds: [vector.id] }));
    store.dispatch(setSelection([vector.id]));

    // before
    const { result } = renderHook(() => useShapeCornerRadius(NodeType.vector), { wrapper });

    // result
    expect(result.current.valueLabel).toBe('Mixed');

    // action
    act(() => result.current.onCommit('6'));

    // result
    expect(selectActivePage(store.getState()).nodes[vector.id]).toMatchObject({ cornerRadius: 6, cornerRadiusByVertexId: undefined });
    expect(result.current.valueLabel).toBe(6);
  });
});
