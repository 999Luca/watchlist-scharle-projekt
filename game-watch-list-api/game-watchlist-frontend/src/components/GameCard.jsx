import React from "react";
import { Card, CardContent, CardMedia, Typography, IconButton } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import StarIcon from "@mui/icons-material/Star"; // Icon für das Rating
import { useAuth } from "../context/AuthContext"; // Importiere den AuthContext

const GameCard = ({ game }) => {
  const { isLoggedIn, userId } = useAuth(); // Überprüfe, ob der Benutzer eingeloggt ist

  const handleAddToWatchlist = async () => {
    if (!isLoggedIn) {
      alert("Bitte logge dich ein, um Spiele zur Watchlist hinzuzufügen.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/watchlist/${userId}/add/${game.game_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "will spielen" }), // Standardstatus
      });

      if (response.ok) {
        alert("Spiel erfolgreich zur Watchlist hinzugefügt!");
      } else {
        const data = await response.json();
        alert(`Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen zur Watchlist:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        image={game.image_url || "https://via.placeholder.com/300"} // Platzhalterbild, falls kein Bild vorhanden
        alt={game.title}
        sx={{ height: 200 }}
      />
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {game.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genre: {game.genre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Release: {game.release_date}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Beschreibung: {game.description || "Keine Beschreibung verfügbar."}
        </Typography>

        {/* Rating und Anzahl der Bewertungen */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", marginTop: 2 }}
        >
          <StarIcon sx={{ color: "#FFD700", marginRight: 0.5 }} /> {/* Goldener Stern für das Rating */}
          {game.average_rating || "N/A"} {/* Durchschnittsbewertung */}
          {game.reviews_count > 0 && (
            <span style={{ marginLeft: 4 }}>
              ({game.reviews_count} Bewertung{game.reviews_count > 1 ? "en" : ""})
            </span>
          )}
        </Typography>

        <IconButton
          color="primary"
          onClick={handleAddToWatchlist}
          sx={{ marginTop: 2 }}
          aria-label="Zur Watchlist hinzufügen"
        >
          <AddCircleOutlineIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default GameCard;