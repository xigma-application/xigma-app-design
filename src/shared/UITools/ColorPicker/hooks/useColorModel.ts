import { useEffect, useState } from 'react';

// types
import { TColorPickerValue, THsv } from '../types';

// utils
import { hexToHsv } from '../utils/hexToHsv';
import { hsvToHex } from '../utils/hsvToHex';
import { normalizeHex } from '../utils/normalizeHex';

export type TUseColorModelResult = {
  hex: string;
  hsv: THsv;
  setAlpha: TFunc<[number]>;
  setHex: TFunc<[string]>;
  setHsv: TFunc<[Partial<THsv>]>;
  setPreset: TFunc<[TColorPickerValue]>;
};

export const useColorModel = (value: TColorPickerValue, onChange: TFunc<[TColorPickerValue]>): TUseColorModelResult => {
  const [hsv, setHsvState] = useState<THsv>(() => hexToHsv(value.hex));

  useEffect(() => {
    setHsvState((prevHsv) => (hsvToHex(prevHsv).toLowerCase() === value.hex.toLowerCase() ? prevHsv : hexToHsv(value.hex)));
  }, [value.hex]);

  const setHsv = (partialHsv: Partial<THsv>): void => {
    const nextHsv = { ...hsv, ...partialHsv };

    setHsvState(nextHsv);
    onChange({ alpha: value.alpha, hex: hsvToHex(nextHsv) });
  };

  const setHex = (hex: string): void => {
    const normalizedHex = normalizeHex(hex);

    setHsvState(hexToHsv(normalizedHex));
    onChange({ alpha: value.alpha, hex: normalizedHex });
  };

  const setAlpha = (alpha: number): void => {
    onChange({ alpha, hex: value.hex });
  };

  const setPreset = (preset: TColorPickerValue): void => {
    const normalizedHex = normalizeHex(preset.hex);

    setHsvState(hexToHsv(normalizedHex));
    onChange({ alpha: preset.alpha, hex: normalizedHex });
  };

  return { hex: hsvToHex(hsv), hsv, setAlpha, setHex, setHsv, setPreset };
};
