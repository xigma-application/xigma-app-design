import { fireEvent, render, screen } from '@testing-library/react';

// components
import EditableInputGroup from './EditableInputGroup';

const field = <span>field</span>;
const action = <button type="button">action</button>;

const getActionWrapper = (): HTMLElement => screen.getByText('action').parentElement as HTMLElement;

describe('EditableInputGroup behaviors', () => {
  it('should show only the field while editing', () => {
    // before
    render(<EditableInputGroup action={action} className="extra" field={field} isEditing />);

    // result
    expect(screen.getByText('field')).toBeInTheDocument();
    expect(screen.queryByText('action')).not.toBeInTheDocument();
  });

  it('should toggle the action open and closed on click when uncontrolled', () => {
    // before
    render(<EditableInputGroup action={action} field={field} isEditing={false} />);

    // result
    expect(getActionWrapper()).toHaveAttribute('data-state', 'closed');

    // action
    fireEvent.click(getActionWrapper());

    // result
    expect(getActionWrapper()).toHaveAttribute('data-state', 'open');
  });

  it('should follow the controlled open state and leave clicks to the owner', () => {
    // mock
    const onActionOpenChange = vi.fn();

    // before
    render(<EditableInputGroup action={action} actionOpen field={field} isEditing={false} onActionOpenChange={onActionOpenChange} />);

    // action
    fireEvent.click(getActionWrapper());

    // result
    expect(getActionWrapper()).toHaveAttribute('data-state', 'open');
    expect(onActionOpenChange).not.toHaveBeenCalled();
  });
});
