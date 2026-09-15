import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useVisibilityToggle } from './hooks/useVisibilityToggle';

// others
import { translationNameSpace } from '../constants';

const VisibilityToggle: FC = () => {
  const { t } = useTranslation();
  const { hidden, onToggle } = useVisibilityToggle();
  const ariaLabelKey = hidden ? 'visibility.showAriaLabel' : 'visibility.hideAriaLabel';
  const tooltipKey = hidden ? 'visibility.showTooltip' : 'visibility.hideTooltip';

  return (
    <Tooltip content={t(`${translationNameSpace}.${tooltipKey}`)}>
      <UITools.ButtonIcon
        ariaLabel={t(`${translationNameSpace}.${ariaLabelKey}`)}
        name={hidden ? 'EyesClosed' : 'EyesOpened'}
        onClick={onToggle}
      />
    </Tooltip>
  );
};

export default VisibilityToggle;
