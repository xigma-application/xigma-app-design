// store
import slice, {
  addComment,
  addNode,
  cancelCommentDraft,
  deleteComment,
  setActiveTool,
  setSelection,
  setViewport,
  startCommentDraft,
  startTextEdit,
  stopTextEdit,
  updateCommentContent,
  updateNode,
  updateTextEditContent,
  updateTextEditSelection,
} from '../slice';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const frameNodePayload: Omit<TFrameNode, 'id'> = {
  fill: '#ff0000',
  height: 100,
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
};

describe('design slice', () => {
  it('should return the initial state', () => {
    // result
    expect(slice(undefined, { type: 'unknown' })).toEqual({
      activeTool: ToolName.default,
      commentDraftPosition: null,
      comments: {},
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
      nodes: {},
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    });
  });

  it('should set the active tool', () => {
    // before
    const state = slice(undefined, setActiveTool(ToolName.frame));

    // result
    expect(state.activeTool).toBe(ToolName.frame);
  });

  it('should remember the last shape tool when switching to a shape tool', () => {
    // before
    const state = slice(undefined, setActiveTool(ToolName.ellipse));

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should keep the last shape tool when switching to a non-shape tool', () => {
    // before
    const withEllipse = slice(undefined, setActiveTool(ToolName.ellipse));

    // action
    const state = slice(withEllipse, setActiveTool(ToolName.default));

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should remember the last mouse tool when switching to the hand tool', () => {
    // before
    const state = slice(undefined, setActiveTool(ToolName.hand));

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should keep the last mouse tool when switching to a non-mouse tool', () => {
    // before
    const withHand = slice(undefined, setActiveTool(ToolName.hand));

    // action
    const state = slice(withHand, setActiveTool(ToolName.frame));

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should add a node with a generated id', () => {
    // before
    const state = slice(undefined, addNode(frameNodePayload));
    const [id] = state.rootOrder;

    // result
    expect(state.rootOrder).toHaveLength(1);
    expect(state.nodes[id]).toEqual({ ...frameNodePayload, id });
  });

  it('should update an existing node', () => {
    // before
    const withNode = slice(undefined, addNode(frameNodePayload));
    const [id] = withNode.rootOrder;

    // action
    const state = slice(withNode, updateNode({ changes: { width: 300 }, id }));

    // result
    expect((state.nodes[id] as TFrameNode).width).toBe(300);
  });

  it('should do nothing when updating a node that does not exist', () => {
    // before
    const state = slice(undefined, updateNode({ changes: { width: 300 }, id: 'missing' }));

    // result
    expect(state.nodes).toEqual({});
  });

  it('should set the viewport', () => {
    // before
    const state = slice(undefined, setViewport({ x: 10, y: 20, zoom: 2 }));

    // result
    expect(state.viewport).toEqual({ x: 10, y: 20, zoom: 2 });
  });

  it('should set the selection', () => {
    // before
    const state = slice(undefined, setSelection(['a', 'b']));

    // result
    expect(state.selectedIds).toEqual(['a', 'b']);
  });

  it('should start editing a text box', () => {
    // before
    const state = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // result
    expect(state.editingTextBox).toEqual({ flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 });
  });

  it('should reset the editing content when starting to edit a text box', () => {
    // before
    const withContent = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );
    const typed = slice(withContent, updateTextEditContent('hello'));

    // action
    const state = slice(typed, startTextEdit({ box: { flipX: false, flipY: false, height: 30, rotation: 0, width: 200, x: 0, y: 0 } }));

    // result
    expect(state.editingTextContent).toBe('');
  });

  it('should stop editing a text box', () => {
    // before
    const editing = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // action
    const state = slice(editing, stopTextEdit());

    // result
    expect(state.editingTextBox).toBeNull();
    expect(state.editingTextContent).toBe('');
  });

  it('should update the live text edit content', () => {
    // before
    const editing = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // action
    const state = slice(editing, updateTextEditContent('hello'));

    // result
    expect(state.editingTextContent).toBe('hello');
  });

  it('should record the node id and seed its content when starting to edit an existing text node', () => {
    // before
    const state = slice(
      undefined,
      startTextEdit({
        box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
        content: 'hello',
        id: 'node-1',
      }),
    );

    // result
    expect(state.editingNodeId).toBe('node-1');
    expect(state.editingTextContent).toBe('hello');
  });

  it('should update the live text edit selection', () => {
    // mock
    vi.spyOn(Date, 'now').mockReturnValue(12345);

    // before
    const state = slice(undefined, updateTextEditSelection({ end: 5, start: 2 }));

    // result
    expect(state.editingSelectionStart).toBe(2);
    expect(state.editingSelectionEnd).toBe(5);
    expect(state.editingSelectionChangedAt).toBe(12345);

    // after
    vi.restoreAllMocks();
  });

  it('should start a comment draft at a given position', () => {
    // before
    const state = slice(undefined, startCommentDraft({ x: 10, y: 20 }));

    // result
    expect(state.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should cancel a comment draft', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));

    // action
    const state = slice(withDraft, cancelCommentDraft());

    // result
    expect(state.commentDraftPosition).toBeNull();
  });

  it('should add a comment at the draft position with a generated id, then clear the draft', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));

    // action
    const state = slice(withDraft, addComment('hello'));
    const [id] = Object.keys(state.comments);

    // result
    expect(state.comments[id]).toMatchObject({ content: 'hello', id, x: 10, y: 20 });
    expect(state.commentDraftPosition).toBeNull();
  });

  it('should do nothing when adding a comment without an open draft', () => {
    // before
    const state = slice(undefined, addComment('hello'));

    // result
    expect(state.comments).toEqual({});
  });

  it('should update an existing comment content', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));
    const withComment = slice(withDraft, addComment('hello'));
    const [id] = Object.keys(withComment.comments);

    // action
    const state = slice(withComment, updateCommentContent({ content: 'updated', id }));

    // result
    expect(state.comments[id].content).toBe('updated');
  });

  it('should do nothing when updating a comment that does not exist', () => {
    // before
    const state = slice(undefined, updateCommentContent({ content: 'updated', id: 'missing' }));

    // result
    expect(state.comments).toEqual({});
  });

  it('should delete a comment', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));
    const withComment = slice(withDraft, addComment('hello'));
    const [id] = Object.keys(withComment.comments);

    // action
    const state = slice(withComment, deleteComment(id));

    // result
    expect(state.comments).toEqual({});
  });
});
