// types
import { SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';

// utils
import { clampAutoLayoutSize } from '../clampAutoLayoutSize';
import { resolveAutoLayoutFillPrimarySizes } from './resolveAutoLayoutFillPrimarySizes';

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
  const fillChildren = children.filter((child) => (isHorizontal ? child.widthSizingMode : child.heightSizingMode) === SizingMode.fill);
  const leftover = fillChildren.length > 0 ? Math.max(availablePrimary - totalGaps - fixedPrimarySum, 0) : 0;
  const candidates = fillChildren.map((child) => ({
    id: child.id,
    max: isHorizontal ? child.maxWidth : child.maxHeight,
    min: isHorizontal ? child.minWidth : child.minHeight,
  }));
  const resolvedPrimarySizes = resolveAutoLayoutFillPrimarySizes(leftover, candidates);

  return children.map((child) => {
    const primaryMode = isHorizontal ? child.widthSizingMode : child.heightSizingMode;
    const counterMode = isHorizontal ? child.heightSizingMode : child.widthSizingMode;
    const primarySize = primaryMode === SizingMode.fill ? resolvedPrimarySizes[child.id] : isHorizontal ? child.width : child.height;
    const rawCounterSize = counterMode === SizingMode.fill ? availableCounter : isHorizontal ? child.height : child.width;
    const counterMin = isHorizontal ? child.minHeight : child.minWidth;
    const counterMax = isHorizontal ? child.maxHeight : child.maxWidth;
    const counterSize = counterMode === SizingMode.fill ? clampAutoLayoutSize(rawCounterSize, counterMin, counterMax) : rawCounterSize;

    return isHorizontal ? { ...child, height: counterSize, width: primarySize } : { ...child, height: primarySize, width: counterSize };
  });
};
