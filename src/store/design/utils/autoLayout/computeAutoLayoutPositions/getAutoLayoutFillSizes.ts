// types
import { SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';

const getFixedPrimarySize = (child: TAutoLayoutChildSize, isHorizontal: boolean): number => {
  const mode = isHorizontal ? child.widthSizingMode : child.heightSizingMode;

  if (mode === SizingMode.fill) {
    return 0;
  }

  return isHorizontal ? child.width : child.height;
};

export const getAutoLayoutFillSizes = (
  isHorizontal: boolean,
  itemSpacing: number,
  availablePrimary: number,
  availableCounter: number,
  children: TAutoLayoutChildSize[],
): TAutoLayoutChildSize[] => {
  const totalGaps = children.length > 0 ? itemSpacing * (children.length - 1) : 0;
  const fixedPrimarySum = children.reduce((total, child) => total + getFixedPrimarySize(child, isHorizontal), 0);
  const fillCount = children.filter((child) => (isHorizontal ? child.widthSizingMode : child.heightSizingMode) === SizingMode.fill).length;
  const fillPrimarySize = fillCount > 0 ? Math.max(availablePrimary - totalGaps - fixedPrimarySum, 0) / fillCount : 0;

  return children.map((child) => {
    const primaryMode = isHorizontal ? child.widthSizingMode : child.heightSizingMode;
    const counterMode = isHorizontal ? child.heightSizingMode : child.widthSizingMode;
    const primarySize = primaryMode === SizingMode.fill ? fillPrimarySize : isHorizontal ? child.width : child.height;
    const counterSize = counterMode === SizingMode.fill ? availableCounter : isHorizontal ? child.height : child.width;

    return isHorizontal ? { ...child, height: counterSize, width: primarySize } : { ...child, height: primarySize, width: counterSize };
  });
};
