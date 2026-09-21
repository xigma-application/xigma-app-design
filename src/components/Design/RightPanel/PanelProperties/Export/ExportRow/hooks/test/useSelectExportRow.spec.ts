import { MouseEvent } from 'react';

// hooks
import { useSelectExportRow } from '../useSelectExportRow';

const mouseEvent = (target: HTMLElement): MouseEvent<HTMLDivElement> => ({ target }) as unknown as MouseEvent<HTMLDivElement>;

describe('useSelectExportRow', () => {
  it('should call onSelect when the click target is not inside a no-select element', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const handleClick = useSelectExportRow(onSelect);

    // action
    handleClick(mouseEvent(document.createElement('div')));

    // result
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should not call onSelect when the click target is inside a no-select element', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const handleClick = useSelectExportRow(onSelect);
    const target = document.createElement('button');

    target.setAttribute('data-no-select', '');

    // action
    handleClick(mouseEvent(target));

    // result
    expect(onSelect).not.toHaveBeenCalled();
  });
});
