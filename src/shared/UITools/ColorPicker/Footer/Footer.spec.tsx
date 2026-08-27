import { fireEvent, render } from '@testing-library/react';

// components
import Footer from './Footer';

const presets = [
  { alpha: 100, hex: '#ff0000' },
  { alpha: 50, hex: '#00ff00' },
];

describe('Footer snapshots', () => {
  it('should render Footer', () => {
    // before
    const { asFragment } = render(<Footer onSelectPreset={vi.fn()} presets={presets} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Footer behaviors', () => {
  it('should call onSelectPreset with the clicked swatch hex and alpha', () => {
    // mock
    const onSelectPreset = vi.fn();

    // before
    const { container } = render(<Footer onSelectPreset={onSelectPreset} presets={presets} />);

    // find
    const swatch = container.querySelectorAll('[class*="Footer__colors"] > div')[1];

    // action
    fireEvent.click(swatch);

    // result
    expect(onSelectPreset).toHaveBeenCalledWith({ alpha: 50, hex: '#00ff00' });
  });
});
