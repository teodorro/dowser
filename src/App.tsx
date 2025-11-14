import './App.css';
import GprToolbar from './GprToolbar';
import { Box } from '@mui/material';
import Bscan from './BScan';
import DataSettings from './DataSettings';
import Bscand3 from './Bscand3';

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
        <DataSettings></DataSettings>
        <Bscand3 rotated={true}></Bscand3>
      </Box>
    </Box>
  );
}

export default App;
