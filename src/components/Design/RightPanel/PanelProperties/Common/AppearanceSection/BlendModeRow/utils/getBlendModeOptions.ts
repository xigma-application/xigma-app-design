// types
import { BLEND_MODE_GROUPS } from 'types/design/constants';
import { BlendMode } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getBlendModeOptions = (getLabel: (blendMode: BlendMode) => string): TDropdownOption<BlendMode>[] =>
  BLEND_MODE_GROUPS.flat().map((blendMode) => ({ label: getLabel(blendMode), value: blendMode }));
