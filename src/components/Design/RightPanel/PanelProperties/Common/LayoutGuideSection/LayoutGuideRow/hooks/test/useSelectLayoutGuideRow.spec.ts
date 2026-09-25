import { MouseEvent } from 'react';

// hooks
import { useSelectLayoutGuideRow } from '../useSelectLayoutGuideRow';

const clickOn = (element: HTMLElement): MouseEvent<HTMLDivElement> => ({ target: element }) as unknown as MouseEvent<HTMLDivElement>;

describe('useSelectLayoutGuideRow', () => {
  it('should select the row on a plain click', () => {
    // mock
    const onSelect = vi.fn();

    // before
    useSelectLayoutGuideRow(onSelect)(clickOn(document.createElement('span')));

    // result
    expect(onSelect).toHaveBeenCalled();
  });

  it('should ignore a click inside a no-select area', () => {
    // mock
    const onSelect = vi.fn();
    const wrapper = document.createElement('div');
    const button = document.createElement('button');
    wrapper.setAttribute('data-no-select', '');
    wrapper.appendChild(button);

    // before
    useSelectLayoutGuideRow(onSelect)(clickOn(button));

    // result
    expect(onSelect).not.toHaveBeenCalled();
  });
});
