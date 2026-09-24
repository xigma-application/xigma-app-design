import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderComponentSplitButton from './PanelHeaderComponentSplitButton';
import { TooltipProvider } from 'shared';

// others
import { COMPONENT_NON_MATCHING_HINT_LABEL_KEY } from './constants';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderComponentSplitButton />
      </TooltipProvider>
    </Provider>,
  );

describe('PanelHeaderComponentSplitButton snapshots', () => {
  it('should render the component split button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderComponentSplitButton behaviors', () => {
  it('should list the component actions when the options open', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Component options'));

    // result
    expect(screen.getByText('Create component')).toBeInTheDocument();
    expect(screen.getByText('Create multiple components')).toBeInTheDocument();
    expect(screen.getByText('Create component set')).toBeInTheDocument();
  });

  it('should show the non-matching hint when layers from different parents are turned into a component', () => {
    // mock
    const makeRectangle = (id: string, parentId: string | null): TRectangleNode => ({
      fills: [],
      height: 10,
      id,
      name: id,
      parentId,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    });

    store.dispatch(addNodes({ nodes: [makeRectangle('splitA', null), makeRectangle('splitB', 'splitA')], rootIds: ['splitA'] }));
    store.dispatch(setSelection(['splitA', 'splitB']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Create component'));

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBe(COMPONENT_NON_MATCHING_HINT_LABEL_KEY);
  });

  it('should not show the create component tooltip over its open menu', async () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Component options'));
    fireEvent.focus(screen.getByLabelText('Create component'));

    // result
    expect(await screen.findAllByText('Create component')).toHaveLength(1);
  });
});
