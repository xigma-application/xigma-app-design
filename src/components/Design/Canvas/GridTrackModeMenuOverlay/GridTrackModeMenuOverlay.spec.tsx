import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import GridTrackModeMenuOverlay from './GridTrackModeMenuOverlay';

// types
import { SizingMode } from 'types/design/enums';

const useGridTrackModeMenuMock = vi.fn();

vi.mock('./hooks/useGridTrackModeMenu/useGridTrackModeMenu', () => ({
  useGridTrackModeMenu: (): unknown => useGridTrackModeMenuMock(),
}));

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const OPTIONS = [
  { icon: 'FixedWidth' as const, iconSize: 24, label: 'Fixed width (40)', value: SizingMode.fixed },
  { icon: 'AutoWidth' as const, iconSize: 24, label: 'Hug contents', value: SizingMode.hug },
  { icon: 'FillHorizontal' as const, iconSize: 24, label: 'Fill container (1fr)', value: SizingMode.fill },
];

const IDLE = { anchorRef, isOpen: false, mode: null, onOpenChange: vi.fn(), onSelectMode: vi.fn(), options: [] };

describe('GridTrackModeMenuOverlay', () => {
  it('should render no menu items while closed', () => {
    // mock
    useGridTrackModeMenuMock.mockReturnValue(IDLE);

    // before
    render(<GridTrackModeMenuOverlay />);

    // result
    expect(screen.queryByText('Fixed width (40)')).not.toBeInTheDocument();
  });

  it('should list the three sizing options, in the same order as the panel, when open', () => {
    // mock
    useGridTrackModeMenuMock.mockReturnValue({ ...IDLE, isOpen: true, mode: SizingMode.fixed, options: OPTIONS });

    // before
    render(<GridTrackModeMenuOverlay />);

    // result
    expect(screen.getByText('Fixed width (40)')).toBeInTheDocument();
    expect(screen.getByText('Hug contents')).toBeInTheDocument();
    expect(screen.getByText('Fill container (1fr)')).toBeInTheDocument();
  });

  it('should call onSelectMode with the clicked option’s mode', async () => {
    // mock
    const user = userEvent.setup();
    const onSelectMode = vi.fn();
    useGridTrackModeMenuMock.mockReturnValue({ ...IDLE, isOpen: true, mode: SizingMode.fixed, onSelectMode, options: OPTIONS });

    // before
    render(<GridTrackModeMenuOverlay />);
    await user.click(screen.getByText('Hug contents'));

    // result
    expect(onSelectMode).toHaveBeenCalledWith(SizingMode.hug);
  });
});
