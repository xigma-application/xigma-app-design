import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// hooks
import { useRemoveNodeMask } from 'components/Design/Menu/hooks/useRemoveNodeMask';
import { useUseSelectionAsMask } from 'components/Design/Menu/hooks/useUseSelectionAsMask';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './frame-header-buttons.module.scss';

const FrameHeaderButtons: FC = () => {
  const { t } = useTranslation();
  const [frameNode] = useAppSelector(selectSelectedNodes);
  const isMask = Boolean(frameNode?.isMask);
  const onUseAsMask = useUseSelectionAsMask();
  const onRemoveMask = useRemoveNodeMask(frameNode?.id ?? '');

  return (
    <div className={styles.FrameHeaderButtons}>
      {!isMask && (
        <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
          <Button ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
            <Icon name="HtmlTag" size={24} />
          </Button>
        </Tooltip>
      )}
      <Tooltip
        align="end"
        content={
          <Fragment>
            {t(`${translationNameSpace}.componentTooltip`)}
            <span className={styles.FrameHeaderButtons__shortcut}>{KEYBOARD_SHORTCUTS.createComponent.join('')}</span>
          </Fragment>
        }
      >
        <Button ariaLabel={t(`${translationNameSpace}.componentAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
          <Icon name="Component" size={24} />
        </Button>
      </Tooltip>
      <Tooltip
        align="end"
        content={
          <Fragment>
            {t(`${translationNameSpace}.maskTooltip`)}
            <span className={styles.FrameHeaderButtons__shortcut}>{KEYBOARD_SHORTCUTS.useAsMask.join('')}</span>
          </Fragment>
        }
      >
        <Button
          ariaLabel={t(`${translationNameSpace}.maskAriaLabel`)}
          onClick={isMask ? onRemoveMask : onUseAsMask}
          selected={isMask}
          style={{ padding: 0 }}
        >
          <Icon name="Mask" size={24} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default FrameHeaderButtons;
