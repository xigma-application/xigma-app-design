// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

export const getEffectBlendModePreview = (refs: TCanvasRefs, nodeId: string, effectIndex: number): BlendMode | undefined => {
  const preview = refs.blendMode.effectPreviewRef.current;
  return preview && preview.nodeIds.includes(nodeId) && preview.effectIndex === effectIndex ? preview.blendMode : undefined;
};
