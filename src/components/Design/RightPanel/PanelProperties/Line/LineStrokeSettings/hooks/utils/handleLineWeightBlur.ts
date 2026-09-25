import { FocusEvent } from 'react';

// utils
import { parseStrokeWeight } from '../../../../Common/StrokeSection/StrokeSettingsRow/utils/parseStrokeWeight';

export const handleLineWeightBlur = (
  event: FocusEvent<HTMLInputElement>,
  sharedWeight: number | undefined,
  commit: TFunc<[number]>,
): void => {
  const parsed = parseStrokeWeight(event.target.value);

  if (parsed !== null && parsed !== sharedWeight) {
    commit(parsed);
  } else {
    event.target.value = event.target.defaultValue;
  }
};
