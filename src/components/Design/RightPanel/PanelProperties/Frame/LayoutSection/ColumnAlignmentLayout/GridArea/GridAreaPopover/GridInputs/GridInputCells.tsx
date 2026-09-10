import { FC, ReactNode } from 'react';
import { kebabCase } from 'lodash';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, ScrubbableInput, Tooltip, type TIconProps } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { GRID_COUNT_MAX, GRID_COUNT_MIN } from '../CellsInput/constants';
import { translationNameSpace } from '../../../constants';

export type TGridInputCellsProps = {
  endAdornment?: ReactNode;
  iconName: TIconProps['name'];
  onCommit: TFunc<[string]>;
  value: string;
};

export const GridInputCells: FC<TGridInputCellsProps> = ({ endAdornment, iconName, onCommit, value }) => {
  const { t } = useTranslation();
  const key = kebabCase(iconName);
  const label = t(`${translationNameSpace}.grid.${key}`);

  return (
    <Tooltip content={label}>
      <UITools.TextField
        aria-label={label}
        defaultValue={value}
        e2eValue={key}
        endAdornment={endAdornment}
        onBlur={(event) => onCommit(event.target.value)}
        startAdornment={
          <ScrubbableInput
            max={GRID_COUNT_MAX}
            min={GRID_COUNT_MIN}
            onChange={(next) => onCommit(next.toString())}
            value={parseInt(value, 10) || GRID_COUNT_MIN}
          >
            <Icon name={iconName} size={12} />
          </ScrubbableInput>
        }
        type="text"
      />
    </Tooltip>
  );
};

export default GridInputCells;
