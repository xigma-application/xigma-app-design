import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderMoreActionsButton, { TPanelHeaderMoreActionsButtonProps } from './PanelHeaderMoreActionsButton';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const editObjects = vi.fn();

vi.mock('./hooks/useEditObject', () => ({ useEditObject: (): TFunc => editObjects }));

const renderButton = (props: TPanelHeaderMoreActionsButtonProps = {}): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderMoreActionsButton {...props} />
      </TooltipProvider>
    </Provider>,
  );

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

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [makeRectangle('moreA', null), makeRectangle('moreB', 'moreA')], rootIds: ['moreA'] }));
});

beforeEach(() => {
  store.dispatch(setSelection([]));
});

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
    // mock
    store.dispatch(setSelection(['moreA']));

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

  it('should list only the component actions for layers from different parents', () => {
    // mock
    store.dispatch(setSelection(['moreA', 'moreB']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Create component')).toBeInTheDocument();
    expect(screen.queryByText('Edit objects')).not.toBeInTheDocument();
    expect(screen.queryByText('Wrap in new section')).not.toBeInTheDocument();
  });

  it('should leave out wrap in section for a layer inside another layer', () => {
    // mock
    store.dispatch(setSelection(['moreB']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Edit objects')).toBeInTheDocument();
    expect(screen.queryByText('Wrap in new section')).not.toBeInTheDocument();
  });

  it('should leave out edit objects when asked, keeping the component actions and wrap in section', () => {
    // mock
    store.dispatch(setSelection(['moreA']));

    // before
    renderButton({ withEditObjects: false });

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Create component')).toBeInTheDocument();
    expect(screen.getByText('Wrap in new section')).toBeInTheDocument();
    expect(screen.queryByText('Edit objects')).not.toBeInTheDocument();
  });
});
