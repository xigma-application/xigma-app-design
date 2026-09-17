import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ToolbarDropdown, { TToolbarDropdownOption } from '../../ToolbarDropdown/ToolbarDropdown';
import VectorEditMoreDropdownItems from './VectorEditMoreDropdownItems/VectorEditMoreDropdownItems';

// hooks
import { useIsVectorEditMoreToolDisabled } from './VectorEditMoreDropdownItem/hooks/useIsVectorEditMoreToolDisabled';
import { useSelectVectorEditTool } from '../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { TOOL_ICON, TOOL_LABEL } from '../../constants';
import { MORE_TOOLS, translationNameSpace } from '../constants';
import { isMoreToolName } from './utils/isMoreToolName';

// store
import { selectActiveTool, selectLastMoreTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';

const VectorEditMoreDropdown: FC = () => {
  const { t } = useTranslation();
  const lastMoreTool = useAppSelector(selectLastMoreTool);
  const activeTool = useAppSelector(selectActiveTool);
  const toolName = lastMoreTool !== null && isMoreToolName(lastMoreTool) ? lastMoreTool : null;
  const isDisabled = useIsVectorEditMoreToolDisabled(toolName ?? ToolName.shapeBuilder);
  const handleSelect = useSelectVectorEditTool(toolName === null || isDisabled ? undefined : toolName);
  const label = t(`${translationNameSpace}.more`);

  const option: TToolbarDropdownOption | null =
    toolName === null
      ? null
      : {
          icon: TOOL_ICON[toolName],
          isActive: activeTool === toolName,
          isDisabled,
          label: t(TOOL_LABEL[toolName]),
          onClick: handleSelect,
          shortcut: MORE_TOOLS.find((tool) => tool.toolName === toolName)?.shortcut,
        };

  return (
    <ToolbarDropdown option={option} placeholderLabel={label} triggerAriaLabel={label}>
      <VectorEditMoreDropdownItems lastMoreTool={toolName} />
    </ToolbarDropdown>
  );
};

export default VectorEditMoreDropdown;
