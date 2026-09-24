import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Mixed from './Mixed';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TRectangleNode } from 'types/design/types';

const baseNode = { height: 20, parentId: null, rotation: 0, width: 20, x: 0, y: 0 };
const frame: TFrameNode = {
  ...baseNode,
  childIds: [],
  clipContent: true,
  fills: [],
  id: 'panelFrame',
  name: 'Frame',
  type: NodeType.frame,
};
const rectangle: TRectangleNode = { ...baseNode, fills: [], id: 'panelRectangle', name: 'Rectangle', type: NodeType.rectangle };
const booleanNode: TBooleanNode = {
  ...baseNode,
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [],
  id: 'panelBoolean',
  name: 'Union',
  type: NodeType.boolean,
};

const renderMixed = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Mixed />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [frame, rectangle, booleanNode], rootIds: [frame.id, rectangle.id, booleanNode.id] }));
});

describe('Mixed snapshots', () => {
  it('should render the common sections of a frame and a rectangle', () => {
    // mock
    store.dispatch(setSelection([frame.id, rectangle.id]));

    // before
    const { asFragment } = renderMixed();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Mixed behaviors', () => {
  it('should show the shared sections and the corner radius for a frame and a rectangle', () => {
    // mock
    store.dispatch(setSelection([frame.id, rectangle.id]));

    // before
    renderMixed();

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
    expect(screen.queryByText('Selection colors')).not.toBeInTheDocument();
  });

  it('should hide the corner radius once a boolean is selected too', () => {
    // mock
    store.dispatch(setSelection([frame.id, rectangle.id, booleanNode.id]));

    // before
    renderMixed();

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.queryByText('Corner radius')).not.toBeInTheDocument();
  });
});
