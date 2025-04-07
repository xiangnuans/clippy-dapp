"use client";

import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3730A3 !important",
    },
    mode: "dark",
    background: {
      paper: "#141416",
      default: "#0A0A0B",
    },
    text: {
      primary: "#FFFFFF !important",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "12px !important",
          backgroundColor: "#3730A3 !important",
          color: "#FFFFFF !important",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#141416 !important",
          borderRadius: "16px !important",
          color: "#FFFFFF !important",
        },
      },
    },
  },
});

export function MuiWalletSelector() {
  return (
    <ThemeProvider theme={theme}>
      <WalletConnector />
    </ThemeProvider>
  );
}
