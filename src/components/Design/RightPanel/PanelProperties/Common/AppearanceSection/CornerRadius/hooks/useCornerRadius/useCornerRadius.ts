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
import { commitOnNodes } from '../../../utils/commitOnNodes';
import { cornerField } from './utils/cornerField';
import { getNodeMergedCornerRadius } from './utils/getNodeMergedCornerRadius';
import { getShiftedCornerRadiusChanges } from './utils/getShiftedCornerRadiusChanges';
import { getUniformCornerRadiusChanges } from './utils/getUniformCornerRadiusChanges';
import { translationNameSpace } from '../../../constants';

export const useCornerRadius = (): TUseCornerRadiusResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(isAppearanceNode);
  const [individualOverride, setIndividualOverride] = useState<boolean>();
  const [firstNode] = nodes;
  const mergedValues = nodes.map(getNodeMergedCornerRadius);
  const firstMergedValue = getNodeMergedCornerRadius(firstNode);
  const isMixed = mergedValues.some((mergedValue) => mergedValue === 'mixed' || mergedValue !== firstMergedValue);
  const hasUnevenCorners = nodes.length > 1 && mergedValues.includes('mixed');
  const isIndividual = individualOverride ?? hasUnevenCorners;
  const mergedValue = firstMergedValue === 'mixed' ? (firstNode?.cornerRadius ?? 0) : firstMergedValue;

  const commitUniform = (value: number): void =>
    commitOnNodes(dispatch, nodes, (node) => commitCornerRadiusChange(dispatch, node.id, getUniformCornerRadiusChanges(value)));

  return {
    individualFields: [
      cornerField(
        dispatch,
        nodes,
        'cornerRadiusTopLeft',
        t(`${translationNameSpace}.cornerRadius.ariaLabelTopLeft`),
        'corner-radius-top-left',
        'BorderRadiusL',
        t(`${translationNameSpace}.cornerRadius.tooltipTopLeft`),
      ),
      cornerField(
        dispatch,
        nodes,
        'cornerRadiusTopRight',
        t(`${translationNameSpace}.cornerRadius.ariaLabelTopRight`),
        'corner-radius-top-right',
        'BorderRadiusT',
        t(`${translationNameSpace}.cornerRadius.tooltipTopRight`),
      ),
      cornerField(
        dispatch,
        nodes,
        'cornerRadiusBottomLeft',
        t(`${translationNameSpace}.cornerRadius.ariaLabelBottomLeft`),
        'corner-radius-bottom-left',
        'BorderRadiusR',
        t(`${translationNameSpace}.cornerRadius.tooltipBottomLeft`),
      ),
      cornerField(
        dispatch,
        nodes,
        'cornerRadiusBottomRight',
        t(`${translationNameSpace}.cornerRadius.ariaLabelBottomRight`),
        'corner-radius-bottom-right',
        'BorderRadiusB',
        t(`${translationNameSpace}.cornerRadius.tooltipBottomRight`),
      ),
    ],
    isIndividual,
    isMixed,
    mergedValue,
    onMergedCommit: (raw): void => {
      const parsed = parseInt(raw.replace(/[^\d]/g, ''), 10);

      if (!Number.isNaN(parsed)) {
        commitUniform(clamp(parsed));
      }
    },
    onMergedScrub: (next): void => {
      if (nodes.length > 1) {
        commitOnNodes(dispatch, nodes, (node) =>
          commitCornerRadiusChange(dispatch, node.id, getShiftedCornerRadiusChanges(node, next - mergedValue)),
        );
      } else {
        commitUniform(clamp(next));
      }
    },
    toggleIndividual: (): void => setIndividualOverride(!isIndividual),
  };
};
