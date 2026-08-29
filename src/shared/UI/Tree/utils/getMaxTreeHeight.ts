// others
import { TREE_BOTTOM_MARGIN, TREE_MIN_HEIGHT, TREE_TOP_OFFSET } from '../constants';

export const getMaxTreeHeight = (): number => Math.max(window.innerHeight - TREE_TOP_OFFSET - TREE_BOTTOM_MARGIN, TREE_MIN_HEIGHT);
