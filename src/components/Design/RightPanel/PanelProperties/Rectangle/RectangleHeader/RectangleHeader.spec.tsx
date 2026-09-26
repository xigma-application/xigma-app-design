import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import RectangleHeader from './RectangleHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderRectangleHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <RectangleHeader />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const makeRectangle = (id: string): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makeRectangle('headerA'),
        makeRectangle('headerB'),
        { ...makeRectangle('headerNested'), parentId: 'headerB' },
        { ...makeRectangle('headerImage'), fills: [{ opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' }] },
        { ...makeRectangle('headerVideo'), fills: [{ opacity: 100, ref: 'blob:video', rotation: 0, scaleMode: 'fill', type: 'video' }] },
      ],
      rootIds: ['headerA', 'headerB', 'headerImage', 'headerVideo'],
    }),
  );
});

beforeEach(() => {
  store.dispatch(setSelection([]));
});

describe('RectangleHeader snapshots', () => {
  it('should render the Rectangle label with the create component button', () => {
    // before
    const { asFragment } = renderRectangleHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('RectangleHeader behaviors', () => {
  it('should render the Rectangle label', () => {
    // before
    renderRectangleHeader();

    // result
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
  });

  it('should render the Image label while a rectangle filled with an image is selected', () => {
    // mock
    store.dispatch(setSelection(['headerImage']));

    // before
    renderRectangleHeader();

    // result
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should render the selected count while an image and a video are selected together', () => {
    // mock
    store.dispatch(setSelection(['headerImage', 'headerVideo']));

    // before
    renderRectangleHeader();

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('should render the create component button and no element type menu', () => {
    // before
    renderRectangleHeader();

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });

  it('should swap Create component and Edit object for the more actions menu while several rectangles are selected', () => {
    // mock
    store.dispatch(setSelection(['headerA']));

    // before
    const { unmount } = renderRectangleHeader();

    // result
    expect(screen.queryByLabelText('More actions')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit object')).toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection(['headerA', 'headerB']));
    renderRectangleHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Edit object')).not.toBeInTheDocument();
  });

  it('should keep the header buttons while rectangles from different parents are selected', () => {
    // mock
    store.dispatch(setSelection(['headerA', 'headerNested']));

    // before
    renderRectangleHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
  });
});
