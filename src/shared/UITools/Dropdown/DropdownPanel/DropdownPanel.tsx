import { ReactElement } from 'react';

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
  onHighlight: TFunc<[number]>;
  onSelect: TFunc<[TValue]>;
  options: TDropdownOption<TValue>[];
  value: TValue;
};

export const DropdownPanel = <TValue extends string>({
  highlightedIndex,
  onHighlight,
  onSelect,
  options,
  value,
}: TDropdownPanelProps<TValue>): ReactElement => {
  const handleSelect = useSelectDropdownOption(onSelect);
  const handleHighlight = useHighlightDropdownOption(onHighlight);

  return (
    <div className={styles.DropdownPanel}>
      {options.map((option, index) => (
        <DropdownOption
          highlighted={index === highlightedIndex}
          key={option.value}
          label={option.label}
          onClick={handleSelect(option.value)}
          onMouseEnter={handleHighlight(index)}
          selected={option.value === value}
        />
      ))}
    </div>
  );
};

export default DropdownPanel;
