import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MixedHeader from './MixedHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TRectangleNode } from 'types/design/types';

const frame: TFrameNode = {
  childIds: ['mixedHeaderInner'],
  clipContent: true,
  fills: [],
  height: 100,
  id: 'mixedHeaderFrame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

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

const union: TBooleanNode = {
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [],
  height: 10,
  id: 'mixedHeaderUnion',
  name: 'Union',
  parentId: null,
  rotation: 0,
  type: NodeType.boolean,
  width: 10,
  x: 0,
  y: 0,
};

const renderMixedHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <MixedHeader count={2} />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [frame, makeRectangle('mixedHeaderInner', 'mixedHeaderFrame'), makeRectangle('mixedHeaderRoot', null), union],
      rootIds: ['mixedHeaderFrame', 'mixedHeaderRoot', 'mixedHeaderUnion'],
    }),
  );
});

describe('MixedHeader snapshots', () => {
  it('should render the selected count label with its buttons', () => {
    // mock
    store.dispatch(setSelection(['mixedHeaderFrame', 'mixedHeaderRoot']));

    // before
    const { asFragment } = renderMixedHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('MixedHeader behaviors', () => {
  it('should render the selected count label', () => {
    // before
    renderMixedHeader();

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('should show matching layers, the component split button and wrap in section for a frame and a rectangle sharing a parent', () => {
    // mock
    store.dispatch(setSelection(['mixedHeaderFrame', 'mixedHeaderRoot']));

    // before
    renderMixedHeader();

    // result
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();
    expect(screen.getByLabelText('Wrap in new section')).toBeInTheDocument();
    expect(screen.queryByLabelText('More actions')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Boolean operations')).not.toBeInTheDocument();
  });

  it('should hide wrap in section for a frame and a rectangle from different parents', () => {
    // mock
    store.dispatch(setSelection(['mixedHeaderFrame', 'mixedHeaderInner']));

    // before
    renderMixedHeader();

    // result
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });

  it('should show mask, boolean and a more actions menu with the component actions and wrap in section for shapes', () => {
    // mock
    store.dispatch(setSelection(['mixedHeaderRoot', 'mixedHeaderUnion']));

    // before
    renderMixedHeader();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
    expect(screen.queryByLabelText('Component options')).not.toBeInTheDocument();
    expect(screen.getAllByText('Create component')).toHaveLength(1);
    expect(screen.getByText('Wrap in new section')).toBeInTheDocument();
    expect(screen.queryByText('Edit objects')).not.toBeInTheDocument();
  });
});
