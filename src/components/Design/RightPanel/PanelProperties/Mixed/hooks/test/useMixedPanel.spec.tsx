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
import { TBooleanNode, TFrameNode, TGroupNode, TRectangleNode, TStarNode } from 'types/design/types';

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

const groupedRectangle: TRectangleNode = {
  ...baseNode,
  fills: [],
  id: 'groupedRectangle',
  name: 'Rectangle',
  parentId: 'rectangleGroup',
  type: NodeType.rectangle,
};
const groupedEllipse: TStarNode = {
  ...baseNode,
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  id: 'groupedEllipse',
  name: 'Star',
  parentId: 'ellipseGroup',
  points: 5,
  ratio: 0.5,
  type: NodeType.star,
};
const rectangleGroup: TGroupNode = {
  ...baseNode,
  childIds: [groupedRectangle.id],
  id: 'rectangleGroup',
  name: 'Group',
  type: NodeType.group,
};
const ellipseGroup: TGroupNode = { ...baseNode, childIds: [groupedEllipse.id], id: 'ellipseGroup', name: 'Group', type: NodeType.group };

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [frame, rectangle, booleanNode, rectangleGroup, groupedRectangle, ellipseGroup, groupedEllipse],
      rootIds: [frame.id, rectangle.id, booleanNode.id, rectangleGroup.id, ellipseGroup.id],
    }),
  );
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

  it('should take the fill and corner radius of a group from its children when a group and a frame are selected', () => {
    // mock
    store.dispatch(setSelection([rectangleGroup.id, frame.id]));

    // before
    const { result } = renderHook(() => useMixedPanel(), { wrapper });

    // result
    expect(result.current.sections).toEqual(expect.arrayContaining(['position', 'layout', 'fill', 'cornerRadius', 'selectionColors']));
    expect(result.current.sections).not.toContain('layoutGuide');
  });

  it('should drop the child sections when a selected group holds a layer without them', () => {
    // mock
    store.dispatch(setSelection([rectangleGroup.id, ellipseGroup.id]));

    // before
    const { result } = renderHook(() => useMixedPanel(), { wrapper });

    // result
    expect(result.current.sections).toEqual(['position', 'rotation', 'layout', 'selectionColors', 'export']);
  });
});
