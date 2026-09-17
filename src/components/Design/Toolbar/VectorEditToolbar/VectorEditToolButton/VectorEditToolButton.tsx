import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ToolbarButton from '../../ToolbarButton/ToolbarButton';

// hooks
import { useSelectVectorEditTool } from './hooks/useSelectVectorEditTool';

// others
import { TVectorEditTool } from '../constants';

export type TVectorEditToolButtonProps = {
  isActive: boolean;
  tool: TVectorEditTool;
};

const VectorEditToolButton: FC<TVectorEditToolButtonProps> = ({ isActive, tool }) => {
  const { t } = useTranslation();
  const handleClick = useSelectVectorEditTool(tool.toolName);
  const label = t(tool.labelKey);

  return (
    <ToolbarButton
      icon={tool.icon}
      isActive={isActive}
      label={label}
      onClick={handleClick}
      shortcut={tool.shortcut?.join('')}
      tooltip={label}
    />
  );
};

export default VectorEditToolButton;
