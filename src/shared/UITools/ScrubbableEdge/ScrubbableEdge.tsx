import { FC } from 'react';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// styles
import styles from './scrubbable-edge.module.scss';

export type TScrubbableEdgeProps = {
  max: number;
  min: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  value: number;
};

export const ScrubbableEdge: FC<TScrubbableEdgeProps> = ({ max, min, onChange, onDragEnd, onDragStart, value }) => (
  <ScrubbableInput max={max} min={min} onChange={onChange} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value}>
    <span className={styles.ScrubbableEdge} data-no-drag />
  </ScrubbableInput>
);

export default ScrubbableEdge;
