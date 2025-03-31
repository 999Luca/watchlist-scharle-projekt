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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import SimplifiedGameCard from "../components/SimplifiedGameCard";

const AdminReviewPage = () => {
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState({});

  const fetchGameAndReviewsForAdmin = async (gameId) => {
    try {
      const gameResponse = await fetch(`http://localhost:5000/games/${gameId}`);
      const reviewsResponse = await fetch(`http://localhost:5000/review/${gameId}`);

      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        setGames((prevGames) => {
          if (!prevGames.some((game) => game.game_id === gameData.game_id)) {
            return [...prevGames, gameData];
          }
          return prevGames;
        });
      }

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews((prevReviews) => ({
          ...prevReviews,
          [gameId]: reviewsData,
        }));
      } else if (reviewsResponse.status === 404) {
        setReviews((prevReviews) => ({
          ...prevReviews,
          [gameId]: [],
        }));
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten:", error);
    }
  };

  useEffect(() => {
    const fetchAllGamesAndReviews = async () => {
      try {
        const gamesResponse = await fetch("http://localhost:5000/games");
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData);

          gamesData.forEach((game) => {
            fetchGameAndReviewsForAdmin(game.game_id);
          });
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Spiele:", error);
      }
    };

    fetchAllGamesAndReviews();
  }, []);

  const handleDeleteReview = async (userId, gameId) => {
    if (!window.confirm("Möchtest du diese Review wirklich löschen?")) return;

    try {
      const response = await fetch(`http://localhost:5000/review/${userId}/review/${gameId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Review gelöscht!");
        fetchGameAndReviewsForAdmin(gameId);
      } else {
        alert("Fehler beim Löschen der Review.");
      }
    } catch (error) {
      console.error("Fehler beim Löschen der Review:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Möchtest du diesen Benutzer wirklich löschen?")) return;

    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Benutzer gelöscht!");
        setReviews((prevReviews) => {
          const updatedReviews = { ...prevReviews };
          for (const gameId in updatedReviews) {
            updatedReviews[gameId] = updatedReviews[gameId].filter(
              (review) => review.user_id !== userId
            );
          }
          return updatedReviews;
        });
      } else {
        alert("Fehler beim Löschen des Benutzers.");
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Benutzers:", error);
    }
  };

  return (
    <Container
      sx={{
        backgroundColor: "#e8f5e9", // Leichter Grünton
        padding: 4,
        borderRadius: 3,
        boxShadow: 4,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          textAlign: "center",
          fontWeight: "bold",
          color: "primary.main",
        }}
      >
        Admin: Spiele und Reviews verwalten
      </Typography>
      {games.map((game) => (
        <Box
          key={game.game_id}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#c8d6c6", // Unterschiedlicher Grünton
            borderRadius: 3,
            boxShadow: 3,
            padding: 3,
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <SimplifiedGameCard game={game} />

          <Box sx={{ mt: 4, width: "100%" }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "primary.main",
                textAlign: "center",
              }}
            >
              Reviews
            </Typography>
            {reviews[game.game_id]?.map((review) => (
              <Card
                key={review.user_id}
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: 2,
                  backgroundColor: "#002b5c", // Primärfarbe als Hintergrund
                  color: "white", // Weißer Text
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Rating value={review.rating} readOnly precision={1}  />
                    <Typography
                      variant="body1"
                      sx={{ ml: 2, fontWeight: "bold", color: "white" }}
                    >
                      {review.username || "Unbekannter Benutzer"}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      color: "white",
                    }}
                  >
                    {review.comment}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "white" }}
                  >
                    <strong>Plattform:</strong> {review.platform}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "white" }}
                  >
                    <strong>Spielzeit:</strong> {review.playtime_hours} Stunden
                  </Typography>
                  <Typography
        variant="body2"
        sx={{ mb: 2, color: "white" }}
      >
        <strong>Gepostet am:</strong>{" "}
        {new Date(review.posted_at).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteReview(review.user_id, game.game_id)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#FF6666",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<BlockIcon />}
                      onClick={() => handleDeleteUser(review.user_id)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#d32f2f",
                        },
                      }}
                    >
                      Benutzer löschen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {(!reviews[game.game_id] || reviews[game.game_id].length === 0) && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                Keine Reviews vorhanden.
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Container>
  );
};

export default AdminReviewPage;