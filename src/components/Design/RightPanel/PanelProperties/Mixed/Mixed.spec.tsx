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
import { TBooleanNode, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

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

const section: TSectionNode = {
  ...baseNode,
  ...getDefaultSectionStyle(),
  childIds: ['panelSectionChild'],
  id: 'panelSection',
  name: 'Section',
  type: NodeType.section,
};
const secondFrame: TFrameNode = { ...frame, id: 'panelSecondFrame' };
const sectionChild: TRectangleNode = { ...rectangle, id: 'panelSectionChild', parentId: 'panelSection' };

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
  store.dispatch(
    addNodes({
      nodes: [frame, secondFrame, rectangle, booleanNode, section, sectionChild],
      rootIds: [frame.id, secondFrame.id, rectangle.id, booleanNode.id, section.id],
    }),
  );
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

  it('should show rotation and no Resize to fit for a frame without children and a rectangle', () => {
    // mock
    store.dispatch(setSelection([frame.id, rectangle.id]));

    // before
    renderMixed();

    // result
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    expect(screen.queryByLabelText('Resize to fit')).not.toBeInTheDocument();
  });

  it('should drop rotation, effects and the component button and add Resize to fit once a section is selected', () => {
    // mock
    store.dispatch(setSelection([section.id, rectangle.id]));

    // before
    renderMixed();

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
    expect(screen.queryByText('Rotation')).not.toBeInTheDocument();
    expect(screen.queryByText('Effects')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Component options')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Resize to fit')).toBeEnabled();
  });

  it('should show selection colors for a section and a frame, and layout guides only for frames', () => {
    // mock
    store.dispatch(setSelection([section.id, frame.id]));

    // before
    const { unmount } = renderMixed();

    // result
    expect(screen.getByText('Selection colors')).toBeInTheDocument();
    expect(screen.queryByText('Layout guide')).not.toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection([frame.id, secondFrame.id]));
    renderMixed();

    // result
    expect(screen.getByText('Layout guide')).toBeInTheDocument();
  });
});
