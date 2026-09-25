import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensions from '../../Common/ColumnDimensions/ColumnDimensions';
import ColumnSpacing from '../../Common/ColumnSpacing/ColumnSpacing';
import { Tooltip, UITools } from 'shared';

// hooks
import { useResizeToFitSelection } from 'components/Design/Menu/hooks/useResizeToFitSelection';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace as commonNameSpace } from '../../Common/constants';
import { translationNameSpace } from './constants';

const SectionLayoutSection: FC = () => {
  const { t } = useTranslation();
  const onResizeToFit = useResizeToFitSelection();

  return (
    <UITools.Section
      component={
        <Tooltip
          align="end"
          content={
            <Fragment>
              {t(`${translationNameSpace}.resizeToFitTooltip`)}
              <span>{KEYBOARD_SHORTCUTS.resizeToFit.join('')}</span>
            </Fragment>
          }
        >
          <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.resizeToFitAriaLabel`)} name="FitLayout" onClick={onResizeToFit} />
        </Tooltip>
      }
      e2eValue="layout"
      label={t(`${commonNameSpace}.layoutSection.label`)}
    >
      <ColumnDimensions />
      <ColumnSpacing />
    </UITools.Section>
  );
};

export default SectionLayoutSection;
