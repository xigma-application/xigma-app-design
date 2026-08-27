import { render } from '@testing-library/react';

// components
import Body from './Body';
import { TooltipProvider } from 'shared';

const colorModel = {
  hex: '#ff0000',
  hsv: { h: 0, s: 100, v: 100 },
  setAlpha: vi.fn(),
  setHex: vi.fn(),
  setHsv: vi.fn(),
  setPreset: vi.fn(),
};

describe('Body snapshots', () => {
  it('should render Body with the solid panel', () => {
    // before
    const { asFragment } = render(
      <TooltipProvider>
        <Body alpha={100} colorModel={colorModel} />
      </TooltipProvider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
