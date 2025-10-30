import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff",
      contrastText: "#1a1a1a",
    },
    secondary: {
      main: "#666666",
    },
    background: {
      default: "#1a1a1a",
      paper: "rgba(40, 40, 40, 0.8)",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(50, 50, 50, 0.5)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(50, 50, 50, 0.5)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "12px 24px",
        },
        text: {
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});
