import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FrameHeaderButtons from './FrameHeaderButtons';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderFrameHeaderButtons = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <FrameHeaderButtons />
      </TooltipProvider>
    </Provider>,
  );

const makeFrame = (id: string): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 20,
  x: 0,
  y: 0,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makeFrame('headerFrameA'),
        { ...makeFrame('headerFrameB'), childIds: ['headerFrameInner'] },
        { ...makeFrame('headerFrameInner'), parentId: 'headerFrameB' },
      ],
      rootIds: ['headerFrameA', 'headerFrameB'],
    }),
  );
});

beforeEach(() => {
  store.dispatch(setSelection([]));
});

describe('FrameHeaderButtons snapshots', () => {
  it('should render the html tag and component buttons', () => {
    // before
    const { asFragment } = renderFrameHeaderButtons();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeaderButtons behaviors', () => {
  it('should do nothing yet when the html tag button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Toggle ready for dev status');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should do nothing yet when the component button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Create component');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should not render a mask button — frames cannot be used as masks', () => {
    // before
    renderFrameHeaderButtons();

    // result
    expect(screen.queryByLabelText('Use as mask')).not.toBeInTheDocument();
  });

  it('should show the html tag, component split button, mask and wrap in section buttons while several frames are selected', () => {
    // mock
    store.dispatch(setSelection(['headerFrameA', 'headerFrameB']));

    // before
    renderFrameHeaderButtons();

    // result
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Wrap in new section')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select matching layers')).not.toBeInTheDocument();
  });

  it('should keep only matching layers and the component split button while frames from different parents are selected', () => {
    // mock
    store.dispatch(setSelection(['headerFrameA', 'headerFrameInner']));

    // before
    renderFrameHeaderButtons();

    // result
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();
    expect(screen.queryByLabelText('Toggle ready for dev status')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Use as mask')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });
});
