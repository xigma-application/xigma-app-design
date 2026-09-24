// types
import { TBoxSceneNode } from 'types/design/types';
import { TRevealedMinMax } from 'store/design/types';

export const getBoundDisplayValue = (
  nodes: TBoxSceneNode[],
  bound: keyof TRevealedMinMax,
  mixedLabel: string,
): number | string | undefined => {
  const values = nodes.map((node) => node[bound]);
  return values.every((value) => value === values[0]) ? values[0] : mixedLabel;
};
