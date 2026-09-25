import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useEllipseArc } from '../useEllipseArc';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useEllipseArc', () => {
  it('should give the start, sweep and ratio fields of the selected ellipses', () => {
    // mock
    store.dispatch(
      addNode({
        arcRatio: 0.5,
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

    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // before
    const { result } = renderHook(() => useEllipseArc(), { wrapper });

    // result
    expect(result.current.map(({ displayValue, key }) => [key, displayValue])).toEqual([
      ['start', '0°'],
      ['sweep', '100%'],
      ['ratio', '50%'],
    ]);
  });
});
