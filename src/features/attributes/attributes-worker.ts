import getPeakFrequencies from './get-peak-frequencies';
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
    };

self.onmessage = (e: MessageEvent<RequestMessage>) => {
  const msg = e.data;

  const windowFrequencies = getWindowFrequencies(msg.bscan, msg.windowSize);

  switch (msg.type) {
    case 'peakFrequencies': {
      const result = getPeakFrequencies(windowFrequencies, msg.dt);
      self.postMessage({ type: msg.type, result });
      break;
    }
    case 'spectrumWidths': {
      const result = getSpectrumWidths(windowFrequencies, msg.dt);
      self.postMessage({ type: msg.type, result });
      break;
    }
  }
};
