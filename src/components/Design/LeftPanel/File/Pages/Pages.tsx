import { FC } from 'react';

// components
import PageRowMenu from './PagesList/PageRow/PageRowMenu';
import PagesHeaderActions from './PagesHeaderActions/PagesHeaderActions';
import PagesHeaderTitle from './PagesHeaderTitle/PagesHeaderTitle';
import PagesList from './PagesList/PagesList';

// hooks
import { useAddPage } from './hooks/useAddPage';
import { useHeaderPageMenu } from './hooks/useHeaderPageMenu';
import { useTogglePagesExpanded } from './hooks/useTogglePagesExpanded';

// store
import { selectActivePage } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './pages.module.scss';

const Pages: FC = () => {
  const activePage = useAppSelector(selectActivePage);
  const { expand, handleStopPropagation, handleToggleClick, handleToggleKeyDown, isExpanded } = useTogglePagesExpanded();
  const { handleAddPage, pendingEditPageId } = useAddPage(expand);
  const headerMenu = useHeaderPageMenu(!isExpanded);

  return (
    <div className={styles.Pages}>
      <div
        aria-expanded={isExpanded}
        className={styles.Pages__header}
        onClick={handleToggleClick}
        onContextMenu={headerMenu.onContextMenu}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
      >
        <PagesHeaderTitle activePageName={activePage.name} isExpanded={isExpanded} />
        <PagesHeaderActions onAddPage={handleAddPage} onStopPropagation={handleStopPropagation} />
      </div>
      {isExpanded && <PagesList pendingEditPageId={pendingEditPageId} />}
      <PageRowMenu
        anchorRef={headerMenu.anchorRef}
        id={activePage.id}
        isOpen={headerMenu.isOpen}
        onOpenChange={headerMenu.onOpenChange}
        onRename={expand}
      />
    </div>
  );
};

export default Pages;
