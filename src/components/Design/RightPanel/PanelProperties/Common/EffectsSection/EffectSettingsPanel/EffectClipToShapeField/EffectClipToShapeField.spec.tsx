import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectClipToShapeField from './EffectClipToShapeField';

describe('EffectClipToShapeField behaviors', () => {
  it('should show the clip to shape checkbox and report a toggle', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EffectClipToShapeField onChange={onChange} value={false} />);

    // action
    fireEvent.click(screen.getByRole('checkbox'));

    // result
    expect(screen.getByText('Clip to shape')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
