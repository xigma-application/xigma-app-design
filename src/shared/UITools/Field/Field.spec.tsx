import { fireEvent, render, screen } from '@testing-library/react';

// components
import Checkbox from '../Checkbox/Checkbox';
import Field from './Field';
import TextField from '../TextField/TextField';

describe('Field behaviors', () => {
  it('should render the label next to the wrapped component', () => {
    // before
    render(<Field Component={TextField} defaultValue="abc" label="Suffix" />);

    // result
    expect(screen.getByText('Suffix')).toBeInTheDocument();
    expect(screen.getByDisplayValue('abc')).toBeInTheDocument();
  });

  it('should not forward the label to the wrapped component', () => {
    // before
    render(<Field Component={TextField} defaultValue="abc" label="Suffix" />);

    // result
    expect(screen.getAllByText('Suffix')).toHaveLength(1);
  });

  it('should pass the props of the wrapped component through', () => {
    // mock
    const onBlur = vi.fn();

    // before
    render(<Field Component={TextField} defaultValue="abc" label="Suffix" onBlur={onBlur} />);

    // action
    fireEvent.blur(screen.getByDisplayValue('abc'));

    // result
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should apply the control width when given', () => {
    // before
    const { container } = render(<Field Component={TextField} controlWidth={100} defaultValue="abc" label="Suffix" />);

    // result
    expect(container.querySelector('[class*="Field__control"]')).toHaveStyle({ width: '100px' });
  });

  it('should keep the default control width when none is given', () => {
    // before
    const { container } = render(<Field Component={TextField} defaultValue="abc" label="Suffix" />);

    // result
    expect(container.querySelector('[class*="Field__control"]')).not.toHaveAttribute('style');
  });

  it('should hand the label to the wrapped component when labelInside is set', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { container } = render(<Field Component={Checkbox} label="Include box" labelInside onChange={onChange} value={false} />);

    // action
    fireEvent.click(screen.getByRole('checkbox'));

    // result
    expect(screen.getAllByText('Include box')).toHaveLength(1);
    expect(container.querySelector('[class*="Field__label"]')).toBeNull();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should hand a className to the wrapped component', () => {
    // before
    const { container } = render(<Field Component={TextField} className="custom" defaultValue="abc" label="Suffix" />);

    // result
    expect(container.querySelector('.custom')).not.toBeNull();
  });

  it('should hand a className to the wrapped component when labelInside is set', () => {
    // before
    const { container } = render(
      <Field Component={Checkbox} className="custom" label="Include box" labelInside onChange={vi.fn()} value={false} />,
    );

    // result
    expect(container.querySelector('.custom')).not.toBeNull();
  });

  it('should not apply the dimmed modifier by default', () => {
    // before
    const { container } = render(<Field Component={TextField} defaultValue="abc" label="Suffix" />);

    // result
    expect(container.querySelector('[class*="--dimmed"]')).toBeNull();
  });

  it('should apply the dimmed modifier when dimmed', () => {
    // before
    const { container } = render(<Field Component={TextField} defaultValue="abc" dimmed label="Suffix" />);

    // result
    expect(container.querySelector('[class*="--dimmed"]')).not.toBeNull();
  });

  it('should call onMouseEnter and onMouseLeave when the pointer crosses the row', () => {
    // mock
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();

    // before
    render(<Field Component={TextField} defaultValue="abc" label="Suffix" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />);

    // action
    fireEvent.mouseEnter(screen.getByText('Suffix').parentElement!);
    fireEvent.mouseLeave(screen.getByText('Suffix').parentElement!);

    // result
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });
});
