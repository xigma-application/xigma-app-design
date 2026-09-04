import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';

// components
import ColumnBackgroundAlphaField from './ColumnBackgroundAlphaField';

const renderAlphaField = (props: Partial<ComponentProps<typeof ColumnBackgroundAlphaField>> = {}): ReturnType<typeof render> =>
  render(<ColumnBackgroundAlphaField alpha={100} onCommit={vi.fn()} {...props} />);

describe('ColumnBackgroundAlphaField snapshots', () => {
  it('should render the numeric input with a percent unit', () => {
    // before
    const { asFragment } = renderAlphaField();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnBackgroundAlphaField behaviors', () => {
  it('should seed the input with the alpha rounded to a whole percent', () => {
    // before
    renderAlphaField({ alpha: 37.6 });

    // result
    expect(screen.getByDisplayValue('38')).toBeInTheDocument();
  });

  it('should commit a clamped value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    renderAlphaField({ alpha: 20, onCommit });
    const input = screen.getByDisplayValue('20');

    // action
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith(100);
  });

  it('should render the percent unit', () => {
    // before
    renderAlphaField();

    // result
    expect(screen.getByText('%')).toBeInTheDocument();
  });
});
