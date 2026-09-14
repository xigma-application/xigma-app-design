import { fireEvent, render, screen } from '@testing-library/react';

// components
import PatternSettings from './PatternSettings';
import { TooltipProvider } from 'shared';

// others
import { DEFAULT_PATTERN_PANEL_STATE } from '../constants';

// types
import { TUsePatternPanelResult } from '../hooks/usePatternPanel';

const buildPatternPanel = (overrides: Partial<TUsePatternPanelResult> = {}): TUsePatternPanelResult => ({
  ...DEFAULT_PATTERN_PANEL_STATE,
  reset: vi.fn(),
  setAlignmentIndex: vi.fn(),
  setDirection: vi.fn(),
  setScale: vi.fn(),
  setSpacingX: vi.fn(),
  setSpacingY: vi.fn(),
  setTileType: vi.fn(),
  ...overrides,
});

const renderPatternSettings = (patternPanel: TUsePatternPanelResult = buildPatternPanel()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PatternSettings patternPanel={patternPanel} />
    </TooltipProvider>,
  );

describe('PatternSettings behaviors', () => {
  it('should show the tile type toggle and the scale/spacing/alignment controls', () => {
    // before
    renderPatternSettings();

    // result
    expect(screen.getByRole('button', { name: 'Rectangular' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hexagonal' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('100%')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('0%')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Alignment point/ })).toHaveLength(9);
  });

  it('should reflect the given patternPanel state — tile type and alignment point', () => {
    // before
    renderPatternSettings(buildPatternPanel({ alignmentIndex: 4, tileType: 'hexagonal' }));

    // result
    expect(screen.getByRole('button', { name: 'Hexagonal' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Rectangular' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Alignment point 5' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call setTileType when Hexagonal is clicked', () => {
    // mock
    const setTileType = vi.fn();

    // before
    renderPatternSettings(buildPatternPanel({ setTileType }));

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Hexagonal' }));

    // result
    expect(setTileType).toHaveBeenCalledWith('hexagonal');
  });

  it('should call setAlignmentIndex when a different alignment point is clicked', () => {
    // mock
    const setAlignmentIndex = vi.fn();

    // before
    renderPatternSettings(buildPatternPanel({ setAlignmentIndex }));

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Alignment point 5' }));

    // result
    expect(setAlignmentIndex).toHaveBeenCalledWith(4);
  });

  it('should not show the Direction row for the Rectangular tile type', () => {
    // before
    renderPatternSettings(buildPatternPanel({ tileType: 'rectangular' }));

    // result
    expect(screen.queryByRole('button', { name: 'Horizontal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Vertical' })).not.toBeInTheDocument();
  });

  it('should show the Direction row for the Hexagonal tile type', () => {
    // before
    renderPatternSettings(buildPatternPanel({ tileType: 'hexagonal' }));

    // result
    expect(screen.getByRole('button', { name: 'Horizontal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vertical' })).toBeInTheDocument();
  });

  it('should call setDirection when Vertical is clicked', () => {
    // mock
    const setDirection = vi.fn();

    // before
    renderPatternSettings(buildPatternPanel({ setDirection, tileType: 'hexagonal' }));

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Vertical' }));

    // result
    expect(setDirection).toHaveBeenCalledWith('vertical');
  });
});
