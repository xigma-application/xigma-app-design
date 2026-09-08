// types
import { TFrameNode } from 'types/design/types';
import { TIconProps } from 'shared';

export type TPaddingSide = 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop';

export type TPaddingPatch = Partial<Pick<TFrameNode, TPaddingSide>>;

export type TPaddingField = {
  e2eValue: string;
  iconName: TIconProps['name'];
  labelKey: string;
  onCommit: (raw: string) => void;
  onScrub: (next: number) => void;
  scrubValue: number;
  value: number | string;
};

export type TUseColumnPaddingResult = {
  individualFields: TPaddingField[];
  isIndividual: boolean;
  isVisible: boolean;
  mergedFields: TPaddingField[];
  toggleIndividual: () => void;
};
