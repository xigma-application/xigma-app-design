import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared';

// hooks
import { useSelectVectorEditTool } from '../../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { TOOL_ICON, TOOL_LABEL } from '../../../constants';
import { TVectorEditMoreTool } from '../../constants';

const { PopoverItem } = PopoverCompound;

export type TVectorEditMoreDropdownItemProps = {
  selected: boolean;
  tool: TVectorEditMoreTool;
};

const VectorEditMoreDropdownItem: FC<TVectorEditMoreDropdownItemProps> = ({ selected, tool }) => {
  const { t } = useTranslation();
  const handleClick = useSelectVectorEditTool(tool.toolName);

  return (
    <PopoverItem
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
