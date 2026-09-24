import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useCornerRadius } from '../useCornerRadius';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseCornerRadius = (): ReturnType<typeof renderHook<ReturnType<typeof useCornerRadius>, unknown>> =>
  renderHook(() => useCornerRadius(), { wrapper });

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const fieldFor = (
  fields: ReturnType<typeof useCornerRadius>['individualFields'],
  e2eValue: string,
): ReturnType<typeof useCornerRadius>['individualFields'][number] => fields.find((field) => field.e2eValue === e2eValue)!;

describe('useCornerRadius', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should report the shared value as not mixed when every corner matches', () => {
    const id = addRectangle({ cornerRadius: 6 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    expect(result.current.isMixed).toBe(false);
    expect(result.current.mergedValue).toBe(6);
  });

  it('should report mixed when the individual corners differ', () => {
    const id = addRectangle({ cornerRadius: 0, cornerRadiusTopLeft: 1, cornerRadiusTopRight: 3 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    expect(result.current.isMixed).toBe(true);
  });

  it('should apply a merged commit to all four corners and the base radius', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    act(() => result.current.onMergedCommit('8px'));

    expect(read(id)).toMatchObject({
      cornerRadius: 8,
      cornerRadiusBottomLeft: 8,
      cornerRadiusBottomRight: 8,
      cornerRadiusTopLeft: 8,
      cornerRadiusTopRight: 8,
    });
  });

  it('should ignore a non-numeric merged commit', () => {
    const id = addRectangle({ cornerRadius: 4 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    act(() => result.current.onMergedCommit('abc'));

    expect(read(id).cornerRadius).toBe(4);
  });

  it('should apply a merged scrub to all four corners', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    act(() => result.current.onMergedScrub(10));

    expect(read(id)).toMatchObject({
      cornerRadius: 10,
      cornerRadiusBottomLeft: 10,
      cornerRadiusBottomRight: 10,
      cornerRadiusTopLeft: 10,
      cornerRadiusTopRight: 10,
    });
  });

  it('should expose the four individual fields with their own commit handlers', () => {
    const id = addRectangle({ cornerRadiusBottomLeft: 2, cornerRadiusBottomRight: 4, cornerRadiusTopLeft: 1, cornerRadiusTopRight: 3 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    expect(fieldFor(result.current.individualFields, 'corner-radius-top-left').value).toBe(1);
    expect(fieldFor(result.current.individualFields, 'corner-radius-top-right').value).toBe(3);
    expect(fieldFor(result.current.individualFields, 'corner-radius-bottom-left').value).toBe(2);
    expect(fieldFor(result.current.individualFields, 'corner-radius-bottom-right').value).toBe(4);

    act(() => fieldFor(result.current.individualFields, 'corner-radius-top-left').onCommit('9'));

    expect(read(id).cornerRadiusTopLeft).toBe(9);
    expect(read(id).cornerRadiusTopRight).toBe(3);
  });

  it('should toggle the individual flag', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerRadius();

    expect(result.current.isIndividual).toBe(false);
    act(() => result.current.toggleIndividual());
    expect(result.current.isIndividual).toBe(true);
  });

  it('should show Mixed and stay merged when every node has even corners but the values differ', () => {
    // mock
    const firstId = addRectangle({ cornerRadius: 4 });
    const secondId = addRectangle({ cornerRadius: 8 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseCornerRadius();

    // result
    expect(result.current).toMatchObject({ isIndividual: false, isMixed: true });
  });

  it('should open the individual fields when a node has uneven corners, showing Mixed only where the corners differ', () => {
    // mock
    const firstId = addRectangle({ cornerRadius: 5 });
    const secondId = addRectangle({
      cornerRadiusBottomLeft: 3,
      cornerRadiusBottomRight: 4,
      cornerRadiusTopLeft: 5,
      cornerRadiusTopRight: 2,
    });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseCornerRadius();

    // result
    expect(result.current.isIndividual).toBe(true);
    expect(result.current.individualFields.map((field) => field.value)).toEqual([5, 'Mixed', 'Mixed', 'Mixed']);
  });

  it('should commit a merged value to every corner of every node', () => {
    // mock
    const firstId = addRectangle({ cornerRadius: 4 });
    const secondId = addRectangle({ cornerRadiusTopLeft: 1 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseCornerRadius();

    // action
    act(() => result.current.onMergedCommit('10'));

    // result
    [firstId, secondId].forEach((id) =>
      expect(read(id)).toMatchObject({
        cornerRadius: 10,
        cornerRadiusBottomLeft: 10,
        cornerRadiusBottomRight: 10,
        cornerRadiusTopLeft: 10,
        cornerRadiusTopRight: 10,
      }),
    );
  });

  it('should scrub the merged field by the same delta on every corner of every node', () => {
    // mock
    const firstId = addRectangle({ cornerRadius: 4 });
    const secondId = addRectangle({ cornerRadius: 10, cornerRadiusTopLeft: 2 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseCornerRadius();

    // action
    act(() => result.current.onMergedScrub(7));

    // result
    expect(read(firstId)).toMatchObject({ cornerRadius: 7, cornerRadiusTopLeft: 7, cornerRadiusTopRight: 7 });
    expect(read(secondId)).toMatchObject({ cornerRadius: 13, cornerRadiusTopLeft: 5, cornerRadiusTopRight: 13 });
  });

  it('should commit an individual corner to every node', () => {
    // mock
    const firstId = addRectangle({ cornerRadius: 4 });
    const secondId = addRectangle({ cornerRadius: 8 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseCornerRadius();

    // action
    act(() => fieldFor(result.current.individualFields, 'corner-radius-top-left').onCommit('6'));

    // result
    expect([read(firstId).cornerRadiusTopLeft, read(secondId).cornerRadiusTopLeft]).toEqual([6, 6]);
  });
});
