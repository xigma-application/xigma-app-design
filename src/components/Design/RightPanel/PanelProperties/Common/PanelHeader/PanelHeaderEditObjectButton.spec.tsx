import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderEditObjectButton from './PanelHeaderEditObjectButton';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <PanelHeaderEditObjectButton />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('PanelHeaderEditObjectButton snapshots', () => {
  it('should render the edit object button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderEditObjectButton behaviors', () => {
  it('should expose the edit object label', () => {
    // before
    renderButton();

    // result
    expect(screen.getByLabelText('Edit object')).toBeInTheDocument();
  });

  it('should turn the selected rectangle into a vector and start editing its points when clicked', async () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [],
            height: 40,
            id: 'editRect',
            name: 'editRect',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 40,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['editRect'],
      }),
    );
    store.dispatch(setSelection(['editRect']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Edit object'));

    // result
    await waitFor(() => expect(selectVectorEditingNodeIds(store.getState())).toEqual(['editRect']));
    expect(selectNodes(store.getState()).editRect.type).toBe(NodeType.vector);
  });
});
