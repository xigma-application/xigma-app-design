// types
import { SizingMode } from 'types/design/enums';
import { TSizeLabelSizingModes } from './types';

const SIZING_MODE_LABEL: Partial<Record<SizingMode, string>> = {
  [SizingMode.fill]: 'Fill',
  [SizingMode.hug]: 'Hug',
};

const getDimensionText = (value: number, mode?: SizingMode): string => {
  const roundedValue = Math.round(value);
  const label = mode ? SIZING_MODE_LABEL[mode] : undefined;

  return label ? `${roundedValue} ${label}` : `${roundedValue}`;
};

export const getSizeLabelText = (width: number, height: number, sizingModes?: TSizeLabelSizingModes): string =>
  `${getDimensionText(width, sizingModes?.width)} x ${getDimensionText(height, sizingModes?.height)}`;
