// types
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// others
import { STROKE_DYNAMIC_FREQUENCY_DEFAULT, STROKE_DYNAMIC_SMOOTHEN_DEFAULT, STROKE_DYNAMIC_WIGGLE_DEFAULT } from 'constant/strokeDynamic';

export type TStrokeDynamicValues = { frequency: number; smoothen: number; wiggle: number };

export const getStrokeDynamicValues = (
  node:
    | Pick<TFrameNode | TRectangleNode | TSectionNode, 'strokeDynamicFrequency' | 'strokeDynamicSmoothen' | 'strokeDynamicWiggle'>
    | undefined,
): TStrokeDynamicValues => ({
  frequency: node?.strokeDynamicFrequency ?? STROKE_DYNAMIC_FREQUENCY_DEFAULT,
  smoothen: node?.strokeDynamicSmoothen ?? STROKE_DYNAMIC_SMOOTHEN_DEFAULT,
  wiggle: node?.strokeDynamicWiggle ?? STROKE_DYNAMIC_WIGGLE_DEFAULT,
});
