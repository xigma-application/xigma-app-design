// others
import { LAYERS_TREE_BOTTOM_MARGIN, LAYERS_TREE_MIN_HEIGHT, LAYERS_TREE_TOP_OFFSET } from '../constants';

export const getMaxLayersTreeHeight = (): number =>
  Math.max(window.innerHeight - LAYERS_TREE_TOP_OFFSET - LAYERS_TREE_BOTTOM_MARGIN, LAYERS_TREE_MIN_HEIGHT);
