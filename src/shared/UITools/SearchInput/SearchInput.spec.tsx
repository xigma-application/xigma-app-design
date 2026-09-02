import { fireEvent, render, screen } from '@testing-library/react';

// components
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('should render the current value and placeholder', () => {
    // before
    render(<SearchInput onChange={vi.fn()} placeholder="Search" value="" />);

    // result
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should call onChange with the typed value', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<SearchInput onChange={onChange} value="" />);

    // action
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'undo' } });

    // result
    expect(onChange).toHaveBeenCalledWith('undo');
  });

  it('should bypass global keyboard shortcuts while focused', () => {
    // before
    render(<SearchInput onChange={vi.fn()} value="" />);

    // result
    expect(screen.getByRole('textbox').closest('[data-test-bypass-global-shortcuts]')).not.toBeNull();
  });
});
