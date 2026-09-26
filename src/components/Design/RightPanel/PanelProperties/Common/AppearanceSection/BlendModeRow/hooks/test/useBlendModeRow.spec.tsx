import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useBlendModeRow } from '../useBlendModeRow';

// store
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

const addAndSelect = (blendMode?: BlendMode): string => {
  store.dispatch(
    addNode({
      blendMode,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

describe('useBlendModeRow', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should be inactive on Pass through and active on any other mode', () => {
    // before
    addAndSelect();
    const inactive = renderHook(() => useBlendModeRow(), { wrapper });

    // result
    expect(inactive.result.current.isActive).toBe(false);

    // before
    inactive.unmount();
    addAndSelect(BlendMode.multiply);
    const active = renderHook(() => useBlendModeRow(), { wrapper });

    // result
    expect(active.result.current.isActive).toBe(true);
    expect(active.result.current.value).toBe(BlendMode.multiply);
  });

  it('should commit a chosen mode and reset it on remove', () => {
    // before
    const id = addAndSelect(BlendMode.darken);
    const { result } = renderHook(() => useBlendModeRow(), { wrapper });

    // action
    act(() => result.current.onSelect(BlendMode.overlay));

    // result
    expect((selectActivePage(store.getState()).nodes[id] as { blendMode?: BlendMode }).blendMode).toBe(BlendMode.overlay);

    // action
    act(() => result.current.onRemove());

    // result
    expect((selectActivePage(store.getState()).nodes[id] as { blendMode?: BlendMode }).blendMode).toBe(BlendMode.passThrough);
  });

  it('should be active with no value for differing modes and apply a chosen mode or remove it on every node', () => {
    // mock
    const firstId = addAndSelect(BlendMode.multiply);
    const secondId = addAndSelect();

    store.dispatch(setSelection([firstId, secondId]));

    const readBlendMode = (id: string): BlendMode | undefined =>
      (selectActivePage(store.getState()).nodes[id] as { blendMode?: BlendMode }).blendMode;

    // before
    const { result } = renderHook(() => useBlendModeRow(), { wrapper });

    // result
    expect(result.current).toMatchObject({ isActive: true, value: undefined });

    // action
    act(() => result.current.onSelect(BlendMode.screen));

    // result
    expect([readBlendMode(firstId), readBlendMode(secondId)]).toEqual([BlendMode.screen, BlendMode.screen]);

    // action
    act(() => result.current.onRemove());

    // result
    expect([readBlendMode(firstId), readBlendMode(secondId)]).toEqual([BlendMode.passThrough, BlendMode.passThrough]);
  });

  it('should commit a chosen mode on a selected vector', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'blend-vector' })], rootIds: ['blend-vector'] }));
    store.dispatch(setSelection(['blend-vector']));

    // before
    const { result } = renderHook(() => useBlendModeRow(), { wrapper });

    // action
    act(() => result.current.onSelect(BlendMode.multiply));

    // result
    expect((selectActivePage(store.getState()).nodes['blend-vector'] as TVectorNode).blendMode).toBe(BlendMode.multiply);
  });
});
