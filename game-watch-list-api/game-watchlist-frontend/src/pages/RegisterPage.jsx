import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registrierung erfolgreich!');
        navigate('/login');
      } else {
        alert(`Fehler: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert('Ein Fehler ist aufgetreten.');
    }
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
        Registrierung
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <TextField
          label="Benutzername"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          sx={{
            "& .MuiInputBase-input": {
              color: "primary.main", // Text in Primary Color
            },
            "& .MuiInputLabel-root": {
              color: "primary.main", // Label in Primary Color
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color
              },
              "&:hover fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color beim Hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color bei Fokus
              },
            },
          }}
        />
        <TextField
          label="E-Mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          sx={{
            "& .MuiInputBase-input": {
              color: "primary.main", // Text in Primary Color
            },
            "& .MuiInputLabel-root": {
              color: "primary.main", // Label in Primary Color
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color
              },
              "&:hover fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color beim Hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color bei Fokus
              },
            },
          }}
        />
        <TextField
          label="Passwort"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          sx={{
            "& .MuiInputBase-input": {
              color: "primary.main", // Text in Primary Color
            },
            "& .MuiInputLabel-root": {
              color: "primary.main", // Label in Primary Color
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color
              },
              "&:hover fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color beim Hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main", // Rahmen in Primary Color bei Fokus
              },
            },
          }}
        />
        <Button type="submit" variant="contained" color="primary">
          Registrieren
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterPage;