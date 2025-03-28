import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SimplifiedGameCard from "../components/SimplifiedGameCard";

const ReviewPage = () => {
  const { gameId } = useParams();
  const { userId } = useAuth();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState({
    rating: 0,
    comment: "",
    platform: "",
    playtime_hours: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchGameAndReviews = async () => {
      try {
        const gameResponse = await fetch(`http://localhost:5000/games/${gameId}`);
        const reviewsResponse = await fetch(`http://localhost:5000/review/${gameId}`);
    
        if (gameResponse.ok && reviewsResponse.ok) {
          setGame(await gameResponse.json());
          setReviews(await reviewsResponse.json());
        } else {
          alert("Fehler beim Laden der Daten.");
        }
      } catch (error) {
        console.error("Fehler:", error);
      }
    };

    fetchGameAndReviews();
  }, [gameId]);

  const handleRatingChange = (event, newValue) => {
    setUserReview({ ...userReview, rating: newValue });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserReview({ ...userReview, [name]: value });
  };

  const handleSubmitReview = async () => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(
        `http://localhost:5000/review/${userId}/review/${gameId}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userReview),
        }
      );

      if (response.ok) {
        alert(isEditing ? "Review aktualisiert!" : "Review hinzugefügt!");
        setIsEditing(false);
        setUserReview({ rating: 0, comment: "", platform: "", playtime_hours: 0 });
        const updatedReviews = await response.json();
        setReviews(updatedReviews);
        setOpenDialog(false);
      } else {
        const errorData = await response.json();
        alert(`Fehler: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Möchtest du diese Review wirklich löschen?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/review/${userId}/review/${reviewId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        alert("Review gelöscht!");
        setReviews(reviews.filter((review) => review.id !== reviewId));
      } else {
        alert("Fehler beim Löschen der Review.");
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleOpenDialog = (review = null) => {
    if (review) {
      setUserReview(review);
      setIsEditing(true);
    } else {
      setUserReview({ rating: 0, comment: "", platform: "", playtime_hours: 0 });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Überprüfen, ob der Benutzer bereits einen Kommentar verfasst hat
  const userHasReview = reviews.some((review) => String(review.user_id) === String(userId));

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container>
        {game && <SimplifiedGameCard game={game} />}

        {!userHasReview && (
          <Box sx={{ mb: 4, textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Review hinzufügen
            </Button>
          </Box>
        )}

        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Alle Reviews
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {reviews.map((review) => (
            <Card
              key={review.id}
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                overflow: "hidden",
                width: "100%",
                maxWidth: 600,
                mx: "auto",
                height: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Rating value={review.rating} readOnly precision={1} />
                  <Typography variant="body1" sx={{ ml: 2, fontWeight: "bold" }}>
                    {review.username}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  {review.comment}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Plattform:</strong> {review.platform}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Spielzeit:</strong> {review.playtime_hours} Stunden
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Gepostet am:</strong>{" "}
                  {new Date(review.posted_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              {String(review.user_id) === String(userId) && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                  <IconButton
                    color="secondary"
                    onClick={() => handleOpenDialog(review)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Card>
          ))}
        </Box>

        {/* Dialog für Review hinzufügen/bearbeiten */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle sx={{ fontWeight: "bold" }}>
            {isEditing ? "Review bearbeiten" : "Review hinzufügen"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Bewertung:
              </Typography>
              <Rating
                name="rating"
                value={userReview.rating}
                onChange={handleRatingChange}
                precision={1}
              />
            </Box>
            <TextField
              label="Kommentar"
              name="comment"
              value={userReview.comment}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Spielzeit (in Stunden)"
              name="playtime_hours"
              type="number"
              value={userReview.playtime_hours}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Select
              name="platform"
              value={userReview.platform}
              onChange={handleInputChange}
              fullWidth
              displayEmpty
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Plattform auswählen
              </MenuItem>
              <MenuItem value="PC">PC</MenuItem>
              <MenuItem value="PlayStation">PlayStation</MenuItem>
              <MenuItem value="Xbox">Xbox</MenuItem>
              <MenuItem value="Nintendo">Nintendo</MenuItem>
              <MenuItem value="Mobile">Mobile</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Abbrechen
            </Button>
            <Button onClick={handleSubmitReview} color="primary" variant="contained">
              Speichern
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ReviewPage;