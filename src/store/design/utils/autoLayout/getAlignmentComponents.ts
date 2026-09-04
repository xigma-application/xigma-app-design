// types
import { AlignmentLayout } from 'types/design/enums';

export type TAxisAlign = 'center' | 'end' | 'start';

export type TAlignmentComponents = { x: TAxisAlign; y: TAxisAlign };

const ALIGNMENT_COMPONENTS: Record<AlignmentLayout, TAlignmentComponents> = {
  [AlignmentLayout.bottomCenter]: { x: 'center', y: 'end' },
  [AlignmentLayout.bottomLeft]: { x: 'start', y: 'end' },
  [AlignmentLayout.bottomRight]: { x: 'end', y: 'end' },
  [AlignmentLayout.center]: { x: 'center', y: 'center' },
  [AlignmentLayout.left]: { x: 'start', y: 'center' },
  [AlignmentLayout.right]: { x: 'end', y: 'center' },
  [AlignmentLayout.topCenter]: { x: 'center', y: 'start' },
  [AlignmentLayout.topLeft]: { x: 'start', y: 'start' },
  [AlignmentLayout.topRight]: { x: 'end', y: 'start' },
};

export const getAlignmentComponents = (alignment: AlignmentLayout): TAlignmentComponents => ALIGNMENT_COMPONENTS[alignment];
