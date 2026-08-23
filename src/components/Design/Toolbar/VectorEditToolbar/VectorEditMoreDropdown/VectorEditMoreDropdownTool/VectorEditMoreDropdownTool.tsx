import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import VectorEditMoreDropdownItems from '../VectorEditMoreDropdownItems/VectorEditMoreDropdownItems';
import { Icon, Popover, Tooltip } from 'shared';

// hooks
import { useSelectVectorEditTool } from '../../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { TOOL_ICON, TOOL_LABEL } from '../../../constants';
import { ICON_SIZE, MORE_TOOLS, TMoreToolName, translationNameSpace } from '../../constants';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from '../../vector-edit-toolbar.module.scss';

export type TVectorEditMoreDropdownToolProps = {
  toolName: TMoreToolName;
};

const VectorEditMoreDropdownTool: FC<TVectorEditMoreDropdownToolProps> = ({ toolName }) => {
  const { t } = useTranslation();
  const activeTool = useAppSelector(selectActiveTool);
  const handleSelect = useSelectVectorEditTool(toolName);
  const shortcut = MORE_TOOLS.find((tool) => tool.toolName === toolName)?.shortcut;
  const isActive = activeTool === toolName;

  return (
    <div className={styles['VectorEditToolbar__more-group']}>
      <Tooltip
        content={
          <>
            {t(TOOL_LABEL[toolName])}
            {shortcut && <span className={styles.VectorEditToolbar__shortcut}>{shortcut}</span>}
          </>
        }
      >
        <button
          aria-label={t(TOOL_LABEL[toolName])}
          aria-pressed={isActive}
          className={cx(styles.VectorEditToolbar__button, { [styles['VectorEditToolbar__button--active']]: isActive })}
          onClick={handleSelect}
          type="button"
        >
          <Icon color={isActive ? 'onBlue1' : 'neutral1'} name={TOOL_ICON[toolName]} size={ICON_SIZE} />
        </button>
      </Tooltip>
      <Popover
        side="top"
        trigger={<Icon name="ChevronDown" size={16} />}
        triggerAriaLabel={t(`${translationNameSpace}.more`)}
        triggerClassName={styles['VectorEditToolbar__more-chevron']}
      >
        <VectorEditMoreDropdownItems lastMoreTool={toolName} />
      </Popover>
    </div>
  );
};

export default VectorEditMoreDropdownTool;
