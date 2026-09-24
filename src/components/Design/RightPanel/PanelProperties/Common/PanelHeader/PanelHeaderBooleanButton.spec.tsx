import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderBooleanButton from './PanelHeaderBooleanButton';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

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
  y: 0,
});

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderBooleanButton />
      </TooltipProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [makeRectangle('booleanA', 0), makeRectangle('booleanB', 20)], rootIds: ['booleanA', 'booleanB'] }));
});

describe('PanelHeaderBooleanButton snapshots', () => {
  it('should render the boolean operations split button', () => {
    // mock
    store.dispatch(setSelection(['booleanA']));

    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderBooleanButton behaviors', () => {
  it('should list every boolean operation with its shortcut when the menu opens', () => {
    // mock
    store.dispatch(setSelection(['booleanA']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Boolean operations options'));

    // result
    expect(screen.getByText('Union')).toBeInTheDocument();
    expect(screen.getByText('Subtract')).toBeInTheDocument();
    expect(screen.getByText('Intersect')).toBeInTheDocument();
    expect(screen.getByText('Exclude')).toBeInTheDocument();
    expect(screen.getByText('Flatten')).toBeInTheDocument();
  });

  it('should wrap the selection in a Union when the button is clicked', () => {
    // mock
    store.dispatch(setSelection(['booleanA', 'booleanB']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Boolean operations'));

    // result
    const [booleanNode] = selectSelectedNodes(store.getState());

    expect(booleanNode).toMatchObject({
      booleanOperation: BooleanOperation.union,
      childIds: ['booleanA', 'booleanB'],
      name: 'Union',
      type: NodeType.boolean,
    });
  });

  it('should switch the operation of the selected boolean when a menu item is picked', () => {
    // mock
    const [booleanNode] = selectSelectedNodes(store.getState());

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Boolean operations options'));
    fireEvent.click(screen.getByText('Subtract'));

    // result
    expect(selectNodes(store.getState())[booleanNode.id]).toMatchObject({ booleanOperation: BooleanOperation.subtract, name: 'Subtract' });
  });
});
