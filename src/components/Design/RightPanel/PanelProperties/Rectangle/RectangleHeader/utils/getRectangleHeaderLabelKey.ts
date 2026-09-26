// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeMediaFillType } from 'utils/design/paint/getNodeMediaFillType';

export const getRectangleHeaderLabelKey = (nodes: TSceneNode[]): 'imageLabel' | 'label' | 'mixedMediaLabel' | 'videoLabel' => {
  const mediaFillTypes = new Set(nodes.map(getNodeMediaFillType));

  switch (true) {
    case mediaFillTypes.size === 2 && !mediaFillTypes.has(null):
      return 'mixedMediaLabel';
    case mediaFillTypes.size !== 1:
      return 'label';
    case mediaFillTypes.has('image'):
      return 'imageLabel';
    case mediaFillTypes.has('video'):
      return 'videoLabel';
    default:
      return 'label';
  }
};
