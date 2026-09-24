import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderWrapInSectionButton from './PanelHeaderWrapInSectionButton';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderWrapInSectionButton />
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
  store.dispatch(
    addNodes({
      nodes: [makeRectangle('first', null), makeRectangle('second', null), makeRectangle('third', null), makeRectangle('nested', 'third')],
      rootIds: ['first', 'second', 'third'],
    }),
  );
});

afterEach(() => {
  store.dispatch(setSelection([]));
});

describe('PanelHeaderWrapInSectionButton snapshots', () => {
  it('should render the wrap in section button for a multi-selection', () => {
    // mock
    store.dispatch(setSelection(['first', 'second']));

    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderWrapInSectionButton behaviors', () => {
  it('should render nothing for a single selection', () => {
    // mock
    store.dispatch(setSelection(['first']));

    // before
    renderButton();

    // result
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });

  it('should render nothing when a selected layer sits inside another layer', () => {
    // mock
    store.dispatch(setSelection(['first', 'nested']));

    // before
    renderButton();

    // result
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });

  it('should wrap the selection in a new section when clicked', () => {
    // mock
    store.dispatch(setSelection(['first', 'second']));

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Wrap in new section'));

    // result
    const [sectionId] = selectSelectedIds(store.getState());
    expect(selectNodes(store.getState())[sectionId]).toMatchObject({ childIds: ['first', 'second'], type: NodeType.section });
  });
});
