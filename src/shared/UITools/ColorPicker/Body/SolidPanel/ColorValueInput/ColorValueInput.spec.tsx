import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColorValueInput from './ColorValueInput';

const colorModel = {
  hex: '#ff0000',
  hsv: { h: 0, s: 100, v: 100 },
  setAlpha: vi.fn(),
  setHex: vi.fn(),
  setHsv: vi.fn(),
  setPreset: vi.fn(),
};

describe('ColorValueInput snapshots', () => {
  it('should render ColorValueInput defaulting to the hex format', () => {
    // before
    const { asFragment } = render(<ColorValueInput alpha={100} colorModel={colorModel} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColorValueInput behaviors', () => {
  it('should switch to the rgb format when chosen from the format dropdown', () => {
    // before
    render(<ColorValueInput alpha={100} colorModel={colorModel} />);

    // action
    fireEvent.click(screen.getByText('Hex'));
    fireEvent.click(screen.getByText('RGB'));

    // result — 3 rgb channel fields + the alpha field
    expect(screen.getAllByRole('spinbutton')).toHaveLength(4);
  });

  it('should hide the alpha field for the css format, since alpha is already in the rgba() string', () => {
    // before
    const { container } = render(<ColorValueInput alpha={100} colorModel={colorModel} />);

    // action
    fireEvent.click(screen.getByText('Hex'));
    fireEvent.click(screen.getByText('CSS'));

    // result
    expect(container.querySelector('[class*="AlphaField"]')).not.toBeInTheDocument();
  });

  it('should call colorModel.setAlpha when committing the alpha field', () => {
    // mock
    const setAlpha = vi.fn();

    // before
    const { container } = render(<ColorValueInput alpha={0} colorModel={{ ...colorModel, setAlpha }} />);
    const alphaInput = container.querySelector('[class*="AlphaField"] input') as HTMLInputElement;

    // action
    fireEvent.change(alphaInput, { target: { value: '60' } });
    fireEvent.blur(alphaInput);

    // result
    expect(setAlpha).toHaveBeenCalledWith(60);
  });
});
