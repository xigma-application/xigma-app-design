// types
import { BlendMode } from 'types/design/enums';

export const isBlendModeActive = (blendMode: BlendMode | undefined): boolean =>
  blendMode !== undefined && blendMode !== BlendMode.normal && blendMode !== BlendMode.passThrough;
