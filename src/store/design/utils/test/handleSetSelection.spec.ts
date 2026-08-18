// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TEllipseNode, TFrameNode } from 'types/design/types';

// utils
import { handleSetSelection } from '../handleSetSelection';

const buildState = (nodes: TDesignState['nodes'], selectedIds: string[]): TDesignState => ({
  activeTool: ToolName.default,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  lastFrameTool: ToolName.frame,
  lastMouseTool: ToolName.default,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes,
  rootOrder: Object.keys(nodes),
  selectedIds,
  viewport: { x: 0, y: 0, zoom: 1 },
});

const frame: TFrameNode = {
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const buildEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('handleSetSelection', () => {
  it('should update selectedIds to the given list', () => {
    // mock
    const state = buildState({ [frame.id]: frame }, [frame.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.selectedIds).toEqual([]);
  });

  it('should not delete a deselected node that is not a fully cut-away ellipse', () => {
    // mock
    const state = buildState({ [frame.id]: frame }, [frame.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[frame.id]).toBeDefined();
  });

  it('should not delete a deselected ellipse with no arc angles set (defaults to a full circle)', () => {
    // mock — arcStartAngle/arcEndAngle default to the same value (a full, non-degenerate circle)
    const ellipse = buildEllipse();
    const state = buildState({ [ellipse.id]: ellipse }, [ellipse.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[ellipse.id]).toBeDefined();
  });

  it('should delete a deselected ellipse that is fully cut away', () => {
    // mock — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const state = buildState({ [ellipse.id]: ellipse }, [ellipse.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[ellipse.id]).toBeUndefined();
  });

  it('should not delete a fully cut-away ellipse that stays selected', () => {
    // mock
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const state = buildState({ [ellipse.id]: ellipse }, [ellipse.id]);

    // before
    handleSetSelection(state, [ellipse.id]);

    // result
    expect(state.nodes[ellipse.id]).toBeDefined();
  });
});
