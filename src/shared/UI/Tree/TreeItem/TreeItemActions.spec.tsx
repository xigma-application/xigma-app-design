import { fireEvent, render, screen } from '@testing-library/react';

// components
import TreeItemActions from './TreeItemActions';

describe('TreeItemActions', () => {
  it('should render "Hide layer" and "Lock layer" labels when not hidden/locked', () => {
    // before
    render(
      <TreeItemActions isHidden={false} isLocked={false} onStopPropagation={vi.fn()} onToggleHidden={vi.fn()} onToggleLocked={vi.fn()} />,
    );

    // result
    expect(screen.getByRole('button', { name: 'Hide layer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lock layer' })).toBeInTheDocument();
  });

  it('should render "Show layer" and "Unlock layer" labels when hidden/locked', () => {
    // before
    render(<TreeItemActions isHidden isLocked onStopPropagation={vi.fn()} onToggleHidden={vi.fn()} onToggleLocked={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'Show layer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlock layer' })).toBeInTheDocument();
  });

  it('should call onToggleHidden when the hide/show button is clicked', () => {
    // before
    const onToggleHidden = vi.fn();
    render(
      <TreeItemActions
        isHidden={false}
        isLocked={false}
        onStopPropagation={vi.fn()}
        onToggleHidden={onToggleHidden}
        onToggleLocked={vi.fn()}
      />,
    );

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Hide layer' }));

    // result
    expect(onToggleHidden).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleLocked when the lock/unlock button is clicked', () => {
    // before
    const onToggleLocked = vi.fn();
    render(
      <TreeItemActions
        isHidden={false}
        isLocked={false}
        onStopPropagation={vi.fn()}
        onToggleHidden={vi.fn()}
        onToggleLocked={onToggleLocked}
      />,
    );

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Lock layer' }));

    // result
    expect(onToggleLocked).toHaveBeenCalledTimes(1);
  });

  it('should call onStopPropagation when the actions container is clicked', () => {
    // before
    const onStopPropagation = vi.fn();
    const { container } = render(
      <TreeItemActions
        isHidden={false}
        isLocked={false}
        onStopPropagation={onStopPropagation}
        onToggleHidden={vi.fn()}
        onToggleLocked={vi.fn()}
      />,
    );

    // action
    fireEvent.click(container.firstChild as Element);

    // result
    expect(onStopPropagation).toHaveBeenCalledTimes(1);
  });
});
