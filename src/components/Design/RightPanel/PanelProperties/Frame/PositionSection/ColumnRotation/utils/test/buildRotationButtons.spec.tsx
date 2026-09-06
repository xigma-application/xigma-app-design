import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

// store
import { addNode, deleteNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { buildRotationButtons } from '../buildRotationButtons';

const t = i18n.t;

const addFrameNode = (rotation: number): TFrameNode => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ffffff',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder, nodes } = selectActivePage(store.getState());

  return nodes[rootOrder[rootOrder.length - 1]] as TFrameNode;
};

const addRectangleNode = (parentId: string | null, x = 0, y = 0): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Rectangle', parentId, rotation: 0, type: NodeType.rectangle, width: 10, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addEllipseNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('buildRotationButtons', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should return one button for rotate and each flip axis', () => {
    // action
    const buttons = buildRotationButtons(undefined, store.dispatch, t);

    // result
    expect(buttons.map((button) => button.name)).toEqual(['ToggleRotate', 'FlipHorizontal', 'FlipVertical']);
  });

  it('should render the translated rotate tooltip', () => {
    // action
    const [rotateButton] = buildRotationButtons(undefined, store.dispatch, t);
    render(<div>{rotateButton?.tooltip}</div>);

    // result
    expect(screen.getByText('Rotate 90° right')).toBeInTheDocument();
  });

  it('should render the translated label and the keyboard shortcut in the flip tooltips', () => {
    // action
    const [, flipHorizontalButton, flipVerticalButton] = buildRotationButtons(undefined, store.dispatch, t);
    render(
      <div>
        <div>{flipHorizontalButton?.tooltip}</div>
        <div>{flipVerticalButton?.tooltip}</div>
      </div>,
    );

    // result
    expect(screen.getByText('Flip horizontal')).toBeInTheDocument();
    expect(screen.getByText('Flip vertical')).toBeInTheDocument();
    expect(screen.getByText('⇧H')).toBeInTheDocument();
    expect(screen.getByText('⇧V')).toBeInTheDocument();
  });

  it('should do nothing on rotate click when no frame is selected', () => {
    // action
    const [rotateButton] = buildRotationButtons(undefined, store.dispatch, t);

    // result — no throw, nothing dispatched
    expect(() => rotateButton?.onClick()).not.toThrow();
  });

  it('should rotate the frame 90° clockwise on rotate click', () => {
    // mock
    const frame = addFrameNode(20);

    // action
    const [rotateButton] = buildRotationButtons(frame, store.dispatch, t);
    rotateButton?.onClick();

    // result
    expect((selectNodes(store.getState())[frame.id] as TFrameNode).rotation).toBe(110);
  });

  it('should not introduce floating-point noise when the starting rotation is already imprecise', () => {
    // mock
    const frame = addFrameNode(19.999999999999996);

    // action
    const [rotateButton] = buildRotationButtons(frame, store.dispatch, t);
    rotateButton?.onClick();

    // result
    expect((selectNodes(store.getState())[frame.id] as TFrameNode).rotation).toBe(110);
  });

  it('should wrap the rotation around 360°', () => {
    // mock
    const frame = addFrameNode(315);

    // action
    const [rotateButton] = buildRotationButtons(frame, store.dispatch, t);
    rotateButton?.onClick();

    // result
    expect((selectNodes(store.getState())[frame.id] as TFrameNode).rotation).toBe(45);
  });

  it('should rigidly rotate the frame’s own children along with it, anchored to the frame’s centre', () => {
    // mock — a 20x20 frame with one 10x10 child flush against its own top-left corner
    const staleFrame = addFrameNode(0);
    const childId = addRectangleNode(staleFrame.id, 0, 0);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: staleFrame.id }));

    // re-read the frame post-move — childIds only lands on this fresher copy
    const frame = selectNodes(store.getState())[staleFrame.id] as TFrameNode;

    // action
    const [rotateButton] = buildRotationButtons(frame, store.dispatch, t);
    rotateButton?.onClick();

    // result — the child orbits the frame's own centre (10,10) by 90deg and tilts along with it
    const child = selectNodes(store.getState())[childId] as TRectangleNode;

    expect(child.rotation).toBe(90);
    expect(child).toMatchObject({ x: 10, y: 0 });
  });

  it('should flip the selected node horizontally on flip-horizontal click', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // action
    const [, flipHorizontalButton] = buildRotationButtons(undefined, store.dispatch, t);
    flipHorizontalButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TEllipseNode).flipX).toBe(true);
  });

  it('should flip the selected node vertically on flip-vertical click', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // action
    const [, , flipVerticalButton] = buildRotationButtons(undefined, store.dispatch, t);
    flipVerticalButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TEllipseNode).flipY).toBe(true);
  });
});
