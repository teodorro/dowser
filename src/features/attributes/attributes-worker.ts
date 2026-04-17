import getCoherence from './get-coherence';
import getPeakFrequencies from './get-peak-frequencies';
import getQualityFactors from './get-quality-factors';
import getSpectrumWidths from './get-spectrum-widths';
import getWindowFrequencies from './get-window-frequencies';

type RequestMessage =
  | {
      type: 'peakFrequencies';
      bscan: number[][];
      dt: number;
      windowSize: number;
    }
  | {
      type: 'spectrumWidths';
      bscan: number[][];
      dt: number;
      windowSize: number;
    }
  | {
      type: 'qualityFactors';
      bscan: number[][];
      dt: number;
      windowSize: number;
    }
  | {
      type: 'coherence';
      bscan: number[][];
      windowSize: number;
    };

self.onmessage = (e: MessageEvent<RequestMessage>) => {
  const msg = e.data;

  const windowFrequencies = getWindowFrequencies(msg.bscan, msg.windowSize);

  switch (msg.type) {
    case 'peakFrequencies': {
      const result = {
        result: getPeakFrequencies(windowFrequencies, msg.dt),
        windowFrequencies: windowFrequencies,
      };
      self.postMessage({ type: msg.type, result });
      break;
    }
    case 'spectrumWidths': {
      const result = {
        result: getSpectrumWidths(windowFrequencies, msg.dt),
        windowFrequencies: windowFrequencies,
      };
      self.postMessage({ type: msg.type, result });
      break;
    }
    case 'qualityFactors': {
      const result = {
        result: getQualityFactors(windowFrequencies, msg.dt),
        windowFrequencies: windowFrequencies,
      };
      self.postMessage({ type: msg.type, result });
      break;
    }
    case 'coherence': {
      const result = {
        result: getCoherence(msg.bscan, msg.windowSize),
        windowFrequencies: windowFrequencies,
      };
      self.postMessage({ type: msg.type, result });
      break;
    }
  }
};
