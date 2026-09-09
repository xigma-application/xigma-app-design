import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import GridAreaPopover from './GridAreaPopover/GridAreaPopover';
import GridAreaPreview from './GridAreaPreview';
import { UITools } from 'shared';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { translationNameSpace } from '../constants';

// styles
import styles from './grid-area.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TActiveCell } from './GridAreaPopover/CellsInput/types';

export type TGridAreaProps = {
  columns: string;
  onClickCell: TFunc<[TActiveCell]>;
  onCommitColumns: TFunc<[string]>;
  onCommitRows: TFunc<[string]>;
  rows: string;
};

export const GridArea: FC<TGridAreaProps> = ({ columns, rows, ...handlers }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = t(`${translationNameSpace}.grid.label`);

  return (
    <UITools.Popover
      align="start"
      asChild
      className={styles.GridAreaPanel}
      onOpenChange={setOpen}
      open={open}
      side="left"
      trigger={
        <button aria-label={label} className={styles.GridArea} type="button" {...getAttributes(E2EAttribute.gridArea, '')}>
          <GridAreaPreview columns={columns} rows={rows} />
        </button>
      }
      triggerTooltip={label}
    >
      <GridAreaPopover close={() => setOpen(false)} columns={columns} rows={rows} {...handlers} />
    </UITools.Popover>
  );
};

export default GridArea;
