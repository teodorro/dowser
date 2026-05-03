import { AttributesModeType } from './attributes-types';

export type ViewType =
  | { type: 'bscan' }
  | { type: 'fft' }
  | { type: 'attributes'; mode: AttributesModeType };
