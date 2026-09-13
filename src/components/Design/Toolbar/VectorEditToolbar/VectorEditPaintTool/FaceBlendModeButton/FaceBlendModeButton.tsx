import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FaceBlendModeMenu from './FaceBlendModeMenu/FaceBlendModeMenu';
import { Icon, UITools } from 'shared';

// hooks
import { useFaceBlendModeButton } from './hooks/useFaceBlendModeButton';

// others
import { translationNameSpace } from '../../constants';

const FaceBlendModeButton: FC = () => {
  const { t } = useTranslation();
  const { icon, onOpenChange, open, selectBlendMode, value } = useFaceBlendModeButton();
  const label = t(`${translationNameSpace}.paint.blendMode.ariaLabel`);

  return (
    <UITools.Popover
      asChild
      onOpenChange={onOpenChange}
      open={open}
      trigger={
        <UITools.Button ariaLabel={label} selected={open} style={{ padding: 5.5 }}>
          <Icon name={icon} size={13} />
        </UITools.Button>
      }
      triggerTooltip={label}
    >
      <FaceBlendModeMenu onSelect={selectBlendMode} value={value} />
    </UITools.Popover>
  );
};

export default FaceBlendModeButton;
