// types
import { TIconProps } from 'shared';

export type TCornerRadiusKey = 'cornerRadiusBottomLeft' | 'cornerRadiusBottomRight' | 'cornerRadiusTopLeft' | 'cornerRadiusTopRight';

export type TCornerRadiusField = {
  ariaLabel: string;
  e2eValue: string;
  iconName: TIconProps['name'];
  onCommit: (raw: string) => void;
  onScrub: (next: number) => void;
  tooltip: string;
  value: number;
};

export type TUseCornerRadiusResult = {
  individualFields: TCornerRadiusField[];
  isIndividual: boolean;
  isMixed: boolean;
  mergedValue: number;
  onMergedCommit: (raw: string) => void;
  onMergedScrub: (next: number) => void;
  toggleIndividual: () => void;
};
