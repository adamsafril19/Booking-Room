import React from "react";
// import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import Pages from "./Pages";
// import theme from "./theme/theme";
import "./App.css";

function App() {
  return (
    // <ThemeProvider theme={theme}>
    <AuthProvider>
      <CssBaseline />
      <Pages />
    </AuthProvider>
    /* </ThemeProvider> */
  );
}

export default App;
