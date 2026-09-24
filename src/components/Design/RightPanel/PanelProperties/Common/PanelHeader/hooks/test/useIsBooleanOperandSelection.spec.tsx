import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useIsBooleanOperandSelection } from '../useIsBooleanOperandSelection';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const base = { height: 10, parentId: null, rotation: 0, width: 10, x: 0, y: 0 };
const rectangle: TRectangleNode = { ...base, fills: [], id: 'operandRect', name: 'Rectangle', type: NodeType.rectangle };
const union: TBooleanNode = {
  ...base,
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [],
  id: 'operandUnion',
  name: 'Union',
  type: NodeType.boolean,
};
const frame: TFrameNode = { ...base, childIds: [], clipContent: true, fills: [], id: 'operandFrame', name: 'Frame', type: NodeType.frame };

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [rectangle, union, frame], rootIds: ['operandRect', 'operandUnion', 'operandFrame'] }));
});

describe('useIsBooleanOperandSelection', () => {
  it('should accept a rectangle with a union', () => {
    // mock
    store.dispatch(setSelection(['operandRect', 'operandUnion']));

    // action
    const { result } = renderHook(() => useIsBooleanOperandSelection(), { wrapper });

    // result
    expect(result.current).toBe(true);
  });

  it('should reject a selection with a frame', () => {
    // mock
    store.dispatch(setSelection(['operandRect', 'operandFrame']));

    // action
    const { result } = renderHook(() => useIsBooleanOperandSelection(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });
});
