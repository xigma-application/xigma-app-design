import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from '../constants';

// styles
import styles from './pages-header-actions.module.scss';

export type TPagesHeaderActionsProps = {
  onAddPage: TFunc;
  onStopPropagation: TFunc<[MouseEvent<HTMLElement>]>;
};

const PagesHeaderActions: FC<TPagesHeaderActionsProps> = ({ onAddPage, onStopPropagation }) => {
  const { t } = useTranslation();
  const searchLabel = t(`${translationNameSpace}.searchAriaLabel`);
  const addLabel = t(`${translationNameSpace}.addAriaLabel`);
  const findShortcut = KEYBOARD_SHORTCUTS.find.join('');

  return (
    <div className={styles.PagesHeaderActions} onClick={onStopPropagation}>
      <Tooltip
        content={
          <>
            {searchLabel}
            <span className={styles.PagesHeaderActions__shortcut}>{findShortcut}</span>
          </>
        }
      >
        <button aria-label={searchLabel} className={styles.PagesHeaderActions__action} type="button">
          <Icon name="Search" size={24} />
        </button>
      </Tooltip>
      <Tooltip content={addLabel}>
        <button aria-label={addLabel} className={styles.PagesHeaderActions__action} onClick={onAddPage} type="button">
          <Icon name="Plus" size={24} />
        </button>
      </Tooltip>
    </div>
  );
};

export default PagesHeaderActions;
