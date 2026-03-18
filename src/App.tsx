import './App.css';
import GprToolbar from './features/GprToolbar';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import Ascan from './features/Ascan';
import Settings from './features/Settings';
import useUiStore from './stores/ui-store';
import ErrorNotification from './components/ErrorNotification';
import BscanFftCanvas from './features/BScanFftCanvas';
import BscanCanvas from './features/BScanCanvas';
import StatusBar from './features/StatusBar';
import useBscanStore from './stores/bscan-store';
import { AttributesModeType } from './types/attributes-types';
import AttributesScan from './features/attributes/AttributesScan';

function App() {
  const ascanHidden = useUiStore.use.ascanHidden();
  const fftMode = useUiStore.use.fftMode();
  const attributesMode = useUiStore.use.attributesMode();
  const attributesModeType = useUiStore.use.attributesModeType();
  const isLoading = useUiStore.use.isLoading();

  const isDataLoaded = useBscanStore.use.bscanFullAmp().length > 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GprToolbar></GprToolbar>
      <Box
        sx={{
          width: '100%',
          height: 'calc(100% - 3em)',
          display: 'flex',
          flexDirection: 'row',
          background: '#fff',
        }}
      >
        {isDataLoaded && <Settings></Settings>}
        {isDataLoaded && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
            }}
          >
            <Box
              sx={{
                height: 'calc(100% - 2em)',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {!fftMode && !attributesMode && <BscanCanvas></BscanCanvas>}
              {fftMode && !attributesMode && <BscanFftCanvas></BscanFftCanvas>}
              {attributesMode &&
                attributesModeType === AttributesModeType.PeakFrequencies && (
                  <AttributesScan></AttributesScan>
                )}
              {!ascanHidden && <Ascan></Ascan>}
            </Box>
            <StatusBar></StatusBar>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '1em',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ErrorNotification></ErrorNotification>
      </Box>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}

export default App;
