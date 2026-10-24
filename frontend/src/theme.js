import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#60A5FA" },
    warning: { main: "#FBBF24" },
    error: { main: "#F87171" },
    success: { main: "#34D399" },

    background: {
      default: "#0B1220",
      paper: "#111C2E",
    },

    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },

    divider: "#26344A",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h6: {
      fontWeight: 700,
    },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #26344A",
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;