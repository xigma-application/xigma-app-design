import { fireEvent, render } from '@testing-library/react';

// components
import CellsInput from './CellsInput';
import { TooltipProvider } from 'shared';

// others
import { PICKER_COLUMNS, PICKER_ROWS } from './constants';

const renderCellsInput = (props: Partial<Parameters<typeof CellsInput>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <CellsInput close={vi.fn()} columns="2" onClickCell={vi.fn()} rows="2" {...props} />
    </TooltipProvider>,
  );

const cells = (container: HTMLElement): NodeListOf<Element> => container.querySelectorAll('[class*="CellsInput__cell"]');

describe('CellsInput', () => {
  it('should render a 12 x 8 matrix', () => {
    const { container } = renderCellsInput();

    expect(cells(container)).toHaveLength(PICKER_COLUMNS * PICKER_ROWS);
  });

  it('should mark every cell inside the current size as selected', () => {
    const { container } = renderCellsInput({ columns: '2', rows: '2' });

    expect(container.querySelectorAll('[class*="CellsInput__cell--selected"]')).toHaveLength(4);
  });

  it('should highlight the hovered region and commit it on click', () => {
    const close = vi.fn();
    const onClickCell = vi.fn();
    const { container } = renderCellsInput({ close, onClickCell });
    const target = container.querySelector('[data-value="3.2"]') as HTMLElement;

    fireEvent.mouseMove(target);

    expect(container.querySelectorAll('[class*="CellsInput__cell--active"]')).toHaveLength(6);

    fireEvent.click(target);

    expect(onClickCell).toHaveBeenCalledWith({ columns: 3, rows: 2 });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('should mark no cell as selected when the counts are not numbers', () => {
    const { container } = renderCellsInput({ columns: '', rows: '' });

    expect(container.querySelectorAll('[class*="CellsInput__cell--selected"]')).toHaveLength(0);
  });

  it('should clear the highlight on mouse leave', () => {
    const { container } = renderCellsInput();
    const target = container.querySelector('[data-value="3.2"]') as HTMLElement;
    const grid = container.querySelector('[class*="CellsInput"]') as HTMLElement;

    fireEvent.mouseMove(target);
    fireEvent.mouseLeave(grid);

    expect(container.querySelectorAll('[class*="CellsInput__cell--active"]')).toHaveLength(0);
  });
});
