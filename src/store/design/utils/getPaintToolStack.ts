// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

export const getPaintToolStack = (paint: TPaint, paintFill: TPaint[] | null | undefined): TPaint[] => {
  const blendMode = paint.blendMode ?? BlendMode.normal;

  switch (true) {
    case !paintFill:
      return [paint];
    case blendMode === BlendMode.normal:
      return paintFill!;
    default:
      return paintFill!.map((layer) => ({ ...layer, blendMode }));
  }
};
