import React, { useEffect, useState } from "react";
import {
  Grid,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import GameCard from "../components/GameCard";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [games, setGames] = useState([]);
  const { isLoggedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStars, setSelectedStars] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("http://localhost:5000/games");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    };

    const fetchAdminStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus);
    };

    fetchGames();
    if (isLoggedIn) {
      fetchAdminStatus();
    }
  }, [isLoggedIn]);

  const filteredGames = games.filter((game) => {
    return (
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStars ? game.stars === parseInt(selectedStars) : true) &&
      (selectedPlatform ? game.platform === selectedPlatform : true)
    );
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Alle Spiele
      </Typography>

      {/* Filtermenü */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Nach Name suchen"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Anzahl Sterne</InputLabel>
            <Select
              value={selectedStars}
              onChange={(e) => setSelectedStars(e.target.value)}
            >
              <MenuItem value="">Alle</MenuItem>
              <MenuItem value={1}>1 Stern</MenuItem>
              <MenuItem value={2}>2 Sterne</MenuItem>
              <MenuItem value={3}>3 Sterne</MenuItem>
              <MenuItem value={4}>4 Sterne</MenuItem>
              <MenuItem value={5}>5 Sterne</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Plattform</InputLabel>
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <MenuItem value="">Alle</MenuItem>
              <MenuItem value="PC">PC</MenuItem>
              <MenuItem value="PlayStation">PlayStation</MenuItem>
              <MenuItem value="Xbox">Xbox</MenuItem>
              <MenuItem value="Nintendo Switch">Nintendo Switch</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {isAdmin && (
        <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ marginBottom: 2 }}>
          Spiel hinzufügen
        </Button>
      )}

      <Grid container spacing={4}>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <Grid item key={game.game_id} xs={12} sm={6} md={4}>
              <GameCard game={game} />
            </Grid>
          ))
        ) : (
          <Typography variant="h6" align="center" sx={{ width: "100%", mt: 4 }}>
            Keine Spiele gefunden.
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Home;