import "./App.css";
import GprToolbar from "./features/GprToolbar";
import { Box } from "@mui/material";
import Bscan from "./features/BScan";
import Ascan from "./features/Ascan";
import Settings from "./features/Settings";
import useUiStore from "./stores/ui-store";
import ErrorNotification from "./components/ErrorNotification";

function App() {
  const ascanHidden = useUiStore.use.ascanHidden();

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GprToolbar></GprToolbar>
      <Box
        sx={{
          width: "100%",
          height: "calc(100% - 4em)",
          display: "flex",
          flexDirection: "row",
          background: "#fff",
        }}
      >
        <Settings></Settings>
        <Bscan rotated={true}></Bscan>
        {!ascanHidden && <Ascan></Ascan>}
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "1em",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ErrorNotification></ErrorNotification>
      </Box>
    </Box>
  );
}

export default App;
