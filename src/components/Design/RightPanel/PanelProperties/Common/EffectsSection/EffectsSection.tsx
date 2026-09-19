import { FC } from 'react';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

// components
import ApplyStylesButton from '../ApplyStylesButton/ApplyStylesButton';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export const EffectsSection: FC = () => {
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
      e2eValue="effects"
      hasContent={false}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
      onAdd={noop}
    />
  );
};

export default EffectsSection;
