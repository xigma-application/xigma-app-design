// types
import { LayoutVersion, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { clampAutoLayoutSize } from '../clampAutoLayoutSize';
import { getAutoLayoutChildStrokeInset } from './getAutoLayoutChildStrokeInset';
import { resolveAutoLayoutFillPrimarySizes, TAutoLayoutFillPrimaryCandidate } from './resolveAutoLayoutFillPrimarySizes';

const getFixedPrimarySize = (child: TAutoLayoutChildSize, isHorizontal: boolean): number => {
  const mode = isHorizontal ? child.widthSizingMode : child.heightSizingMode;

  if (mode === SizingMode.fill) {
    return 0;
  }

  return isHorizontal ? child.width : child.height;
};

const subtractInset = (bound: number | undefined, inset: number): number | undefined =>
  bound === undefined ? undefined : Math.max(bound - inset, 0);

const getAutoLayoutStrokeInsets = (fillChildren: TAutoLayoutChildSize[], layoutVersion: LayoutVersion): Record<string, number> =>
  fillChildren.reduce<Record<string, number>>((strokeInsets, child) => {
    strokeInsets[child.id] = getAutoLayoutChildStrokeInset(child, layoutVersion);
    return strokeInsets;
  }, {});

const getAutoLayoutFillCandidates = (
  fillChildren: TAutoLayoutChildSize[],
  isHorizontal: boolean,
  strokeInsets: Record<string, number>,
): TAutoLayoutFillPrimaryCandidate[] =>
  fillChildren.map((child) => ({
    id: child.id,
    max: subtractInset(isHorizontal ? child.maxWidth : child.maxHeight, strokeInsets[child.id]),
    min: subtractInset(isHorizontal ? child.minWidth : child.minHeight, strokeInsets[child.id]),
  }));

export const getAutoLayoutFillSizes = (
  isHorizontal: boolean,
  itemSpacing: number,
  availablePrimary: number,
  availableCounter: number,
  children: TAutoLayoutChildSize[],
  layoutVersion: LayoutVersion = LayoutVersion.updated,
): TAutoLayoutChildSize[] => {
  const totalGaps = children.length > 0 ? itemSpacing * (children.length - 1) : 0;
  const fixedPrimarySum = children.reduce((total, child) => total + getFixedPrimarySize(child, isHorizontal), 0);
  const fillChildren = children.filter((child) => (isHorizontal ? child.widthSizingMode : child.heightSizingMode) === SizingMode.fill);
  const strokeInsets = getAutoLayoutStrokeInsets(fillChildren, layoutVersion);
  const totalStrokeInset = fillChildren.reduce((total, child) => total + strokeInsets[child.id], 0);
  const leftover = fillChildren.length > 0 ? Math.max(availablePrimary - totalGaps - fixedPrimarySum - totalStrokeInset, 0) : 0;
  const candidates = getAutoLayoutFillCandidates(fillChildren, isHorizontal, strokeInsets);
  const resolvedContentSizes = resolveAutoLayoutFillPrimarySizes(leftover, candidates);

  return children.map((child) => {
    const primaryMode = isHorizontal ? child.widthSizingMode : child.heightSizingMode;
    const counterMode = isHorizontal ? child.heightSizingMode : child.widthSizingMode;
    const primarySize =
      primaryMode === SizingMode.fill ? resolvedContentSizes[child.id] + strokeInsets[child.id] : isHorizontal ? child.width : child.height;
    const rawCounterSize = counterMode === SizingMode.fill ? availableCounter : isHorizontal ? child.height : child.width;
    const counterMin = isHorizontal ? child.minHeight : child.minWidth;
    const counterMax = isHorizontal ? child.maxHeight : child.maxWidth;
    const counterSize = counterMode === SizingMode.fill ? clampAutoLayoutSize(rawCounterSize, counterMin, counterMax) : rawCounterSize;

    return isHorizontal ? { ...child, height: counterSize, width: primarySize } : { ...child, height: primarySize, width: counterSize };
  });
};
