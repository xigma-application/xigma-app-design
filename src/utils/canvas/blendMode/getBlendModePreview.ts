// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

export const getBlendModePreview = (refs: TCanvasRefs, nodeId: string): BlendMode | undefined => {
  const preview = refs.blendMode.previewRef.current;
  return preview && preview.nodeId === nodeId ? preview.blendMode : undefined;
};
