import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("http://localhost:5000/review/all");
        if (response.ok) {
          setReviews(await response.json());
        } else {
          alert("Fehler beim Laden der Reviews.");
        }
      } catch (error) {
        console.error("Fehler:", error);
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Möchtest du diese Review wirklich löschen?")) return;

    try {
      const response = await fetch(`http://localhost:5000/review/${reviewId}`, {
        method: "DELETE",
      });

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

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin: Alle Reviews
      </Typography>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} sm={6} md={4} key={review.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">Spiel: {review.gameTitle}</Typography>
                <Typography variant="body2">Bewertung: {review.rating}</Typography>
                <Typography variant="body2">{review.comment}</Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminReviewsPage;