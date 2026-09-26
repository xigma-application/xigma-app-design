// types
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';

export type TBakedVectorRotationChanges = ReturnType<typeof bakeVectorNodeRotation> & Pick<TVectorNode, 'fillRotation'>;

export const getBakedVectorRotationChanges = (node: TVectorNode): TBakedVectorRotationChanges => ({
  ...bakeVectorNodeRotation(node),
  fillRotation: (node.fillRotation ?? 0) + node.rotation,
});
