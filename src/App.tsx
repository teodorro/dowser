import './App.css';
import GprToolbar from './GprToolbar';
import { Box } from '@mui/material';
import Bscan from './BScan';

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
      <Box sx={{ height: '100%', width: '100%' }}>
        <GprToolbar></GprToolbar>
        <Bscan rotated={true}></Bscan>
      </Box>
    </Box>
  );
}

export default App;
