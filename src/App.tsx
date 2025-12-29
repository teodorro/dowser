import './App.css';
import GprToolbar from './features/GprToolbar';
import { Box } from '@mui/material';
import Bscan from './features/BScan';
import Ascan from './features/Ascan';
import Settings from './features/Settings';

function App() {
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
          height: 'calc(100% - 4em)',
          display: 'flex',
          flexDirection: 'row',
          background: '#fff',
        }}
      >
        <Settings></Settings>
        <Bscan rotated={true}></Bscan>
        <Ascan></Ascan>
      </Box>
    </Box>
  );
}

export default App;
