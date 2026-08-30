export type TTreeItem = {
  id: string;
};

export type TTreeRow<T extends TTreeItem> = {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  item: T;
  parentItem: T | null;
};

export type TDropDepthRange = {
  max: number;
  min: number;
};
