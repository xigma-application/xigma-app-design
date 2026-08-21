import { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import cx from 'classnames';
import { ICON_SIZE, TVectorEditTool } from '../constants';

// store
import { selectActiveTool, selectVectorEditingNodeId } from 'store/design/selectors';
import { setActiveTool, setVectorEditingNodeId } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// styles
import styles from '../vector-edit-toolbar.module.scss';

// types
import { ToolName } from 'types/design/enums';

export type TUseVectorEditToolbar = {
  handleClose: () => void;
  renderTool: (tool: TVectorEditTool) => ReactNode;
  vectorEditingNodeId: string | null;
};

export const useVectorEditToolbar = (): TUseVectorEditToolbar => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vectorEditingNodeId = useAppSelector(selectVectorEditingNodeId);
  const activeTool = useAppSelector(selectActiveTool);

  const handleClose = useCallback((): void => {
    dispatch(setActiveTool(ToolName.default));
    dispatch(setVectorEditingNodeId(null));
  }, [dispatch]);

  const renderTool = useCallback(
    (tool: TVectorEditTool): ReactNode => {
      const isActive = tool.toolName !== undefined && activeTool === tool.toolName;
      const handleClick =
        tool.toolName !== undefined
          ? (): void => {
              dispatch(setActiveTool(tool.toolName as ToolName));
            }
          : undefined;

      return (
        <button
          aria-pressed={isActive}
          className={cx(styles.VectorEditToolbar__button, { [styles['VectorEditToolbar__button--active']]: isActive })}
          key={tool.labelKey}
          onClick={handleClick}
          type="button"
        >
          <Icon color={isActive ? 'onBlue1' : 'neutral1'} name={tool.icon} size={ICON_SIZE} />
          <span className={styles.VectorEditToolbar__label}>{t(tool.labelKey)}</span>
        </button>
      );
    },
    [activeTool, dispatch, t],
  );

  return { handleClose, renderTool, vectorEditingNodeId };
};
