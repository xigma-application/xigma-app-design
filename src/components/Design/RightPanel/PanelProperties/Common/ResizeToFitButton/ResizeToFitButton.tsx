import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useResizeToFitSelection } from 'components/Design/Menu/hooks/useResizeToFitSelection';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// store
import { selectCanResizeToFit } from 'store/design/selectors';
import { useAppSelector } from 'store';

const ResizeToFitButton: FC = () => {
  const { t } = useTranslation();
  const onResizeToFit = useResizeToFitSelection();
  const canResizeToFit = useAppSelector(selectCanResizeToFit);

  return (
    <Tooltip
      align="end"
      content={
        <Fragment>
          {t(`${translationNameSpace}.resizeToFitTooltip`)}
          <span>{KEYBOARD_SHORTCUTS.resizeToFit.join('')}</span>
        </Fragment>
      }
    >
      <UITools.ButtonIcon
        ariaLabel={t(`${translationNameSpace}.resizeToFitAriaLabel`)}
        disabled={!canResizeToFit}
        name="FitLayout"
        onClick={onResizeToFit}
      />
    </Tooltip>
  );
};

export default ResizeToFitButton;
