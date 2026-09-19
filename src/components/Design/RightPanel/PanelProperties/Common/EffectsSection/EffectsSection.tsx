import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ApplyStylesButton from '../ApplyStylesButton/ApplyStylesButton';
import EffectsMenu from './EffectsMenu/EffectsMenu';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export const EffectsSection: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section
      component={
        <Fragment>
          <ApplyStylesButton
            ariaLabel={t(`${translationNameSpace}.applyStylesAriaLabel`)}
            tooltip={t(`${translationNameSpace}.applyStylesTooltip`)}
          />
          <EffectsMenu />
        </Fragment>
      }
      e2eValue="effects"
      hasContent={false}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
    />
  );
};

export default EffectsSection;
