import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelProperties from './PanelProperties';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, groupNodes, setActiveTool, setGridSettingsPanelOpen, setImageEditor, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectIsGridSettingsPanelOpen } from 'store/design/selectors';
import { store } from 'store';

// types
import { BooleanOperation, LayoutMode, LineEndpoint, NodeType, ToolName } from 'types/design/enums';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const renderPanelProperties = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <PanelProperties />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

const addFrameNodeWithImageFill = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [
        {
          crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
          opacity: 100,
          ref: 'asset-1',
          rotation: 0,
          scaleMode: 'fill',
          type: 'image',
        },
      ],
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

const addRectangleNode = (): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const groupSelection = (ids: string[]): string => {
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return selectActivePage(store.getState()).selectedIds[0];
};

describe('PanelProperties behaviors', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
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

  it('should show the Section panel while every selected layer is a section', () => {
    // mock
    store.dispatch(
      addNode({
        ...getDefaultSectionStyle(),
        childIds: [],
        height: 20,
        name: 'Section',
        parentId: null,
        rotation: 0,
        type: NodeType.section,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByLabelText('Element type')).toHaveTextContent('Section');
    expect(screen.queryByText('Rotation')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Rectangle panel while a single rectangle is selected', () => {
    // mock
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([rectangleId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.queryByText('Page')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Rectangle panel with the boolean operations button while several rectangles are selected', () => {
    // mock
    const firstRectangleId = addRectangleNode();
    const secondRectangleId = addRectangleNode();
    store.dispatch(setSelection([firstRectangleId, secondRectangleId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Frame panel with the wrap in section button while multiple frames are selected', () => {
    // mock
    const firstFrameId = addFrameNode();
    const secondFrameId = addFrameNode();
    store.dispatch(setSelection([firstFrameId, secondFrameId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
    expect(screen.getByLabelText('Wrap in new section')).toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Mixed panel with only the common sections while a frame and a rectangle are selected together', () => {
    // mock
    const frameId = addFrameNode();
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([frameId, rectangleId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();
    expect(screen.getByLabelText('Wrap in new section')).toBeInTheDocument();
    expect(screen.queryByLabelText('Use as mask')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Group panel with the children fill while a group of rectangles is selected, and its Mask button turns the group into a mask', () => {
    // mock
    const groupId = groupSelection([addRectangleNode(), addRectangleNode()]);

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();

    // action
    act(() => screen.getByLabelText('Use as mask').click());

    // result
    expect(selectActivePage(store.getState()).nodes[groupId].type).toBe(NodeType.mask);

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Group panel while several groups are selected', () => {
    // mock
    const firstGroupId = groupSelection([addRectangleNode(), addRectangleNode()]);
    const secondGroupId = groupSelection([addRectangleNode(), addRectangleNode()]);
    store.dispatch(setSelection([firstGroupId, secondGroupId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
    expect(screen.queryByText('2 selected')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should hide Fill in the Group panel while a child has no fill section', () => {
    // mock
    const rectangleId = addRectangleNode();
    store.dispatch(
      addNode({ fill: '#ffffff', height: 20, name: 'Ellipse', parentId: null, rotation: 0, type: NodeType.ellipse, width: 20, x: 0, y: 0 }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    groupSelection([rectangleId, rootOrder[rootOrder.length - 1]]);

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should show the Boolean panel while a single boolean is selected', () => {
    // mock
    store.dispatch(
      addNode({
        booleanOperation: BooleanOperation.union,
        childIds: [],
        fills: [],
        height: 20,
        name: 'Union',
        parentId: null,
        rotation: 0,
        type: NodeType.boolean,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Union')).toBeInTheDocument();
  });

  it('should show the Slice panel while a single slice is selected', () => {
    // mock
    store.dispatch(addNode({ height: 20, name: 'Slice', parentId: null, rotation: 0, type: NodeType.slice, width: 20, x: 0, y: 0 }));
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Slice')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
  });

  it('should show the Line panel with a stroke and no fill section while a line is selected', () => {
    // mock
    store.dispatch(
      addNode({
        endPoint: LineEndpoint.none,
        height: 0,
        name: 'Line',
        parentId: null,
        rotation: 0,
        startPoint: LineEndpoint.none,
        strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
        type: NodeType.line,
        width: 40,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Line')).toBeInTheDocument();
    expect(screen.getByText('Start point')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
  });

  it('should show the Mixed panel without a Fill section for a line selected with a rectangle', () => {
    // mock
    const rectangleId = addRectangleNode();
    store.dispatch(
      addNode({
        height: 0,
        name: 'Line',
        parentId: null,
        rotation: 0,
        strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
        type: NodeType.line,
        width: 40,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rectangleId, rootOrder[rootOrder.length - 1]]));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
  });

  it('should render nothing while a rectangle and a layer without a panel are selected together', () => {
    // mock
    const rectangleId = addRectangleNode();
    store.dispatch(
      addNode({ fill: '#ffffff', height: 20, name: 'Ellipse', parentId: null, rotation: 0, type: NodeType.ellipse, width: 20, x: 0, y: 0 }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rectangleId, rootOrder[rootOrder.length - 1]]));

    // before
    const { container } = renderPanelProperties();

    // result
    expect(container).toBeEmptyDOMElement();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should swap in the Grid settings panel while a grid frame is selected and the flag is on', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 2, layoutMode: LayoutMode.grid }, id: frameId }));
    store.dispatch(setSelection([frameId]));
    store.dispatch(setGridSettingsPanelOpen(true));

    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getByText('Rows')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close grid settings' })).toBeInTheDocument();

    // cleanup
    store.dispatch(setGridSettingsPanelOpen(false));
    store.dispatch(setSelection([]));
  });

  it('should close the grid settings panel when a deselected grid frame is selected again', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 2, layoutMode: LayoutMode.grid }, id: frameId }));
    store.dispatch(setSelection([frameId]));
    store.dispatch(setGridSettingsPanelOpen(true));

    // before
    renderPanelProperties();
    expect(screen.getByRole('button', { name: 'Close grid settings' })).toBeInTheDocument();

    // action: deselect, then select the same grid frame again (two distinct renders, like on the real canvas)
    act(() => {
      store.dispatch(setSelection([]));
    });
    act(() => {
      store.dispatch(setSelection([frameId]));
    });

    // result
    expect(screen.queryByRole('button', { name: 'Close grid settings' })).not.toBeInTheDocument();
    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should keep the normal frame panel for a grid frame while the flag is off', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(updateNode({ changes: { layoutMode: LayoutMode.grid }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    renderPanelProperties();

    // result
    expect(screen.queryByRole('button', { name: 'Close grid settings' })).not.toBeInTheDocument();

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

  it("should swap in the dedicated ImageCrop panel, without Alignment, while a frame's image content is the selected crop-mode target", () => {
    // mock
    const frameId = addFrameNodeWithImageFill();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'image' }));

    // before
    renderPanelProperties();

    // result — the dedicated Image panel replaces Frame's own, and drops Alignment
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.queryByText('Frame')).not.toBeInTheDocument();
    expect(screen.getAllByText('Position').length).toBeGreaterThan(0);
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.queryByText('Alignment')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setImageEditor(null));
    store.dispatch(setSelection([]));
  });

  it('should fall back to the normal Frame panel once the crop-mode target switches back to the frame itself (regression: leaving the image focus must close the dedicated ImageCrop panel again)', () => {
    // mock
    const frameId = addFrameNodeWithImageFill();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'image' }));

    // before
    const { rerender } = renderPanelProperties();

    expect(screen.getByText('Image')).toBeInTheDocument();

    // action — the user clicks back onto the frame itself
    act(() => {
      store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'frame' }));
    });
    rerender(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <PanelProperties />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result — back to the ordinary Frame panel, Alignment included again
    expect(screen.getByText('Frame')).toBeInTheDocument();
    expect(screen.queryByText('Image')).not.toBeInTheDocument();
    expect(screen.getByText('Alignment')).toBeInTheDocument();

    // cleanup
    store.dispatch(setImageEditor(null));
    store.dispatch(setSelection([]));
  });

  it('should show the Slice panel for several slices and the Mixed panel with only the slice sections for a slice and a rectangle', () => {
    // mock
    ['multiSliceA', 'multiSliceB'].forEach((name) =>
      store.dispatch(addNode({ height: 20, name, parentId: null, rotation: 0, type: NodeType.slice, width: 20, x: 0, y: 0 })),
    );
    store.dispatch(
      addNode({
        fills: [],
        height: 20,
        name: 'multiRectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const [sliceA, sliceB, rectangle] = rootOrder.slice(-3);
    store.dispatch(setSelection([sliceA, sliceB]));

    // before
    const { unmount } = renderPanelProperties();

    // result
    expect(screen.getByText('Slice')).toBeInTheDocument();
    expect(screen.getByText('Export 2 layers')).toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection([sliceA, rectangle]));
    renderPanelProperties();

    // result
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
  });
});
