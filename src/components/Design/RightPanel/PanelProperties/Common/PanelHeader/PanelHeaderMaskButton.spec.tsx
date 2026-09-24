import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderMaskButton from './PanelHeaderMaskButton';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderMaskButton />
      </TooltipProvider>
    </Provider>,
  );

describe('PanelHeaderMaskButton snapshots', () => {
  it('should render the use as mask button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderMaskButton behaviors', () => {
  it('should expose the use as mask label', () => {
    // before
    renderButton();

    // result
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
  });

  it('should use the selection as a mask when clicked, like the Use as mask shortcut', () => {
    // mock
    const makeRectangle = (id: string): TRectangleNode => ({
      fills: [],
      height: 10,
      id,
      name: id,
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    });

    store.dispatch(addNodes({ nodes: [makeRectangle('maskA'), makeRectangle('maskB')], rootIds: ['maskA', 'maskB'] }));
    store.dispatch(setSelection(['maskA', 'maskB']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Use as mask'));

    // result
    const { nodes } = selectActivePage(store.getState());

    expect(nodes[nodes.maskA.parentId as string]?.type).toBe(NodeType.mask);
  });
});
