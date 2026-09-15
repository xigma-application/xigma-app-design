import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import BlendModeMenu from './BlendModeMenu/BlendModeMenu';
import { UITools } from 'shared';

// hooks
import { useBlendModeButton } from './hooks/useBlendModeButton';

// others
import { translationNameSpace } from '../../constants';

const BlendModeButton: FC = () => {
  const { t } = useTranslation();
  const { icon, isDefault, nodeId, onOpenChange, open, selectBlendMode, value } = useBlendModeButton();

  return (
    <UITools.Popover
      asChild
      onOpenChange={onOpenChange}
      open={open}
      trigger={<UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.blendMode.ariaLabel`)} name={icon} selected={open} />}
      triggerTooltip={t(`${translationNameSpace}.tooltip.${isDefault ? 'addBlendMode' : 'removeBlendMode'}`)}
    >
      <BlendModeMenu nodeId={nodeId} onSelect={selectBlendMode} value={value} />
    </UITools.Popover>
  );
};

export default BlendModeButton;
