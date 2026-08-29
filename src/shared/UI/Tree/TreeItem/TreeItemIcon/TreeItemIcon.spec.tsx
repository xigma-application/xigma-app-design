import { act, render } from '@testing-library/react';
import { ReactElement } from 'react';

// components
import TreeItemIcon from './TreeItemIcon';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

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
  type: NodeType.frame,
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

describe('TreeItemIcon', () => {
  it('should render the generic tool icon for a node type with no shape outline', () => {
    // before
    const { getByTestId, queryByTestId } = render(<TreeItemIcon node={frameNode} size={10} />);

    // result
    expect(getByTestId('generic-icon')).toHaveAttribute('data-name', 'FrameTool');
    expect(queryByTestId('shape-icon')).not.toBeInTheDocument();
  });

  it('should render the shape-outline icon for a node type that supports it', () => {
    // before
    const { getByTestId, queryByTestId } = render(<TreeItemIcon node={rectangleNode} size={10} />);

    // result
    expect(getByTestId('shape-icon')).toBeInTheDocument();
    expect(queryByTestId('generic-icon')).not.toBeInTheDocument();
  });

  it('should forward className and size to the rendered icon', () => {
    // before
    const { getByTestId } = render(<TreeItemIcon className="my-icon" node={rectangleNode} size={14} />);

    // result
    const icon = getByTestId('shape-icon');
    expect(icon).toHaveClass('my-icon');
    expect(icon).toHaveAttribute('data-size', '14');
  });

  it('should redraw immediately when the node id changes, e.g. after a drag-and-drop reorder swaps which node a row renders', () => {
    // before
    const { getByTestId, queryByTestId, rerender } = render(<TreeItemIcon node={frameNode} size={10} />);
    expect(getByTestId('generic-icon')).toBeInTheDocument();

    // action
    rerender(<TreeItemIcon node={rectangleNode} size={10} />);

    // result
    expect(getByTestId('shape-icon')).toBeInTheDocument();
    expect(queryByTestId('generic-icon')).not.toBeInTheDocument();
  });

  it('should keep showing the previous shape and only redraw 1 second after the same node’s geometry changes', () => {
    // mock
    vi.useFakeTimers();

    // before
    const { getByTestId, rerender } = render(<TreeItemIcon node={rectangleNode} size={10} />);
    const initialD = getByTestId('shape-icon').getAttribute('data-d');

    // action
    rerender(<TreeItemIcon node={{ ...rectangleNode, width: 40 }} size={10} />);

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
