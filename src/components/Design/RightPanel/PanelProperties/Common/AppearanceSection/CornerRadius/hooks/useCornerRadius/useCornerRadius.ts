import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../types';
import { TUseCornerRadiusResult } from './types';

// utils
import { clamp } from './utils/clamp';
import { commitCornerRadiusChange } from './utils/commitCornerRadiusChange';
import { cornerField } from './utils/cornerField';
import { getMixedOrValue } from '../../../../utils/getMixedOrValue';
import { translationNameSpace } from '../../../constants';

export const useCornerRadius = (): TUseCornerRadiusResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const [isIndividual, setIsIndividual] = useState(false);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const base = node?.cornerRadius ?? 0;
  const topLeft = node?.cornerRadiusTopLeft ?? base;
  const topRight = node?.cornerRadiusTopRight ?? base;
  const bottomLeft = node?.cornerRadiusBottomLeft ?? base;
  const bottomRight = node?.cornerRadiusBottomRight ?? base;
  const mixedOrValue = getMixedOrValue([topLeft, topRight, bottomLeft, bottomRight]);
  const isMixed = mixedOrValue === 'mixed';

  return {
    individualFields: [
      cornerField(
        dispatch,
        id,
        'cornerRadiusTopLeft',
        t(`${translationNameSpace}.cornerRadius.ariaLabelTopLeft`),
        'corner-radius-top-left',
        'BorderRadiusL',
        t(`${translationNameSpace}.cornerRadius.tooltipTopLeft`),
        topLeft,
      ),
      cornerField(
        dispatch,
        id,
        'cornerRadiusTopRight',
        t(`${translationNameSpace}.cornerRadius.ariaLabelTopRight`),
        'corner-radius-top-right',
        'BorderRadiusT',
        t(`${translationNameSpace}.cornerRadius.tooltipTopRight`),
        topRight,
      ),
      cornerField(
        dispatch,
        id,
        'cornerRadiusBottomLeft',
        t(`${translationNameSpace}.cornerRadius.ariaLabelBottomLeft`),
        'corner-radius-bottom-left',
        'BorderRadiusR',
        t(`${translationNameSpace}.cornerRadius.tooltipBottomLeft`),
        bottomLeft,
      ),
      cornerField(
        dispatch,
        id,
        'cornerRadiusBottomRight',
        t(`${translationNameSpace}.cornerRadius.ariaLabelBottomRight`),
        'corner-radius-bottom-right',
        'BorderRadiusB',
        t(`${translationNameSpace}.cornerRadius.tooltipBottomRight`),
        bottomRight,
      ),
    ],
    isIndividual,
    isMixed,
    mergedValue: isMixed ? base : mixedOrValue,
    onMergedCommit: (raw): void => {
      const parsed = parseInt(raw.replace(/[^\d]/g, ''), 10);

      if (!Number.isNaN(parsed)) {
        const next = clamp(parsed);

        commitCornerRadiusChange(dispatch, id, {
          cornerRadius: next,
          cornerRadiusBottomLeft: next,
          cornerRadiusBottomRight: next,
          cornerRadiusTopLeft: next,
          cornerRadiusTopRight: next,
        });
      }
    },
    onMergedScrub: (next): void => {
      const value = clamp(next);

      commitCornerRadiusChange(dispatch, id, {
        cornerRadius: value,
        cornerRadiusBottomLeft: value,
        cornerRadiusBottomRight: value,
        cornerRadiusTopLeft: value,
        cornerRadiusTopRight: value,
      });
    },
    toggleIndividual: (): void => setIsIndividual((previous) => !previous),
  };
};
