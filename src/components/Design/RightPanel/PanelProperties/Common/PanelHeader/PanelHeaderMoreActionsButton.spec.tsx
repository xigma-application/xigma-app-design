import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderMoreActionsButton from './PanelHeaderMoreActionsButton';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const editObjects = vi.fn();

vi.mock('./hooks/useEditObject', () => ({ useEditObject: (): TFunc => editObjects }));

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderMoreActionsButton />
      </TooltipProvider>
    </Provider>,
  );

describe('PanelHeaderMoreActionsButton snapshots', () => {
  it('should render the more actions trigger', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderMoreActionsButton behaviors', () => {
  it('should list the component, edit and section actions when the menu opens', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Create component')).toBeInTheDocument();
    expect(screen.getByText('Create multiple components')).toBeInTheDocument();
    expect(screen.getByText('Create component set')).toBeInTheDocument();
    expect(screen.getByText('Edit objects')).toBeInTheDocument();
    expect(screen.getByText('Wrap in new section')).toBeInTheDocument();
  });

  it('should start editing the objects when Edit objects is clicked', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));
    fireEvent.click(screen.getByText('Edit objects'));

    // result
    expect(editObjects).toHaveBeenCalledTimes(1);
  });
});
