import { render, screen } from '@testing-library/react';

// components
import EffectGlassLight from './EffectGlassLight';

const drag = { onPointerDown: vi.fn(), onPointerMove: vi.fn(), onPointerUp: vi.fn(), ref: { current: null } };

vi.mock('./hooks/useGlassLightDrag/useGlassLightDrag', () => ({ useGlassLightDrag: (): unknown => drag }));

describe('EffectGlassLight behaviors', () => {
  it('should render a light direction slider at the angle', () => {
    // before
    render(<EffectGlassLight angle={-45} intensity={50} onChange={vi.fn()} />);

    // find
    const slider = screen.getByRole('slider');

    // result
    expect(slider).toHaveAttribute('aria-valuenow', '-45');
    expect(slider).toHaveAttribute('aria-label', 'Effect light direction');
  });
});
