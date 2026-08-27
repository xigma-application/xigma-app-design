import { fireEvent, render } from '@testing-library/react';

// types
import { ColorFormat } from '../../enums';

// utils
import { renderValueField } from '../renderValueField';
import { hslToRgb } from '../../../../../utils/hslToRgb';
import { rgbToHex } from 'utils/color/rgbToHex';
import { rgbToHsl } from '../../../../../utils/rgbToHsl';

const colorModel = {
  hex: '#ff0000',
  hsv: { h: 0, s: 100, v: 100 },
  setAlpha: vi.fn(),
  setHex: vi.fn(),
  setHsv: vi.fn(),
  setPreset: vi.fn(),
};
const rgb = { b: 0, g: 0, r: 255 };

describe('renderValueField', () => {
  it('should render a HexField for the hex format', () => {
    // before
    const { container } = render(<>{renderValueField(ColorFormat.hex, 100, colorModel, rgb)}</>);

    // result
    expect(container.querySelector('[class*="HexField"]')).toBeInTheDocument();
  });

  it('should render ChannelFields for the rgb format', () => {
    // before
    const { container } = render(<>{renderValueField(ColorFormat.rgb, 100, colorModel, rgb)}</>);

    // result
    expect(container.querySelectorAll('input')).toHaveLength(3);
  });

  it('should commit an edited rgb channel as a hex value', () => {
    // mock
    const setHex = vi.fn();

    // before
    const { container } = render(<>{renderValueField(ColorFormat.rgb, 100, { ...colorModel, setHex }, rgb)}</>);
    const [rInput] = container.querySelectorAll('input');

    // action
    fireEvent.change(rInput, { target: { value: '100' } });
    fireEvent.blur(rInput);

    // result
    expect(setHex).toHaveBeenCalledWith(rgbToHex({ b: 0, g: 0, r: 100 }));
  });

  it('should render a CssField for the css format', () => {
    // before
    const { container } = render(<>{renderValueField(ColorFormat.css, 100, colorModel, rgb)}</>);

    // result
    expect(container.querySelector('[class*="CssField"]')).toBeInTheDocument();
  });

  it('should render ChannelFields for the hsl format', () => {
    // before
    const { container } = render(<>{renderValueField(ColorFormat.hsl, 100, colorModel, rgb)}</>);

    // result
    expect(container.querySelectorAll('input')).toHaveLength(3);
  });

  it('should commit an edited hsl channel as a hex value', () => {
    // mock
    const setHex = vi.fn();

    // before
    const { container } = render(<>{renderValueField(ColorFormat.hsl, 100, { ...colorModel, setHex }, rgb)}</>);
    const [hInput, sInput, lInput] = container.querySelectorAll('input');
    const hsl = rgbToHsl(rgb);

    // action
    fireEvent.change(hInput, { target: { value: '180' } });
    fireEvent.blur(hInput);

    // result
    expect(setHex).toHaveBeenCalledWith(rgbToHex(hslToRgb({ h: 180, l: hsl.l, s: hsl.s })));

    // action
    fireEvent.change(sInput, { target: { value: '50' } });
    fireEvent.blur(sInput);
    fireEvent.change(lInput, { target: { value: '50' } });
    fireEvent.blur(lInput);

    // result
    expect(setHex).toHaveBeenCalledTimes(3);
  });

  it('should render ChannelFields for the hsb format', () => {
    // before
    const { container } = render(<>{renderValueField(ColorFormat.hsb, 100, colorModel, rgb)}</>);

    // result
    expect(container.querySelectorAll('input')).toHaveLength(3);
  });

  it('should commit an edited hsb channel as an hsv value', () => {
    // mock
    const setHsv = vi.fn();

    // before
    const { container } = render(<>{renderValueField(ColorFormat.hsb, 100, { ...colorModel, setHsv }, rgb)}</>);
    const [hInput] = container.querySelectorAll('input');

    // action
    fireEvent.change(hInput, { target: { value: '180' } });
    fireEvent.blur(hInput);

    // result
    expect(setHsv).toHaveBeenCalledWith({ h: 180, s: 100, v: 100 });
  });
});
