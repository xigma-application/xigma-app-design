// types
import { TAppearanceNode } from '../../../../types';

// utils
import { getMixedOrValue } from '../../../../../utils/getMixedOrValue';
import { getNodeCornerRadii } from './getNodeCornerRadii';

export const getNodeMergedCornerRadius = (node: TAppearanceNode | undefined): 'mixed' | number =>
  getMixedOrValue(Object.values(getNodeCornerRadii(node)));
