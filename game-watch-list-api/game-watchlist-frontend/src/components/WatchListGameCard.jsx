import React from "react";
import { Card, CardContent, CardMedia, Typography, MenuItem, Select, Button } from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";

const WatchlistGameCard = ({ game, onStatusChange, onAddReview }) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 3 }}>
      <CardMedia
        component="img"
        image={game.image_url || "https://via.placeholder.com/300"}
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
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          Beschreibung: {game.description || "Keine Beschreibung verfügbar."}
        </Typography>

        {/* Status-Auswahlfeld */}
        <Typography variant="body2" color="text.primary" sx={{ marginBottom: 1 }}>
          Status:
        </Typography>
        <Select
          value={game.status}
          onChange={(e) => onStatusChange(game.game_id, e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
        >
          <MenuItem value="will spielen">Will spielen</MenuItem>
          <MenuItem value="spiele gerade">Spiele gerade</MenuItem>
          <MenuItem value="fertig gespielt">Fertig gespielt</MenuItem>
        </Select>

        {/* Schaltfläche für Reviews */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<RateReviewIcon />}
          onClick={() => onAddReview(game)}
          sx={{ marginTop: 2, width: "100%" }}
        >
          Review hinzufügen
        </Button>
      </CardContent>
    </Card>
  );
};

export default WatchlistGameCard;