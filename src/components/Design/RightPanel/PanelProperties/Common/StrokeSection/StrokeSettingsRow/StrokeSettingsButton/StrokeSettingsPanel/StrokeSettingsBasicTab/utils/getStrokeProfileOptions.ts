// types
import { StrokeProfile } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

// utils
import { STROKE_PROFILE_ORDER } from 'constant/strokeProfile';

export const getStrokeProfileOptions = (getLabel: (profile: StrokeProfile) => string): TDropdownOption<StrokeProfile>[] =>
  STROKE_PROFILE_ORDER.map((profile) => ({ label: getLabel(profile), value: profile }));
