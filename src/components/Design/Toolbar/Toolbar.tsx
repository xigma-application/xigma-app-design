import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';

// components
import ActionsButton from './ActionsButton/ActionsButton';
import ActionsPanel from './ActionsButton/ActionsPanel/ActionsPanel';
import MediaToolHint from './MediaToolHint/MediaToolHint';
import MouseModes from './MouseModes/MouseModes';
import VectorEditToolbar from './VectorEditToolbar/VectorEditToolbar';

// store
import { selectIsActionsPanelOpen, selectIsUiHidden } from 'store/design/selectors';
import { setActionsPanelOpen } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// styles
import styles from './toolbar.module.scss';

const Toolbar: FC = () => {
  const dispatch = useAppDispatch();
  const isActionsPanelOpen = useAppSelector(selectIsActionsPanelOpen);
  const isUiHidden = useAppSelector(selectIsUiHidden);

  const handleActionsPanelOpenChange = (open: boolean): void => {
    dispatch(setActionsPanelOpen(open));
  };

  if (isUiHidden) {
    return null;
  }

  return (
    <PopoverPrimitive.Root onOpenChange={handleActionsPanelOpenChange} open={isActionsPanelOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div className={styles.Toolbar}>
          <MouseModes />
          <ActionsButton />
          <VectorEditToolbar />
          <MediaToolHint />
        </div>
      </PopoverPrimitive.Anchor>
      <ActionsPanel />
    </PopoverPrimitive.Root>
  );
};

export default Toolbar;
