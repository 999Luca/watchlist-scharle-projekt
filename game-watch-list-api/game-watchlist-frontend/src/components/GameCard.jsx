import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import { useAuth } from "../context/AuthContext";

const GameCard = ({ game, onGameUpdated, onGameDeleted }) => {
  const { isLoggedIn, isAdmin, userId } = useAuth();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: game.title,
    genre: game.genre,
    platform: game.platform,
    release_date: game.release_date,
    image_url: game.image_url,
    description: game.description || "",
  });
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!isLoggedIn) return;

      try {
        const response = await fetch(`http://localhost:5000/watchlist/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const watchlist = data.watchlist || [];
          const exists = watchlist.some((item) => item.game_id === game.game_id);
          setIsInWatchlist(exists);
        }
      } catch (error) {
        console.error("Fehler beim Überprüfen der Watchlist:", error);
      }
    };

    checkWatchlist();
  }, [isLoggedIn, userId, game.game_id]);

  const handleAddToWatchlist = async () => {
    if (!isLoggedIn) {
      alert("Bitte logge dich ein, um Spiele zur Watchlist hinzuzufügen.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/watchlist/${userId}/add/${game.game_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "will spielen" }),
      });

      if (response.ok) {
        alert("Spiel erfolgreich zur Watchlist hinzugefügt!");
        setIsInWatchlist(true);
      } else {
        const data = await response.json();
        alert(`Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen zur Watchlist:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  const handleEditGame = async () => {
    try {
      const response = await fetch(`http://localhost:5000/games/${game.game_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedGame = await response.json();
        alert("Spiel erfolgreich aktualisiert!");
        setOpenEditDialog(false);
        onGameUpdated(updatedGame.game);
      } else {
        const data = await response.json();
        alert(`Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Bearbeiten des Spiels:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  const handleDeleteGame = async () => {
    if (!window.confirm("Möchtest du dieses Spiel wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/games/${game.game_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Spiel erfolgreich gelöscht!");
        onGameDeleted(game.game_id);
      } else {
        const data = await response.json();
        alert(`Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Spiels:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 345,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardMedia
        component="img"
        image={game.image_url || "https://via.placeholder.com/300"}
        alt={game.title}
        sx={{ height: 200 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {game.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genre: {game.genre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform: {game.platform || "Backendverknüüpfung fehlt hier iwi"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Release: {game.release_date}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Beschreibung: {game.description || "Keine Beschreibung verfügbar."}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", marginTop: 2 }}
        >
          <StarIcon sx={{ color: "#FFD700", marginRight: 0.5 }} />
          {game.average_rating || "N/A"}
          {game.reviews_count > 0 && (
            <span style={{ marginLeft: 4 }}>
              ({game.reviews_count} Bewertung{game.reviews_count > 1 ? "en" : ""})
            </span>
          )}
        </Typography>
      </CardContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 2 }}>
        {isInWatchlist && (
          <Typography variant="caption" color="text.secondary" sx={{ marginRight: 1 }}>
            Bereits in der Watchlist
          </Typography>
        )}
        <IconButton
          color="primary"
          onClick={handleAddToWatchlist}
          aria-label="Zur Watchlist hinzufügen"
          disabled={isInWatchlist}
        >
          <AddCircleOutlineIcon />
        </IconButton>
        {isAdmin && (
          <>
            <IconButton
              color="secondary"
              onClick={() => setOpenEditDialog(true)}
              aria-label="Spiel bearbeiten"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={handleDeleteGame}
              aria-label="Spiel löschen"
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Spiel bearbeiten</DialogTitle>
        <DialogContent>
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
            label="Platform"
            name="platform"
            value={formData.platform}
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
            label="Beschreibung"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Abbrechen
          </Button>
          <Button onClick={handleEditGame} color="primary" variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default GameCard;