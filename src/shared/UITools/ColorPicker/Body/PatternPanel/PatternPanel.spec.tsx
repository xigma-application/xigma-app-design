import { fireEvent, render, screen } from '@testing-library/react';

// components
import PatternPanel from './PatternPanel';
import { TooltipProvider } from 'shared';

// others
import { DEFAULT_PATTERN_PANEL_STATE } from './constants';

// types
import { TUsePatternPanelResult } from './hooks/usePatternPanel';
import { TUsePatternSourcePickingResult } from '../../hooks/usePatternSourcePicking';

const buildPatternPanel = (overrides: Partial<TUsePatternPanelResult> = {}): TUsePatternPanelResult => ({
  ...DEFAULT_PATTERN_PANEL_STATE,
  reset: vi.fn(),
  setAlignmentIndex: vi.fn(),
  setDirection: vi.fn(),
  setOffsetX: vi.fn(),
  setOffsetY: vi.fn(),
  setScale: vi.fn(),
  setSpacingX: vi.fn(),
  setSpacingY: vi.fn(),
  setTileType: vi.fn(),
  ...overrides,
});

const buildPatternSourcePicking = (overrides: Partial<TUsePatternSourcePickingResult> = {}): TUsePatternSourcePickingResult => ({
  close: vi.fn(),
  isActive: false,
  open: vi.fn(),
  ...overrides,
});

const renderPatternPanel = (
  patternPanel: TUsePatternPanelResult = buildPatternPanel(),
  patternSourcePicking: TUsePatternSourcePickingResult = buildPatternSourcePicking(),
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PatternPanel patternPanel={patternPanel} patternSourcePicking={patternSourcePicking} />
    </TooltipProvider>,
  );

describe('PatternPanel behaviors', () => {
  it('should show the "Select source..." button, the tile type toggle, and the scale/spacing/alignment controls', () => {
    // before
    renderPatternPanel();

    // result
    expect(screen.getByRole('button', { name: 'Select source...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rectangular' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hexagonal' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('100%')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('0%')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Alignment point/ })).toHaveLength(9);
  });

  it('should reflect the given patternPanel state — tile type and alignment point', () => {
    // before
    renderPatternPanel(buildPatternPanel({ alignmentIndex: 4, tileType: 'hexagonal' }));

    // result
    expect(screen.getByRole('button', { name: 'Hexagonal' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Rectangular' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Alignment point 5' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call setTileType when Hexagonal is clicked', () => {
    // mock
    const setTileType = vi.fn();

    // before
    renderPatternPanel(buildPatternPanel({ setTileType }));

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Hexagonal' }));

    // result
    expect(setTileType).toHaveBeenCalledWith('hexagonal');
  });

  it('should call setAlignmentIndex when a different alignment point is clicked', () => {
    // mock
    const setAlignmentIndex = vi.fn();

    // before
    renderPatternPanel(buildPatternPanel({ setAlignmentIndex }));

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Alignment point 5' }));

    // result
    expect(setAlignmentIndex).toHaveBeenCalledWith(4);
  });
});
