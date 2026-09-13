// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getBlendModePreview } from 'utils/canvas/blendMode/getBlendModePreview';

export const getNodeBlendMode = (node: TSceneNode, refs: TCanvasRefs): BlendMode | undefined =>
  getBlendModePreview(refs, node.id) ?? ('blendMode' in node ? node.blendMode : undefined);
