import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { buildRotationButtons } from '../buildRotationButtons';

const t = i18n.t;

const addRectangleNode = (rotation: number): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
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
    store.dispatch(setSelection([]));
  });

  it('should return one button for rotate and each flip axis', () => {
    // action
    const buttons = buildRotationButtons('id', 0, store.dispatch, t);

    // result
    expect(buttons.map((button) => button.name)).toEqual(['ToggleRotate', 'FlipHorizontal', 'FlipVertical']);
  });

  it('should render the translated rotate tooltip', () => {
    // action
    const [rotateButton] = buildRotationButtons('id', 0, store.dispatch, t);
    render(<div>{rotateButton?.tooltip}</div>);

    // result
    expect(screen.getByText('Rotate 90° right')).toBeInTheDocument();
  });

  it('should render the translated label and the keyboard shortcut in the flip tooltips', () => {
    // action
    const [, flipHorizontalButton, flipVerticalButton] = buildRotationButtons('id', 0, store.dispatch, t);
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

  it('should rotate the node 90° clockwise on rotate click', () => {
    // mock
    const id = addRectangleNode(20);

    // action
    const [rotateButton] = buildRotationButtons(id, 20, store.dispatch, t);
    rotateButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TRectangleNode).rotation).toBe(110);
  });

  it('should not introduce floating-point noise when the starting rotation is already imprecise', () => {
    // mock
    const id = addRectangleNode(19.999999999999996);

    // action
    const [rotateButton] = buildRotationButtons(id, 19.999999999999996, store.dispatch, t);
    rotateButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TRectangleNode).rotation).toBe(110);
  });

  it('should wrap the rotation around 360°', () => {
    // mock
    const id = addRectangleNode(315);

    // action
    const [rotateButton] = buildRotationButtons(id, 315, store.dispatch, t);
    rotateButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TRectangleNode).rotation).toBe(45);
  });

  it('should flip the selected node horizontally on flip-horizontal click', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // action
    const [, flipHorizontalButton] = buildRotationButtons(id, 0, store.dispatch, t);
    flipHorizontalButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TEllipseNode).flipX).toBe(true);
  });

  it('should flip the selected node vertically on flip-vertical click', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // action
    const [, , flipVerticalButton] = buildRotationButtons(id, 0, store.dispatch, t);
    flipVerticalButton?.onClick();

    // result
    expect((selectNodes(store.getState())[id] as TEllipseNode).flipY).toBe(true);
  });
});
