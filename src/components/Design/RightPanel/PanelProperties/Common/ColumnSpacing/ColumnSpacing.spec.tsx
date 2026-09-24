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
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

const makeRectangle = (id: string, x: number, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x,
  y: 0,
});

const makeFrame = (): TFrameNode =>
  ({
    childIds: ['childA', 'childB'],
    clipContent: false,
    fills: [],
    height: 100,
    id: 'freeFrame',
    layoutMode: LayoutMode.freeForm,
    name: 'freeFrame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 300,
    y: 0,
  }) as TFrameNode;

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
      nodes: [
        makeRectangle('colA', 0),
        makeRectangle('colB', 30),
        makeRectangle('colC', 90),
        makeFrame(),
        makeRectangle('childA', 310, 'freeFrame'),
        makeRectangle('childB', 340, 'freeFrame'),
      ],
      rootIds: ['colA', 'colB', 'colC', 'freeFrame'],
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

  it('should show the gap between the children of a selected free-form frame on the axis they are apart', () => {
    // mock
    store.dispatch(setSelection(['freeFrame']));

    // before
    renderColumnSpacing();

    // result
    expect((screen.getByLabelText('Horizontal spacing') as HTMLInputElement).value).toBe('10');
    expect(screen.queryByLabelText('Vertical spacing')).not.toBeInTheDocument();
  });
});
