export const TabType = {
  SIZES: 'sizes',
  PROCESSING: 'processing',
  SPECTRUM: 'spectrum',
  ATTRIBUTES: 'attributes',
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];

export default TabType;
