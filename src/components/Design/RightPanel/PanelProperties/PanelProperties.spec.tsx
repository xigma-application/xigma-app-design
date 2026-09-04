import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelProperties from './PanelProperties';
import { TooltipProvider } from 'shared';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const renderPanelProperties = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelProperties />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('PanelProperties behaviors', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the Design, Styles, Export, and MCP sections while nothing is selected', () => {
    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('Styles')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });

  it('should render nothing while a node is selected that no longer exists', () => {
    // mock
    store.dispatch(setSelection(['node-1']));

    // before
    const { container } = renderPanelProperties();

    // result
    expect(container).toBeEmptyDOMElement();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the FrameHeader while a single frame is selected', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
    expect(screen.queryByText('Page')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should render nothing while multiple frames are selected', () => {
    // mock
    const firstFrameId = addFrameNode();
    const secondFrameId = addFrameNode();
    store.dispatch(setSelection([firstFrameId, secondFrameId]));

    // before
    const { container } = renderPanelProperties();

    // result
    expect(container).toBeEmptyDOMElement();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the FrameTool panel while the frame tool is active, regardless of selection', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.frame));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();

    // cleanup
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should show the FrameTool panel over the selected frame panel while the frame tool is active', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));
    store.dispatch(setActiveTool(ToolName.frame));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Phone')).toBeInTheDocument();

    // cleanup
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
  });
});
