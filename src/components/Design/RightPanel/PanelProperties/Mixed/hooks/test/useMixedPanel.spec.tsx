import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useMixedPanel } from '../useMixedPanel';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const baseNode = { height: 20, parentId: null, rotation: 0, width: 20, x: 0, y: 0 };
const frame: TFrameNode = {
  ...baseNode,
  childIds: [],
  clipContent: true,
  fills: [],
  id: 'mixedFrame',
  name: 'Frame',
  type: NodeType.frame,
};
const rectangle: TRectangleNode = { ...baseNode, fills: [], id: 'mixedRectangle', name: 'Rectangle', type: NodeType.rectangle };
const booleanNode: TBooleanNode = {
  ...baseNode,
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [],
  id: 'mixedBoolean',
  name: 'Union',
  type: NodeType.boolean,
};

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [frame, rectangle, booleanNode], rootIds: [frame.id, rectangle.id, booleanNode.id] }));
});

describe('useMixedPanel', () => {
  it('should return the sections a frame and a rectangle share', () => {
    // mock
    store.dispatch(setSelection([frame.id, rectangle.id]));

    // before
    const { result } = renderHook(() => useMixedPanel(), { wrapper });

    // result
    expect(result.current.sections).toContain('cornerRadius');
    expect(result.current.sections).not.toContain('selectionColors');
    expect(result.current.count).toBe(2);
  });

  it('should drop the corner radius for a rectangle and a boolean', () => {
    // mock
    store.dispatch(setSelection([rectangle.id, booleanNode.id]));

    // before
    const { result } = renderHook(() => useMixedPanel(), { wrapper });

    // result
    expect(result.current.sections).not.toContain('cornerRadius');
  });
});
