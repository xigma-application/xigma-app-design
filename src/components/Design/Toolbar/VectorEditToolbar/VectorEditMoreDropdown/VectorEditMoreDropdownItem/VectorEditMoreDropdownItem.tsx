import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useIsVectorEditMoreToolDisabled } from './hooks/useIsVectorEditMoreToolDisabled';
import { useSelectVectorEditTool } from '../../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { TOOL_ICON, TOOL_LABEL } from '../../../constants';
import { TVectorEditMoreTool } from '../../constants';

const { PopoverItem } = UITools.PopoverCompound;

export type TVectorEditMoreDropdownItemProps = {
  selected: boolean;
  tool: TVectorEditMoreTool;
};

const VectorEditMoreDropdownItem: FC<TVectorEditMoreDropdownItemProps> = ({ selected, tool }) => {
  const { t } = useTranslation();
  const isDisabled = useIsVectorEditMoreToolDisabled(tool.toolName);
  const handleClick = useSelectVectorEditTool(isDisabled ? undefined : tool.toolName);

  return (
    <PopoverItem
      disabled={isDisabled}
      icon={TOOL_ICON[tool.toolName]}
      iconSize={24}
      label={t(TOOL_LABEL[tool.toolName])}
      onClick={handleClick}
      selected={selected}
      shortcut={tool.shortcut}
    />
  );
};

export default VectorEditMoreDropdownItem;
