import { Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

const LayoutSectionButtons = (): ReactNode[] => {
  const { t } = useTranslation();

  return [
    <Tooltip
      align="end"
      content={
        <Fragment>
          {t(`${translationNameSpace}.resizeToFitTooltip`)}
          <span>{KEYBOARD_SHORTCUTS.resizeToFit.join('')}</span>
        </Fragment>
      }
      key="resize-to-fit"
    >
      <Button ariaLabel={t(`${translationNameSpace}.resizeToFitAriaLabel`)} onClick={() => {}} style={{ padding: 6 }}>
        <Icon name="FitLayout" size={12} />
      </Button>
    </Tooltip>,
    <Tooltip
      align="end"
      content={
        <Fragment>
          {t(`${translationNameSpace}.autoLayoutTooltip`)}
          <span>{KEYBOARD_SHORTCUTS.addAutoLayout.join('')}</span>
        </Fragment>
      }
      key="auto-layout"
    >
      <Button ariaLabel={t(`${translationNameSpace}.autoLayoutAriaLabel`)} onClick={() => {}} style={{ padding: 6 }}>
        <Icon name="AutoLayout" size={12} />
      </Button>
    </Tooltip>,
  ];
};

export default LayoutSectionButtons;
