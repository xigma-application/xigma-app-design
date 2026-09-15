import { Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useLayoutSectionButtons } from './hooks/useLayoutSectionButtons';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

const LayoutSectionButtons = (): ReactNode[] => {
  const { t } = useTranslation();
  const { isAutoLayoutSelected, isResizeToFitVisible, onResizeToFit, onToggleAutoLayout } = useLayoutSectionButtons();

  return [
    ...(isResizeToFitVisible
      ? [
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
            <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.resizeToFitAriaLabel`)} name="FitLayout" onClick={onResizeToFit} />
          </Tooltip>,
        ]
      : []),
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
      <UITools.ButtonIcon
        ariaLabel={t(`${translationNameSpace}.autoLayoutAriaLabel`)}
        name="AutoLayout"
        onClick={onToggleAutoLayout}
        selected={isAutoLayoutSelected}
      />
    </Tooltip>,
  ];
};

export default LayoutSectionButtons;
