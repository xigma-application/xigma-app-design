import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useConvertGroup } from '../useConvertGroup';

// store
import { addNodes, groupNodes, moveNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { BooleanOperation, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 10,
});

const addGroup = (prefix: string): string => {
  const ids = [`${prefix}-a`, `${prefix}-b`];

  store.dispatch(addNodes({ nodes: [makeRectangle(ids[0], 0), makeRectangle(ids[1], 60)], rootIds: ids }));
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return selectSelectedIds(store.getState())[0];
};

const selectNewGroup = (prefix: string): string => {
  const groupId = addGroup(prefix);

  store.dispatch(setSelection([groupId]));

  return groupId;
};

describe('useConvertGroup', () => {
  it('should turn the group into a frame with the same children, box and no fill', () => {
    // mock
    const groupId = selectNewGroup('frame');
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToFrame());

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({
      childIds: ['frame-a', 'frame-b'],
      fills: [],
      height: 40,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 10,
    });
  });

  it('should turn the group into a section with the same children', () => {
    // mock
    const groupId = selectNewGroup('section');
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToSection());

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({ childIds: ['section-a', 'section-b'], type: NodeType.section });
  });

  it('should turn the group into a frame of the preset size', () => {
    // mock
    const groupId = selectNewGroup('preset');
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToPreset(402, 874)());

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({ height: 874, type: NodeType.frame, width: 402 });
  });

  it('should turn the group into a frame with the picked auto layout', () => {
    // mock
    const groupId = selectNewGroup('flow');
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToFlow(LayoutMode.horizontal));

    // result
    const frame = selectNodes(store.getState())[groupId] as TFrameNode;
    expect(frame.type).toBe(NodeType.frame);
    expect(frame.layoutMode).toBe(LayoutMode.horizontal);
  });

  it('should keep the group when free-form is picked', () => {
    // mock
    const groupId = selectNewGroup('free');
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToFlow(LayoutMode.freeForm));

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.group);
  });

  it('should turn the group into a boolean with the picked operation', () => {
    // mock
    const groupId = selectNewGroup('boolean');
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToBoolean(BooleanOperation.intersect)());

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({
      booleanOperation: BooleanOperation.intersect,
      childIds: ['boolean-a', 'boolean-b'],
      type: NodeType.boolean,
    });
  });

  it('should turn each of several selected groups into its own boolean and keep them selected', () => {
    // mock
    const groupIds = [addGroup('first'), addGroup('second')];
    store.dispatch(setSelection(groupIds));
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToBoolean(BooleanOperation.union)());

    // result
    const nodes = selectNodes(store.getState());
    expect(groupIds.map((id) => [nodes[id].type, (nodes[id] as TFrameNode).childIds])).toEqual([
      [NodeType.boolean, ['first-a', 'first-b']],
      [NodeType.boolean, ['second-a', 'second-b']],
    ]);
    expect(selectSelectedIds(store.getState())).toEqual(groupIds);
  });

  it('should turn each of several selected groups into its own mask and select their mask shapes', () => {
    // mock
    const groupIds = [addGroup('maskFirst'), addGroup('maskSecond')];
    store.dispatch(setSelection(groupIds));
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToMask());

    // result
    const nodes = selectNodes(store.getState());
    expect(groupIds.map((id) => nodes[id].type)).toEqual([NodeType.mask, NodeType.mask]);
    expect(selectSelectedIds(store.getState())).toEqual(['maskFirst-b', 'maskSecond-b']);
  });

  it('should turn each of several selected groups into its own frame', () => {
    // mock
    const groupIds = [addGroup('frameFirst'), addGroup('frameSecond')];
    store.dispatch(setSelection(groupIds));
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToFrame());

    // result
    const nodes = selectNodes(store.getState());
    expect(groupIds.map((id) => nodes[id].type)).toEqual([NodeType.frame, NodeType.frame]);
  });

  it('should keep a group inside a frame as a group when Section is picked', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: [],
            clipContent: true,
            fills: [],
            height: 400,
            id: 'hostFrame',
            name: 'Frame',
            parentId: null,
            rotation: 0,
            type: NodeType.frame,
            width: 400,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['hostFrame'],
      }),
    );
    const groupId = addGroup('nested');
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: 'hostFrame' }));
    store.dispatch(setSelection([groupId]));
    const { result } = renderHook(() => useConvertGroup(), { wrapper });

    // action
    act(() => result.current.onConvertToSection());

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.group);
  });
});
