import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnSpacing from './ColumnSpacing';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x,
  y: 0,
});

const renderColumnSpacing = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnSpacing />
      </TooltipProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [makeRectangle('colA', 0), makeRectangle('colB', 30), makeRectangle('colC', 90)],
      rootIds: ['colA', 'colB', 'colC'],
    }),
  );
});

describe('ColumnSpacing snapshots', () => {
  it('should render the spacing fields for several layers', () => {
    // mock
    store.dispatch(setSelection(['colA', 'colB']));

    // before
    const { asFragment } = renderColumnSpacing();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnSpacing behaviors', () => {
  it('should render nothing for a single layer', () => {
    // mock
    store.dispatch(setSelection(['colA']));

    // before
    const { container } = renderColumnSpacing();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should show Mixed for uneven gaps and even them out when a value is typed', () => {
    // mock
    store.dispatch(setSelection(['colA', 'colB', 'colC']));

    // before
    renderColumnSpacing();
    const input = screen.getByLabelText('Horizontal spacing') as HTMLInputElement;

    // result
    expect(input.value).toBe('Mixed');

    // action
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.blur(input);

    // result
    const nodes = selectNodes(store.getState()) as Record<string, TRectangleNode>;

    expect([nodes.colA.x, nodes.colB.x, nodes.colC.x]).toEqual([0, 25, 50]);
  });
});
