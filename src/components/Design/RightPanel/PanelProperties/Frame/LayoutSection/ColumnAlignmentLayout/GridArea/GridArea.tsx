import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import GridAreaPopover from './GridAreaPopover/GridAreaPopover';
import GridAreaPreview from './GridAreaPreview';
import { UITools } from 'shared';

// hooks
import { TUseColumnGridAreaResult } from '../hooks/useColumnGridArea';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { translationNameSpace } from '../constants';

// styles
import styles from './grid-area.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

const TRIGGER_HEIGHT = 56;

export type TGridAreaProps = {
  grid: TUseColumnGridAreaResult;
};

export const GridArea: FC<TGridAreaProps> = ({ grid }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = t(`${translationNameSpace}.grid.label`);

  return (
    <UITools.Popover
      align="start"
      asChild
      avoidCollisions={false}
      className={styles.GridAreaPanel}
      onOpenChange={setOpen}
      open={open}
      side="bottom"
      sideOffset={-TRIGGER_HEIGHT}
      trigger={
        <button aria-label={label} className={styles.GridArea} type="button" {...getAttributes(E2EAttribute.gridArea, '')}>
          <GridAreaPreview columns={grid.columns} rows={grid.rows} />
        </button>
      }
      triggerTooltip={label}
    >
      <GridAreaPopover close={() => setOpen(false)} grid={grid} />
    </UITools.Popover>
  );
};

export default GridArea;
