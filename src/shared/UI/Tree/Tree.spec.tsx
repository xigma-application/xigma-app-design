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
    render(<Tree count={2} renderRow={(index) => <span>Row {index}</span>} rowHeight={32} />);

    // result
    expect(screen.getByText('Row 0')).toBeInTheDocument();
    expect(screen.getByText('Row 1')).toBeInTheDocument();
  });

  it('should call onDeselectAll when clicking the empty area, not a row', () => {
    // before
    const onDeselectAll = vi.fn();
    render(<Tree count={1} onDeselectAll={onDeselectAll} renderRow={() => <span>Row</span>} rowHeight={32} />);

    // action — click the row's own content, which should not bubble into a deselect
    fireEvent.click(screen.getByText('Row'));

    // result
    expect(onDeselectAll).not.toHaveBeenCalled();
  });

  it('should call onDeselectAll when the empty scroll area itself is clicked', () => {
    // before
    const onDeselectAll = vi.fn();
    const { container } = render(<Tree count={1} onDeselectAll={onDeselectAll} renderRow={() => <span>Row</span>} rowHeight={32} />);
    const rowsContainer = container.querySelector('[class*="Tree__rows"]')!;

    // action
    fireEvent.click(rowsContainer);

    // result
    expect(onDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('should show only a drop indicator while dragging, with the dragged row staying in place, then call onReorder with the mapped index on drop', () => {
    // mock
    const onReorder = vi.fn();

    // before
    render(<Tree count={3} onReorder={onReorder} renderRow={(index) => <span>Row {index}</span>} rowHeight={32} />);
    const rowZero = screen.getByText('Row 0').parentElement!;
    const initialTransform = (rowZero as HTMLElement).style.transform;

    // action
    fireEvent.mouseDown(rowZero, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 80 });

    // result
    expect(document.querySelector('[class*="dropIndicator"]')).toBeInTheDocument();
    expect((rowZero as HTMLElement).style.transform).toBe(initialTransform);
    expect(document.querySelector('[class*="viewport--dragging"]')).toBeInTheDocument();

    // action
    fireEvent.mouseUp(document);

    // result
    expect(onReorder).toHaveBeenCalledWith(0, 2);
    expect(document.querySelector('[class*="dropIndicator"]')).not.toBeInTheDocument();
    expect(document.querySelector('[class*="viewport--dragging"]')).not.toBeInTheDocument();
  });

  it('should not wire row dragging when onReorder is not provided', () => {
    // before
    render(<Tree count={2} renderRow={(index) => <span>Row {index}</span>} rowHeight={32} />);
    const rowZero = screen.getByText('Row 0').parentElement!;

    // action
    fireEvent.mouseDown(rowZero, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 80 });

    // result
    expect(document.querySelector('[class*="dropIndicator"]')).not.toBeInTheDocument();
  });
});
