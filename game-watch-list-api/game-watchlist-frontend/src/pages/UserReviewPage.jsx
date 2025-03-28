import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
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

  return (
    <Container>
      {game && (
        <>
          {/* Game Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h4">{game.title}</Typography>
              <Typography variant="subtitle1">{game.genre}</Typography>
              <Typography variant="body2">{game.description}</Typography>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4">{game.title}</Typography>
            <Typography variant="subtitle1">{game.genre}</Typography>
          </Box>
        </>
      )}

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

      <Typography variant="h5" sx={{ mb: 2 }}>
        Alle Reviews
      </Typography>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} sm={6} md={4} key={review.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    Bewertung:
                  </Typography>
                  <Rating value={review.rating} readOnly precision={1} />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Kommentar:</strong> {review.comment}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Plattform:</strong> {review.platform}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Spielzeit:</strong> {review.playtime_hours} Stunden
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Benutzer:</strong> {review.username}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Gepostet am:</strong> {new Date(review.posted_at).toLocaleDateString()}
                </Typography>
                {review.user_id === userId && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog für Review hinzufügen/bearbeiten */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
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
  );
};

export default ReviewPage;