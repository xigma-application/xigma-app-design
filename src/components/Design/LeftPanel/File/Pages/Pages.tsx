import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PagesList from './PagesList/PagesList';
import { Icon, Tooltip } from 'shared';

// hooks
import { useAddPage } from './hooks/useAddPage';
import { useTogglePagesExpanded } from './hooks/useTogglePagesExpanded';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from '../constants';

// store
import { selectActivePage } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './pages.module.scss';

const Pages: FC = () => {
  const activePage = useAppSelector(selectActivePage);
  const { t } = useTranslation();
  const { expand, handleStopPropagation, handleToggleClick, handleToggleKeyDown, isExpanded } = useTogglePagesExpanded();
  const { handleAddPage, pendingEditPageId } = useAddPage(expand);
  const searchLabel = t(`${translationNameSpace}.pages.searchAriaLabel`);
  const addLabel = t(`${translationNameSpace}.pages.addAriaLabel`);
  const findShortcut = KEYBOARD_SHORTCUTS.find.join('');

  return (
    <div className={styles.Pages}>
      <div
        aria-expanded={isExpanded}
        className={styles.Pages__header}
        onClick={handleToggleClick}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className={styles.Pages__toggle}>
          <Icon color="neutral2" name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
        </div>
        <span className={styles.Pages__name}>{isExpanded ? t(`${translationNameSpace}.pages.title`) : activePage.name}</span>
        <div className={styles['Pages__button-group']} onClick={handleStopPropagation}>
          <Tooltip
            content={
              <>
                {searchLabel}
                <span className={styles.Pages__shortcut}>{findShortcut}</span>
              </>
            }
          >
            <button aria-label={searchLabel} className={styles.Pages__action} type="button">
              <Icon name="Search" size={24} />
            </button>
          </Tooltip>
          <Tooltip content={addLabel}>
            <button aria-label={addLabel} className={styles.Pages__action} onClick={handleAddPage} type="button">
              <Icon name="Plus" size={24} />
            </button>
          </Tooltip>
        </div>
      </div>
      {isExpanded && <PagesList pendingEditPageId={pendingEditPageId} />}
    </div>
  );
};

export default Pages;
