import { useEffect } from "react";
import { Alert, Box } from "@mui/material";
import useErrorStore from "../stores/error-store";

export default function ErrorNotification() {
  const isErrorShown = useErrorStore.use.isErrorShown();
  const message = useErrorStore.use.message();

  const setErrorShown = useErrorStore.use.setErrorShown();

  useEffect(() => {
    if (isErrorShown) {
      const timer = setTimeout(() => {
        setErrorShown(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isErrorShown]);

  return (
    <Box
      sx={{
        marginBottom: "1em",
        maxWidth: "min(100%, 25rem)",
        zIndex: 100,
        justifyContent: "center",
        display: isErrorShown ? "block" : "none",
      }}
    >
      <Alert variant="filled" severity="error" sx={{ whiteSpace: "pre-line" }}>
        {message}
      </Alert>
    </Box>
  );
}
