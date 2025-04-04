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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite"; // Neues Icon importieren
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GameCard = ({ game, onGameUpdated, onGameDeleted }) => {
  const { isLoggedIn, isAdmin, userId } = useAuth();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: game.title || "",
    genre: game.genre || "",
    platforms: game.platforms || [],
    release_date: game.release_date || "",
    image_url: game.image_url || "",
    description: game.description || "",
  });
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const navigate = useNavigate();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlatformChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, platforms: typeof value === "string" ? value.split(",") : value });
  };

  const handleEditGame = async () => {
    if (
      !formData.title.trim() ||
      !formData.genre.trim() ||
      formData.platforms.length === 0 ||
      !formData.release_date.trim() ||
      !formData.image_url.trim() ||
      !formData.description.trim()
    ) {
      alert("Bitte fülle alle Felder aus!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/games/${game.game_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          platforms: formData.platforms.map((platform) => platform.trim()),
        }),
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

  const handleAddToWatchlist = async () => {
    try {
      const response = await fetch(`http://localhost:5000/watchlist/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: game.game_id, status: "will spielen" }),
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

  const handleRemoveFromWatchlist = async () => {
    try {
      const response = await fetch(`http://localhost:5000/watchlist/${userId}/${game.game_id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("Spiel erfolgreich aus der Watchlist entfernt!");
        window.location.reload(); // Seite neu laden
      } else {
        const errorData = await response.json();
        alert(`Fehler: ${errorData.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Entfernen des Spiels aus der Watchlist:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };

  const handleNavigateToReviews = () => {
    if (!isAdmin) {
      navigate(`/review/${game.game_id}`); // Weiterleitung zur UserReviewPage
    }
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
  <Typography
  variant="body1"
  color="text.primary"
  sx={{ marginBottom: 2, textAlign: "justify" }} // Blocksatz hinzufügen
>
  {game.description || "Keine Beschreibung verfügbar."}
</Typography>
  <Typography variant="body2" color="text.secondary">
    Genre: {game.genre}
  </Typography>
  <Typography variant="body2" color="text.secondary">
    Plattformen: {(game.platforms || []).join(", ")}
  </Typography>
  <Typography variant="body2" color="text.secondary">
    Release: {game.release_date}
  </Typography>

  <Typography
    variant="body2"
    color="text.secondary"
    sx={{
      display: "flex",
      alignItems: "center",
      marginTop: 2,
      cursor: !isAdmin ? "pointer" : "default", // Zeige den Cursor nur für nicht-Admins
    }}
    onClick={handleNavigateToReviews} // Klick-Handler
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
  {isLoggedIn && !isAdmin && (
    <>
      {!isInWatchlist ? (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      color: "#4caf50", // Gleiche grüne Farbe wie das Icon
      flexDirection: "row-reverse", // Text links vom Icon
      gap: 1, // Abstand zwischen Text und Icon
    }}
    onClick={handleAddToWatchlist}
  >
    <IconButton
      sx={{ color: "#4caf50" }}
      aria-label="Zur Watchlist hinzufügen"
    >
      <FavoriteIcon />
    </IconButton>
    <Typography
      variant="body2"
      sx={{ color: "#4caf50", fontWeight: "bold" }}
    >
      Zur Watchlist hinzufügen
    </Typography>
  </Box>
) : (
  <Typography
    variant="body2"
    color="text.secondary"
    sx={{ display: "flex", alignItems: "center", marginRight: 2 }}
  >
    Spiel bereits in der Watchlist
    <IconButton color="disabled" aria-label="Bereits in der Watchlist" disabled>
      <FavoriteIcon />
    </IconButton>
  </Typography>
)}
    </>
  )}
  {isAdmin && (
    <IconButton
      color="secondary"
      onClick={() => setOpenEditDialog(true)}
      aria-label="Spiel bearbeiten"
    >
      <EditIcon />
    </IconButton>
  )}
  {isAdmin && (
    <IconButton
      color="error"
      onClick={() => onGameDeleted(game.game_id)}
      aria-label="Spiel löschen"
    >
      <DeleteIcon />
    </IconButton>
  )}
</Box>

<Dialog
  open={openEditDialog}
  onClose={() => setOpenEditDialog(false)}
  sx={{
    "& .MuiPaper-root": {
      border: "2px solid", // Rahmen
      borderColor: "primary.main", // Rahmenfarbe
      borderRadius: "8px", // Abgerundete Ecken
      backgroundColor: "white", // Weißer Hintergrund
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      color: "primary.main", // Schriftfarbe in Primärfarbe
    }}
  >
    Spiel bearbeiten
  </DialogTitle>
  <DialogContent>
    <TextField
      label="Titel"
      name="title"
      value={formData.title}
      onChange={handleInputChange}
      fullWidth
      margin="normal"
      required
      sx={{
        "& .MuiInputBase-input": {
          color: "primary.main", // Textfarbe
        },
        "& .MuiInputLabel-root": {
          color: "primary.main", // Label-Farbe
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.main", // Rahmenfarbe
          },
          "&:hover fieldset": {
            borderColor: "primary.main", // Rahmenfarbe beim Hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main", // Rahmenfarbe bei Fokus
          },
        },
      }}
    />
    <TextField
      label="Genre"
      name="genre"
      value={formData.genre}
      onChange={handleInputChange}
      fullWidth
      margin="normal"
      required
      sx={{
        "& .MuiInputBase-input": {
          color: "primary.main", // Textfarbe
        },
        "& .MuiInputLabel-root": {
          color: "primary.main", // Label-Farbe
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.main", // Rahmenfarbe
          },
          "&:hover fieldset": {
            borderColor: "primary.main", // Rahmenfarbe beim Hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main", // Rahmenfarbe bei Fokus
          },
        },
      }}
    />
    <FormControl fullWidth margin="normal">
      <InputLabel sx={{ color: "primary.main" }}>Plattformen</InputLabel>
      <Select
        multiple
        name="platforms"
        value={formData.platforms}
        onChange={handlePlatformChange}
        renderValue={(selected) => selected.join(", ")}
        sx={{
          "& .MuiSelect-select": {
            color: "primary.main", // Textfarbe
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main", // Rahmenfarbe
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main", // Rahmenfarbe beim Hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main", // Rahmenfarbe bei Fokus
          },
          "& .MuiSvgIcon-root": {
            color: "primary.main", // Dropdown-Pfeil-Farbe
          },
        }}
      >
        <MenuItem value="PC">
          <Checkbox
            checked={formData.platforms.includes("PC")}
            sx={{
              color: "primary.main", // Standardfarbe
              "&.Mui-checked": {
                color: "primary.main", // Farbe, wenn ausgewählt
              },
            }}
          />
          <ListItemText primary="PC" />
        </MenuItem>
        <MenuItem value="PlayStation">
          <Checkbox
            checked={formData.platforms.includes("PlayStation")}
            sx={{
              color: "primary.main", // Standardfarbe
              "&.Mui-checked": {
                color: "primary.main", // Farbe, wenn ausgewählt
              },
            }}
          />
          <ListItemText primary="PlayStation" />
        </MenuItem>
        <MenuItem value="Xbox">
          <Checkbox
            checked={formData.platforms.includes("Xbox")}
            sx={{
              color: "primary.main", // Standardfarbe
              "&.Mui-checked": {
                color: "primary.main", // Farbe, wenn ausgewählt
              },
            }}
          />
          <ListItemText primary="Xbox" />
        </MenuItem>
        <MenuItem value="Nintendo Switch">
          <Checkbox
            checked={formData.platforms.includes("Nintendo Switch")}
            sx={{
              color: "primary.main", // Standardfarbe
              "&.Mui-checked": {
                color: "primary.main", // Farbe, wenn ausgewählt
              },
            }}
          />
          <ListItemText primary="Nintendo Switch" />
        </MenuItem>
      </Select>
    </FormControl>
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
      sx={{
        "& .MuiInputBase-input": {
          color: "primary.main", // Textfarbe
        },
        "& .MuiInputLabel-root": {
          color: "primary.main", // Label-Farbe
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.main", // Rahmenfarbe
          },
          "&:hover fieldset": {
            borderColor: "primary.main", // Rahmenfarbe beim Hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main", // Rahmenfarbe bei Fokus
          },
        },
      }}
    />
    <TextField
      label="Bild-URL"
      name="image_url"
      value={formData.image_url}
      onChange={handleInputChange}
      fullWidth
      margin="normal"
      required
      sx={{
        "& .MuiInputBase-input": {
          color: "primary.main", // Textfarbe
        },
        "& .MuiInputLabel-root": {
          color: "primary.main", // Label-Farbe
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.main", // Rahmenfarbe
          },
          "&:hover fieldset": {
            borderColor: "primary.main", // Rahmenfarbe beim Hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main", // Rahmenfarbe bei Fokus
          },
        },
      }}
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
      sx={{
        "& .MuiInputBase-input": {
          color: "primary.main", // Textfarbe
        },
        "& .MuiInputLabel-root": {
          color: "primary.main", // Label-Farbe
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.main", // Rahmenfarbe
          },
          "&:hover fieldset": {
            borderColor: "primary.main", // Rahmenfarbe beim Hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main", // Rahmenfarbe bei Fokus
          },
        },
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEditDialog(false)} color="error">
      Abbrechen
    </Button>
    <Button onClick={handleEditGame} color="secondary" variant="contained">
      Speichern
    </Button>
  </DialogActions>
</Dialog>
    </Card>
  );
};

export default GameCard;