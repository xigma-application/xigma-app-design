// types
import { TSmartSelectionGridLayout } from 'types/design/smartSelection/types';

export type TGridAppendCandidate = { layout: TSmartSelectionGridLayout; outlierId: string };

export type TGridAppendTarget = { column: number; height: number; row: number; width: number; x: number; y: number };
