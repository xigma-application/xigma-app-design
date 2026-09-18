import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ApplyStylesButton from '../ApplyStylesButton/ApplyStylesButton';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export const StrokeSection: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      component={
        <ApplyStylesButton
          ariaLabel={t(`${translationNameSpace}.applyStylesAriaLabel`)}
          tooltip={t(`${translationNameSpace}.applyStylesTooltip`)}
        />
      }
      e2eValue="stroke"
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
      onAdd={() => {}}
    />
  );
};

export default StrokeSection;
