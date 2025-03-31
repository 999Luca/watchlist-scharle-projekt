import React, { useState } from 'react';
import { TextField, Button, Typography, Box, ToggleButton, ToggleButtonGroup, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [role, setRole] = useState('user');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = role === "admin" ? "http://localhost:5000/users/admin/login" : "http://localhost:5000/users/login";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const contentType = response.headers.get("Content-Type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        console.error("Server response is not JSON:", await response.text());
        throw new Error("Ungültige Serverantwort.");
      }

      if (response.ok) {
        alert(`Login erfolgreich als ${role}`);
        login(data.user.user_id, role === "admin", data.user.username); // Übergibt den Benutzernamen an den AuthContext
        navigate(role === "admin" ? "/" : "/watchlist"); // Weiterleitung basierend auf der Rolle
      } else {
        alert(`Fehler: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <ToggleButtonGroup
  value={role}
  exclusive
  onChange={handleRoleChange}
  sx={{
    marginBottom: 2,
    "& .MuiToggleButton-root": {
      color: "primary.main", // Text in Primary Color
      borderColor: "primary.main", // Rahmen in Primary Color
      "&.Mui-selected": {
        backgroundColor: "primary.main", // Hintergrund in Primary Color, wenn ausgewählt
        color: "#ffffff", // Weißer Text, wenn ausgewählt
      },
      "&:hover": {
        borderColor: "primary.main",
        color: "primary.main",
        backgroundColor: "rgba(0, 31, 63, 0.1)", 
      },
    },
  }}
>
  <ToggleButton value="user">User Login</ToggleButton>
  <ToggleButton value="admin">Admin Login</ToggleButton>
</ToggleButtonGroup>
      <Box
  component="form"
  onSubmit={handleSubmit}
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 2,
    width: "100%",
    maxWidth: 400,
  }}
>
  <TextField
    label="E-Mail"
    name="email"
    type="email"
    value={credentials.email}
    onChange={handleInputChange}
    required
    sx={{
      "& .MuiInputBase-input": {
        color: "#000000", // Schwarzer Text
      },
      "& .MuiInputLabel-root": {
        color: "#000000", // Schwarzes Label
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#000000", // Schwarzer Rahmen
        },
        "&:hover fieldset": {
          borderColor: "#000000", // Schwarzer Rahmen beim Hover
        },
        "&.Mui-focused fieldset": {
          borderColor: "#000000", // Schwarzer Rahmen bei Fokus
        },
      },
    }}
  />
  <TextField
    label="Passwort"
    name="password"
    type={showPassword ? "text" : "password"}
    value={credentials.password}
    onChange={handleInputChange}
    required
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={togglePasswordVisibility} edge="end">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    sx={{
      "& .MuiInputBase-input": {
        color: "#000000", // Schwarzer Text
      },
      "& .MuiInputLabel-root": {
        color: "#000000", // Schwarzes Label
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#000000", // Schwarzer Rahmen
        },
        "&:hover fieldset": {
          borderColor: "#000000", // Schwarzer Rahmen beim Hover
        },
        "&.Mui-focused fieldset": {
          borderColor: "#000000", // Schwarzer Rahmen bei Fokus
        },
      },
    }}
  />
  <Button type="submit" variant="contained" color="primary">
    Login
  </Button>
</Box>
      <Typography variant="body2" sx={{ marginTop: 2 }} color="text.secondary">
        Noch kein Konto? <a href="/register">Registrieren</a>
      </Typography>
    </Box>
  );
}

export default LoginPage;