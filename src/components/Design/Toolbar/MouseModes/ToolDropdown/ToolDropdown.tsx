import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, UITools } from 'shared';

// hooks
import { useSelectGroupTool } from './hooks/useSelectGroupTool';

// others
import { KEYBOARD_SHORTCUTS } from '../../../keys';
import { TOOL_DROPDOWN_ICON_SIZE, TOOL_GROUP_ITEMS, TOOL_ICON, TOOL_LABEL } from '../../constants';

// store
import {
  selectLastFrameTool,
  selectLastMouseTool,
  selectLastPenTool,
  selectLastShapeTool,
  selectLastTextTool,
} from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './tool-dropdown.module.scss';

// types
import { ToolName } from 'types/design/enums';

// utils
import { getGroupDisplayedTool } from '../../utils/getGroupDisplayedTool';

const { PopoverItem } = UITools.PopoverCompound;

export type TToolDropdownProps = {
  tool: ToolName;
};

const ToolDropdown: FC<TToolDropdownProps> = ({ tool }) => {
  const { t } = useTranslation();
  const lastFrameTool = useAppSelector(selectLastFrameTool);
  const lastMouseTool = useAppSelector(selectLastMouseTool);
  const lastPenTool = useAppSelector(selectLastPenTool);
  const lastShapeTool = useAppSelector(selectLastShapeTool);
  const lastTextTool = useAppSelector(selectLastTextTool);
  const handleSelectGroupTool = useSelectGroupTool();
  const groupItems = TOOL_GROUP_ITEMS[tool];
  const selectedTool = getGroupDisplayedTool(tool, lastShapeTool, lastMouseTool, lastFrameTool, lastTextTool, lastPenTool);

  return (
    <UITools.Popover
      trigger={<Icon name="ChevronDown" size={16} />}
      triggerAriaLabel={`${tool} options`}
      triggerClassName={styles.ToolDropdown}
    >
      {(groupItems ?? [tool]).map((groupTool) => (
        <PopoverItem
          className={styles.ToolDropdown__item}
          icon={TOOL_ICON[groupTool]}
          iconSize={TOOL_DROPDOWN_ICON_SIZE[groupTool]}
          key={groupTool}
          label={t(TOOL_LABEL[groupTool])}
          onClick={handleSelectGroupTool(groupTool)}
          selected={groupTool === selectedTool}
          shortcut={KEYBOARD_SHORTCUTS[groupTool].join('')}
          shortcutClassName={styles.ToolDropdown__shortcut}
        />
      ))}
    </UITools.Popover>
  );
};

export default ToolDropdown;
