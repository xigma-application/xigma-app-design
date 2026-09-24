// types
import { TEffect } from 'types/design/types';

// utils
import { getEffectPanelLayout, TEffectPanelLayout } from './getEffectPanelLayout';

export const getSharedEffectPanelLayout = (effects: TEffect[]): TEffectPanelLayout => {
  const layouts = effects.map(getEffectPanelLayout);
  const [firstLayout] = layouts;

  return {
    fields: firstLayout.fields.filter(({ key }) => layouts.every((layout) => layout.fields.some((field) => field.key === key))),
    hasBlendMode: layouts.every((layout) => layout.hasBlendMode),
    hasBlurModeToggle: layouts.every((layout) => layout.hasBlurModeToggle),
    hasClipToShape: layouts.every((layout) => layout.hasClipToShape),
    hasColor: layouts.every((layout) => layout.hasColor),
    hasGlassControls: layouts.every((layout) => layout.hasGlassControls),
    hasNoiseTypeToggle: layouts.every((layout) => layout.hasNoiseTypeToggle),
    hasSecondaryColor: layouts.every((layout) => layout.hasSecondaryColor),
  };
};
