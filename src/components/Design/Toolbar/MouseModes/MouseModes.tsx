import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ToolDropdown from './ToolDropdown/ToolDropdown';
import { Icon, Tooltip } from 'shared';

// hooks
import { useSelectTool } from './hooks/useSelectTool';

// others
import { KEYBOARD_SHORTCUTS } from '../../keys';
import { TOOL_ICON, TOOL_ICON_SIZE, TOOL_LABEL, TOOLBAR_ORDER, TOOLS_WITH_DROPDOWN } from '../constants';

// store
import {
  selectActiveTool,
  selectLastFrameTool,
  selectLastMouseTool,
  selectLastPenTool,
  selectLastShapeTool,
  selectLastTextTool,
} from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './mouse-modes.module.scss';

// utils
import { getGroupDisplayedTool } from '../utils/getGroupDisplayedTool';

const MouseModes: FC = () => {
  const { t } = useTranslation();
  const activeTool = useAppSelector(selectActiveTool);
  const lastFrameTool = useAppSelector(selectLastFrameTool);
  const lastMouseTool = useAppSelector(selectLastMouseTool);
  const lastPenTool = useAppSelector(selectLastPenTool);
  const lastShapeTool = useAppSelector(selectLastShapeTool);
  const lastTextTool = useAppSelector(selectLastTextTool);
  const handleSelectTool = useSelectTool();

  return (
    <ToggleGroupPrimitive.Root className={styles.MouseModes} onValueChange={handleSelectTool} type="single" value={activeTool}>
      {TOOLBAR_ORDER.map((name) => {
        const displayedTool = getGroupDisplayedTool(name, lastShapeTool, lastMouseTool, lastFrameTool, lastTextTool, lastPenTool);
        const isActive = displayedTool === activeTool;
        const shortcut = KEYBOARD_SHORTCUTS[displayedTool].join('');

        return (
          <div className={styles['MouseModes__tool-group']} key={name}>
            <Tooltip
              content={
                <>
                  {t(TOOL_LABEL[displayedTool])}
                  {shortcut && <span className={styles.MouseModes__shortcut}>{shortcut}</span>}
                </>
              }
            >
              <span className={styles.MouseModes__trigger}>
                <ToggleGroupPrimitive.Item aria-label={displayedTool} className={styles.MouseModes__button} value={displayedTool}>
                  <Icon color={isActive ? 'onBlue1' : 'neutral1'} name={TOOL_ICON[displayedTool]} size={TOOL_ICON_SIZE[displayedTool]} />
                </ToggleGroupPrimitive.Item>
              </span>
            </Tooltip>
            {TOOLS_WITH_DROPDOWN.includes(name) && <ToolDropdown tool={name} />}
          </div>
        );
      })}
    </ToggleGroupPrimitive.Root>
  );
};

export default MouseModes;
