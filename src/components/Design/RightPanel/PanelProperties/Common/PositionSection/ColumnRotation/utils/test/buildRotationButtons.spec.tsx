import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

// store
import { addNode, deleteNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TRectangleNode } from 'types/design/types';
import { TImagePaint } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getLastAddedNodeId } from 'test/getLastAddedNodeId';
import { buildRotationButtons } from '../buildRotationButtons';

const t = i18n.t;

const addFrameNode = (rotation: number): TFrameNode => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
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
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x,
      y,
    }),
  );

  return getLastAddedNodeId(store.getState());
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

  return getLastAddedNodeId(store.getState());
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

  it('should keep both flip buttons enabled while an image crop is being edited, even with no node selected', () => {
    // action
    const buttons = buildRotationButtons(undefined, store.dispatch, t, {} as TSelectedImageCrop);

    // result
    expect(buttons.find((button) => button.name === 'FlipHorizontal')?.disabled).toBe(false);
    expect(buttons.find((button) => button.name === 'FlipVertical')?.disabled).toBe(false);
  });

  it('should flip the image crop’s own flipX, not the frame’s, when an image crop is being edited (regression: the flip buttons stayed wired to the frame even while editing its image)', () => {
    // mock
    const frame = addFrameNode(0);
    const crop = { height: 20, rotation: 0, width: 20, x: 0, y: 0 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(setSelection([frame.id]));

    const imageCrop: TSelectedImageCrop = { crop, node: frame as never, paint, paintIndex: 0 };

    // action
    const [, flipHorizontalButton] = buildRotationButtons(frame, store.dispatch, t, imageCrop);
    flipHorizontalButton?.onClick();

    // result — the paint's own flipX flipped, the frame's own geometry and flip state untouched
    const updatedFrame = selectNodes(store.getState())[frame.id] as TFrameNode;

    expect((updatedFrame.fills[0] as TImagePaint).flipX).toBe(true);
    expect(updatedFrame).toMatchObject({ rotation: 0, x: 0, y: 0 });
  });

  it('should flip the image crop’s own flipY, not the frame’s, when an image crop is being edited', () => {
    // mock
    const frame = addFrameNode(0);
    const crop = { height: 20, rotation: 0, width: 20, x: 0, y: 0 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(setSelection([frame.id]));

    const imageCrop: TSelectedImageCrop = { crop, node: frame as never, paint, paintIndex: 0 };

    // action
    const [, , flipVerticalButton] = buildRotationButtons(frame, store.dispatch, t, imageCrop);
    flipVerticalButton?.onClick();

    // result
    const updatedFrame = selectNodes(store.getState())[frame.id] as TFrameNode;

    expect((updatedFrame.fills[0] as TImagePaint).flipY).toBe(true);
  });

  it('should rotate the image crop, not the frame, when an image crop is being edited', () => {
    // mock — a frame holding an image fill whose crop is rotated independently of the frame
    const frame = addFrameNode(0);
    const crop = { height: 20, rotation: 20, width: 20, x: 0, y: 0 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(setSelection([frame.id]));

    const imageCrop: TSelectedImageCrop = { crop, node: frame as never, paint, paintIndex: 0 };

    // action
    const [rotateButton] = buildRotationButtons(frame, store.dispatch, t, imageCrop);
    rotateButton?.onClick();

    // result — the crop rotated to 110° (20 + 90, wrapped like the frame's own rotate button), the frame itself untouched
    const updatedFrame = selectNodes(store.getState())[frame.id] as TFrameNode;

    expect((updatedFrame.fills[0] as TImagePaint).crop?.rotation).toBe(110);
    expect(updatedFrame.rotation).toBe(0);
  });
});
