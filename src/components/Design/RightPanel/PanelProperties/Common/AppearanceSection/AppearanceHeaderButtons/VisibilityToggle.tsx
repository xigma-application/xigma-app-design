import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

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
      <Button ariaLabel={t(`${translationNameSpace}.${ariaLabelKey}`)} onClick={onToggle} style={{ padding: 5 }}>
        <Icon name={hidden ? 'EyesClosed' : 'EyesOpened'} size={14} />
      </Button>
    </Tooltip>
  );
};

export default VisibilityToggle;
