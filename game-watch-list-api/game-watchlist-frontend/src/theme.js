import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#001f3f", // Dunkelblau
    },
    secondary: {
      main: "#4caf50", // Grün als Akzentfarbe
    },
    background: {
      default: "#001f3f", // Hintergrundfarbe
      paper: "#002b5c", // Kartenhintergrund
    },
    text: {
      primary: "#ffffff", // Weißer Text
      secondary: "#b0bec5", // Grauer Text
    },
  },
  typography: {
    fontFamily: '"Trebuchet MS" sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
});

export default theme;