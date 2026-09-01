import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useFlipSelection } from '../useFlipSelection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addEllipseNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.slice(-1)[0];
};

describe('useFlipSelection', () => {
  it('should toggle flipX on the selected node when onFlipHorizontal is called', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useFlipSelection(), { wrapper });

    // action
    result.current.onFlipHorizontal();

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TEllipseNode).flipX).toBe(true);
  });

  it('should toggle flipY on the selected node when onFlipVertical is called', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useFlipSelection(), { wrapper });

    // action
    result.current.onFlipVertical();

    // result
    expect((selectActivePage(store.getState()).nodes[id] as TEllipseNode).flipY).toBe(true);
  });
});
