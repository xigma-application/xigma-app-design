import { act, render } from '@testing-library/react';
import { ReactElement } from 'react';

// components
import LayerRowIcon from './LayerRowIcon';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TTextNode } from 'types/design/types';

vi.mock('./NodeShapeIcon/NodeShapeIcon', () => ({
  default: ({ className, outline, size }: { className?: string; outline: { d: string }; size: number }): ReactElement => (
    <div className={className} data-d={outline.d} data-size={size} data-testid="shape-icon" />
  ),
}));

vi.mock('shared', () => ({
  Icon: ({ className, name, size }: { className?: string; name: string; size: number }): ReactElement => (
    <div className={className} data-name={name} data-size={size} data-testid="generic-icon" />
  ),
}));

const frameNode: TFrameNode = {
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  childIds: [], clipContent: true, type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};
const rectangleNode: TRectangleNode = {
  fill: '#00ff00',
  height: 20,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

const plainTextNode: TTextNode = {
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
};

describe('LayerRowIcon', () => {
  it('should render the text icon for a plain text node', () => {
    // before
    const { getByTestId } = render(<LayerRowIcon node={plainTextNode} size={10} />);

    // result
    expect(getByTestId('generic-icon')).toHaveAttribute('data-name', 'TextTool');
  });

  it('should render the text-on-path icon for a text node bound to a path, not the plain text icon', () => {
    // before
    const { getByTestId } = render(<LayerRowIcon node={{ ...plainTextNode, pathId: 'vector-1' }} size={10} />);

    // result
    expect(getByTestId('generic-icon')).toHaveAttribute('data-name', 'TextOnPathTool');
  });

  it('should render the generic tool icon for a node type with no shape outline', () => {
    // before
    const { getByTestId, queryByTestId } = render(<LayerRowIcon node={frameNode} size={10} />);

    // result
    expect(getByTestId('generic-icon')).toHaveAttribute('data-name', 'FrameTool');
    expect(queryByTestId('shape-icon')).not.toBeInTheDocument();
  });

  it('should render the shape-outline icon for a node type that supports it', () => {
    // before
    const { getByTestId, queryByTestId } = render(<LayerRowIcon node={rectangleNode} size={10} />);

    // result
    expect(getByTestId('shape-icon')).toBeInTheDocument();
    expect(queryByTestId('generic-icon')).not.toBeInTheDocument();
  });

  it('should render the MaskGroup icon instead of the shape outline for a node flagged as a mask', () => {
    // before
    const { getByTestId, queryByTestId } = render(<LayerRowIcon node={{ ...rectangleNode, isMask: true }} size={10} />);

    // result
    expect(getByTestId('generic-icon')).toHaveAttribute('data-name', 'MaskGroup');
    expect(queryByTestId('shape-icon')).not.toBeInTheDocument();
  });

  it('should forward size to the rendered icon', () => {
    // before
    const { getByTestId } = render(<LayerRowIcon node={rectangleNode} size={14} />);

    // result
    expect(getByTestId('shape-icon')).toHaveAttribute('data-size', '14');
  });

  it('should default to size 12 when none is given', () => {
    // before
    const { getByTestId } = render(<LayerRowIcon node={rectangleNode} />);

    // result
    expect(getByTestId('shape-icon')).toHaveAttribute('data-size', '12');
  });

  it('should redraw immediately when the node id changes, e.g. after a drag-and-drop reorder swaps which node a row renders', () => {
    // before
    const { getByTestId, queryByTestId, rerender } = render(<LayerRowIcon node={frameNode} size={10} />);
    expect(getByTestId('generic-icon')).toBeInTheDocument();

    // action
    rerender(<LayerRowIcon node={rectangleNode} size={10} />);

    // result
    expect(getByTestId('shape-icon')).toBeInTheDocument();
    expect(queryByTestId('generic-icon')).not.toBeInTheDocument();
  });

  it('should keep showing the previous shape and only redraw 1 second after the same node’s geometry changes', () => {
    // mock
    vi.useFakeTimers();

    // before
    const { getByTestId, rerender } = render(<LayerRowIcon node={rectangleNode} size={10} />);
    const initialD = getByTestId('shape-icon').getAttribute('data-d');

    // action
    rerender(<LayerRowIcon node={{ ...rectangleNode, width: 40 }} size={10} />);

    // result
    expect(getByTestId('shape-icon').getAttribute('data-d')).toBe(initialD);

    // action
    act(() => vi.advanceTimersByTime(999));

    // result
    expect(getByTestId('shape-icon').getAttribute('data-d')).toBe(initialD);

    // action
    act(() => vi.advanceTimersByTime(1));

    // result
    expect(getByTestId('shape-icon').getAttribute('data-d')).not.toBe(initialD);

    // after
    vi.useRealTimers();
  });
});
