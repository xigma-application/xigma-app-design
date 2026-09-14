import { TFunction } from 'i18next';

const ALIGNMENT_POINT_KEYS = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];

export const getAlignmentPointTooltip = (index: number, t: TFunction): string =>
  t(`colorPicker.pattern.alignmentPoint.${ALIGNMENT_POINT_KEYS[index]}`);
