import { FC, ReactNode, useState } from 'react';
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
  const [revision, setRevision] = useState(0);

  const handleCommit = (next: string): void => {
    onCommit(next);
    setRevision((current) => current + 1);
  };

  return (
    <Tooltip content={label}>
      <UITools.TextField
        aria-label={label}
        defaultValue={value}
        e2eValue={key}
        endAdornment={endAdornment}
        key={`${value}-${revision}`}
        onBlur={(event) => handleCommit(event.target.value)}
        startAdornment={
          <ScrubbableInput
            max={GRID_COUNT_MAX}
            min={GRID_COUNT_MIN}
            onChange={(next) => handleCommit(next.toString())}
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
