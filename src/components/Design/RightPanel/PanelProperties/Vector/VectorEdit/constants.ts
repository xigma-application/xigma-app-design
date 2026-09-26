// @xigma
import { TIconProps } from '@xigma/components';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { TVertexHandleMode } from 'types/design/types';

export const translationNameSpace = `${parentNameSpace}.edit`;

export type TMirroringOption = { icon: TIconProps['name']; labelKey: string; value: TVertexHandleMode };

export const MIRRORING_OPTIONS: TMirroringOption[] = [
  { icon: 'MirrorNone', labelKey: `${translationNameSpace}.mirroring.none`, value: 'corner' },
  { icon: 'MirrorAngle', labelKey: `${translationNameSpace}.mirroring.angle`, value: 'smooth' },
  { icon: 'MirrorAngleLength', labelKey: `${translationNameSpace}.mirroring.angleAndLength`, value: 'symmetric' },
];
