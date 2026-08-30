import { fireEvent, render, screen } from '@testing-library/react';

// components
import TreeItemToggle from './TreeItemToggle';

describe('TreeItemToggle', () => {
  it('should not render a button when not expandable', () => {
    // before
    render(<TreeItemToggle isExpandable={false} isExpanded={false} onToggleExpand={vi.fn()} />);

    // result
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render a button labeled "Expand layer" when collapsed', () => {
    // before
    render(<TreeItemToggle isExpandable isExpanded={false} onToggleExpand={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'Expand layer' })).toBeInTheDocument();
  });

  it('should render a button labeled "Collapse layer" when expanded', () => {
    // before
    render(<TreeItemToggle isExpandable isExpanded onToggleExpand={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'Collapse layer' })).toBeInTheDocument();
  });

  it('should call onToggleExpand when clicked, without letting the click bubble up', () => {
    // mock
    const onToggleExpand = vi.fn();
    const onParentClick = vi.fn();

    // before
    render(
      <div onClick={onParentClick}>
        <TreeItemToggle isExpandable isExpanded={false} onToggleExpand={onToggleExpand} />
      </div>,
    );

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));

    // result
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
