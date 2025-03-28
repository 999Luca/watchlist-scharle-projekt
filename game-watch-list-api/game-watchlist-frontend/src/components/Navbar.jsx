import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, isAdmin, logout, username } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">
            Home
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
        {isLoggedIn ? (
          <>
            <Typography variant="body1" sx={{ marginRight: 2 }}>
              Willkommen, {username}!
            </Typography>
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;