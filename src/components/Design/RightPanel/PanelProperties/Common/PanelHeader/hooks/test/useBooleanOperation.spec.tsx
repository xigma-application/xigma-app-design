import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useBooleanOperation } from '../useBooleanOperation';

// store
import { addNodes, booleanNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TRectangleNode } from 'types/design/types';

const flattenMock = vi.fn();

vi.mock('components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleFlattenSelection', () => ({
  handleFlattenSelection: (...args: unknown[]): unknown => flattenMock(...args),
}));

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const rectangle: TRectangleNode = {
  fills: [],
  height: 10,
  id: 'boolRect',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const booleanNode = {
  booleanOperation: BooleanOperation.subtract,
  childIds: [],
  fills: [],
  height: 10,
  id: 'boolNode',
  name: 'b',
  parentId: null,
  rotation: 0,
  type: NodeType.boolean,
  width: 10,
  x: 0,
  y: 0,
} as unknown as TBooleanNode;

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [rectangle, booleanNode], rootIds: ['boolRect', 'boolNode'] }));
});

describe('useBooleanOperation', () => {
  it('should show the operation of a single selected boolean', () => {
    // mock
    store.dispatch(setSelection(['boolNode']));

    // before
    const { result } = renderHook(() => useBooleanOperation(), { wrapper });

    // result
    expect(result.current.operation).toBe(BooleanOperation.subtract);
  });

  it('should default to union for another selection', () => {
    // mock
    store.dispatch(setSelection(['boolRect']));

    // before
    const { result } = renderHook(() => useBooleanOperation(), { wrapper });

    // result
    expect(result.current.operation).toBe(BooleanOperation.union);
  });

  it('should apply a boolean operation and flatten the selection', () => {
    // spy
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    // before
    const { result } = renderHook(() => useBooleanOperation(), { wrapper });

    // action
    result.current.onApply(BooleanOperation.intersect)();
    result.current.onFlatten();

    // result
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ payload: expect.objectContaining({ operation: BooleanOperation.intersect }), type: booleanNodes.type }),
    );
    expect(flattenMock).toHaveBeenCalledWith(store.dispatch);
  });
});
