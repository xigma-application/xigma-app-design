import { Fragment, ReactElement } from 'react';

// components
import DropdownOption from '../DropdownOption/DropdownOption';

// hooks
import { useHighlightDropdownOption } from '../hooks/useHighlightDropdownOption';
import { useSelectDropdownOption } from '../hooks/useSelectDropdownOption';

// styles
import styles from './dropdown-panel.module.scss';

// types
import { TDropdownOption } from '../types';

export type TDropdownPanelProps<TValue extends string> = {
  highlightedIndex: number;
  menuMaxHeight?: number;
  menuWidth?: number;
  onHighlight: TFunc<[number]>;
  onSelect: TFunc<[TValue]>;
  options: TDropdownOption<TValue>[];
  value: TValue;
};

export const DropdownPanel = <TValue extends string>({
  highlightedIndex,
  menuMaxHeight,
  menuWidth,
  onHighlight,
  onSelect,
  options,
  value,
}: TDropdownPanelProps<TValue>): ReactElement => {
  const handleSelect = useSelectDropdownOption(onSelect);
  const handleHighlight = useHighlightDropdownOption(onHighlight);

  return (
    <div
      className={styles.DropdownPanel}
      style={{ maxHeight: menuMaxHeight, overflowY: menuMaxHeight ? 'auto' : undefined, width: menuWidth }}
    >
      {options.map((option, index) => (
        <Fragment key={option.value}>
          {option.separatorBefore && <div className={styles.DropdownPanel__separator} />}
          <DropdownOption
            content={option.content}
            highlighted={index === highlightedIndex}
            icon={option.icon}
            iconSize={option.iconSize}
            label={option.label}
            onClick={handleSelect(option.value)}
            onMouseEnter={handleHighlight(index)}
            selected={option.value === value}
          />
        </Fragment>
      ))}
    </div>
  );
};

export default DropdownPanel;
