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
} from "@mui/material";
import GameCard from "../components/GameCard"; // Importiere die GameCard-Komponente
import { useAuth } from "../context/AuthContext"; // Importiere den AuthContext

const Home = () => {
  const [games, setGames] = useState([]);
  const { isLoggedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false); // Zustand für Admin-Status
  const [open, setOpen] = useState(false); // Zustand für den Dialog
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    release_date: "",
    image_url: "",
    description: "", // Neues Feld für die Beschreibung
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log("Fetching games from API...");
        const response = await fetch("http://localhost:5000/games");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched games:", data); // Debugging-Log
        setGames(data);
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    };

    const fetchAdminStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus); // Admin-Status setzen
      console.log("Admin-Status aus localStorage:", adminStatus); // Debugging-Log
    };

    // Spiele immer abrufen
    fetchGames();

    // Admin-Status nur abrufen, wenn der Benutzer eingeloggt ist
    if (isLoggedIn) {
      console.log("User is logged in. Fetching admin status.");
      fetchAdminStatus();
    }
  }, [isLoggedIn]);

  const handleOpen = () => setOpen(true); // Dialog öffnen
  const handleClose = () => setOpen(false); // Dialog schließen

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting new game:", formData); // Debugging-Log
      const response = await fetch("http://localhost:5000/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Sende das gesamte formData-Objekt, einschließlich der Beschreibung
      });

      if (response.ok) {
        alert("Spiel erfolgreich hinzugefügt!");
        setOpen(false); // Dialog schließen
        setFormData({ title: "", genre: "", release_date: "", image_url: "", description: "" }); // Formular zurücksetzen
        const newGame = await response.json();
        console.log("New game added:", newGame); // Debugging-Log
        setGames((prevGames) => [...prevGames, newGame]); // Neues Spiel zur Liste hinzufügen
      } else {
        const data = await response.json();
        alert(`Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Spiels:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  const handleGameUpdated = (updatedGame) => {
    setGames((prevGames) =>
      prevGames.map((game) => (game.game_id === updatedGame.game_id ? updatedGame : game))
    );
  };

  const handleGameDeleted = (deletedGameId) => {
    setGames((prevGames) => prevGames.filter((game) => game.game_id !== deletedGameId));
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Alle Spiele
      </Typography>

      {/* Debugging-Log für Admin-Status */}
      {console.log("Rendering: isAdmin =", isAdmin)}

      {/* Button nur für Admins */}
      {isAdmin && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{ marginBottom: 2 }}
        >
          Spiel hinzufügen
        </Button>
      )}

      {/* Dialog für das Hinzufügen eines Spiels */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Spiel hinzufügen</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Titel"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Release-Datum"
              name="release_date"
              type="date"
              value={formData.release_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Bild-URL"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Beschreibung" // Neues Textfeld für die Beschreibung
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={4} // Mehrzeiliges Eingabefeld
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={4}>
        {games.length > 0 ? (
          games.map((game) => (
            <Grid item key={game.game_id} xs={12} sm={6} md={4}>
              <GameCard game={game} onGameUpdated={handleGameUpdated} onGameDeleted={handleGameDeleted} />
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