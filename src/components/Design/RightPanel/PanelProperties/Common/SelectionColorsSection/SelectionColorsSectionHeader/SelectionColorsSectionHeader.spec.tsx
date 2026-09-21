import { fireEvent, render, screen } from '@testing-library/react';

// components
import SelectionColorsSectionHeader from './SelectionColorsSectionHeader';

// types
import { TSelectionColorGroup } from '../types';

const RED_GROUP: TSelectionColorGroup = {
  key: 'a:fills:0',
  occurrences: [{ index: 0, nodeId: 'a', property: 'fills' }],
  paint: { color: '#ff0000', opacity: 100, type: 'solid' },
  signature: 'red',
};

describe('SelectionColorsSectionHeader', () => {
  it('should render the label regardless of expanded state', () => {
    // before
    render(<SelectionColorsSectionHeader groups={[]} isExpanded={false} onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />);

    // result
    expect(screen.getByText('Selection colors')).toBeInTheDocument();
  });

  it('should rotate the chevron via a class only once expanded', () => {
    // before
    const { container: collapsedContainer } = render(
      <SelectionColorsSectionHeader groups={[]} isExpanded={false} onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />,
    );
    const collapsedChevron = collapsedContainer.querySelector('[class*="__chevron"]');

    const { container: expandedContainer } = render(
      <SelectionColorsSectionHeader groups={[]} isExpanded onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />,
    );
    const expandedChevron = expandedContainer.querySelector('[class*="__chevron"]');

    // result
    expect(collapsedChevron?.getAttribute('class')).not.toMatch(/--expanded/);
    expect(expandedChevron?.getAttribute('class')).toMatch(/--expanded/);
  });

  it('should show the color preview only while collapsed', () => {
    // before
    const { container: collapsedContainer } = render(
      <SelectionColorsSectionHeader groups={[RED_GROUP]} isExpanded={false} onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />,
    );
    const { container: expandedContainer } = render(
      <SelectionColorsSectionHeader groups={[RED_GROUP]} isExpanded onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />,
    );

    // result
    expect(collapsedContainer.querySelector('[class*="SelectionColorPreview"]')).toBeInTheDocument();
    expect(expandedContainer.querySelector('[class*="SelectionColorPreview"]')).not.toBeInTheDocument();
  });

  it('should mute the label while collapsed and show it at full brightness once expanded', () => {
    // before
    const { container: collapsedContainer } = render(
      <SelectionColorsSectionHeader groups={[]} isExpanded={false} onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />,
    );
    const { container: expandedContainer } = render(
      <SelectionColorsSectionHeader groups={[]} isExpanded onToggleClick={vi.fn()} onToggleKeyDown={vi.fn()} />,
    );

    // result
    expect(collapsedContainer.querySelector('[class*="SelectionColorsSectionHeader"]')?.className).toMatch(/--muted/);
    expect(expandedContainer.querySelector('[class*="SelectionColorsSectionHeader"]')?.className).not.toMatch(/--muted/);
  });

  it('should call onToggleClick when clicked', () => {
    // mock
    const onToggleClick = vi.fn();

    // before
    render(<SelectionColorsSectionHeader groups={[]} isExpanded={false} onToggleClick={onToggleClick} onToggleKeyDown={vi.fn()} />);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onToggleClick).toHaveBeenCalled();
  });

  it('should call onToggleKeyDown on a key press', () => {
    // mock
    const onToggleKeyDown = vi.fn();

    // before
    render(<SelectionColorsSectionHeader groups={[]} isExpanded={false} onToggleClick={vi.fn()} onToggleKeyDown={onToggleKeyDown} />);

    // action
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    // result
    expect(onToggleKeyDown).toHaveBeenCalled();
  });
});
