import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import VectorEditMoreDropdownItems from '../VectorEditMoreDropdownItems/VectorEditMoreDropdownItems';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { useIsVectorEditMoreToolDisabled } from '../VectorEditMoreDropdownItem/hooks/useIsVectorEditMoreToolDisabled';
import { useSelectVectorEditTool } from '../../VectorEditToolButton/hooks/useSelectVectorEditTool';

// others
import { TOOL_ICON, TOOL_LABEL } from '../../../constants';
import { MORE_TOOLS, TMoreToolName, translationNameSpace } from '../../constants';

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
  const isDisabled = useIsVectorEditMoreToolDisabled(toolName);
  const handleSelect = useSelectVectorEditTool(isDisabled ? undefined : toolName);
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
        <UITools.ButtonIcon
          active={isActive}
          ariaLabel={t(TOOL_LABEL[toolName])}
          className={cx(styles['VectorEditToolbar__tool-button'], { [styles['VectorEditToolbar__tool-button--active']]: isActive })}
          color={isActive ? 'onBlue1' : 'neutral1'}
          disabled={isDisabled}
          name={TOOL_ICON[toolName]}
          onClick={handleSelect}
        />
      </Tooltip>
      <UITools.ButtonMenu
        className={styles['VectorEditToolbar__more-chevron']}
        side="top"
        trigger={<Icon name="ChevronDown" size={16} />}
        triggerAriaLabel={t(`${translationNameSpace}.more`)}
      >
        <VectorEditMoreDropdownItems lastMoreTool={toolName} />
      </UITools.ButtonMenu>
    </div>
  );
};

export default VectorEditMoreDropdownTool;
