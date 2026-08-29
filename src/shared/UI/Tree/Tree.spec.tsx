import { fireEvent, render, screen } from '@testing-library/react';

// components
import Tree from './Tree';

// utils
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

describe('Tree', () => {
  beforeEach(() => {
    stubVirtualizerViewport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render one row per count via renderRow', () => {
    // before
    render(<Tree count={2} height={100} renderRow={(index) => <span>Row {index}</span>} rowHeight={32} />);

    // result
    expect(screen.getByText('Row 0')).toBeInTheDocument();
    expect(screen.getByText('Row 1')).toBeInTheDocument();
  });

  it('should render at the given height', () => {
    // before
    const { container } = render(<Tree count={1} height={123} renderRow={() => <span>Row</span>} rowHeight={32} />);

    // result
    expect((container.firstChild as HTMLElement).style.height).toBe('123px');
  });

  it('should call onDeselectAll when clicking the empty area, not a row', () => {
    // before
    const onDeselectAll = vi.fn();
    render(<Tree count={1} height={200} onDeselectAll={onDeselectAll} renderRow={() => <span>Row</span>} rowHeight={32} />);

    // action — click the row's own content, which should not bubble into a deselect
    fireEvent.click(screen.getByText('Row'));

    // result
    expect(onDeselectAll).not.toHaveBeenCalled();
  });

  it('should call onDeselectAll when the empty scroll area itself is clicked', () => {
    // before
    const onDeselectAll = vi.fn();
    const { container } = render(<Tree count={1} height={200} onDeselectAll={onDeselectAll} renderRow={() => <span>Row</span>} rowHeight={32} />);
    const rowsContainer = container.querySelector('[class*="Tree__rows"]')!;

    // action
    fireEvent.click(rowsContainer);

    // result
    expect(onDeselectAll).toHaveBeenCalledTimes(1);
  });
});
