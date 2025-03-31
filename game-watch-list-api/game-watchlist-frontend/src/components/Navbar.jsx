import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import icon from "/icon.png";

const Navbar = () => {
  const { isLoggedIn, isAdmin, logout, username, deleteAccount } = useAuth();

  return (
    <AppBar position="static" sx={{ backgroundColor: "#001f3f", position: "relative" }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Button color="inherit" component={Link} to="/">
            Home/Alle Spiele
          </Button>
          {isAdmin ? (
            <Button color="inherit" component={Link} to="/admin/reviews">
              Admin Reviews
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/watchlist">
              Watchlist
            </Button>
          )}
        </Box>
        {/* Logo in der Mitte des Bildschirms */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <Link to="/">
            <img
              src={icon}
              alt="Logo"
              style={{
                height: "40px", // Höhe des Icons
                cursor: "pointer",
              }}
            />
          </Link>
        </Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          {isLoggedIn ? (
            <>
              <Typography variant="body1" sx={{ marginRight: 2 }}>
                Willkommen, {username}!
              </Typography>
              {!isAdmin && ( // Nur anzeigen, wenn der Benutzer kein Admin ist
                <Button
                  onClick={deleteAccount}
                  sx={{
                    backgroundColor: "red",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#cc0000", // Dunkleres Rot beim Hover
                    },
                    marginRight: 2, // Abstand zum Logout-Button
                  }}
                >
                  Account löschen
                </Button>
              )}
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Registrieren
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;