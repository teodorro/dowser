import './App.css';
import GprToolbar from './features/GprToolbar';
import { Box } from '@mui/material';
import Ascan from './features/Ascan';
import Settings from './features/Settings';
import useUiStore from './stores/ui-store';
import ErrorNotification from './components/ErrorNotification';
import BscanFft from './features/BscanFft';
import BscanCanvas from './features/BScanCanvas';
import StatusBar from './features/StatusBar';
import useBscanStore from './stores/bscan-store';

function App() {
  const ascanHidden = useUiStore.use.ascanHidden();
  const fftMode = useUiStore.use.fftMode();

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
        {/* {!fftMode && <Bscan rotated={true}></Bscan>} */}
        {/* <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!fftMode && <BscanCanvas></BscanCanvas>}
          <StatusBar></StatusBar>
        </Box>
        {fftMode && <BscanFft rotated={true}></BscanFft>}
        {!ascanHidden && <Ascan></Ascan>} */}
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
              {!fftMode && <BscanCanvas></BscanCanvas>}
              {fftMode && <BscanFft rotated={true}></BscanFft>}
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
    </Box>
  );
}

export default App;
