import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

const SimplifiedGameCard = ({ game }) => {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 545,
        height: "140%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        mb: 4,
      }}
    >
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
        <Typography variant="body2" color="text.secondary">
  Plattformen: {(game.platforms || []).join(", ") || "Keine Plattformen angegeben"}
</Typography>
        <Typography variant="body2" color="text.secondary">
          Beschreibung: {game.description || "Keine Beschreibung verfügbar."}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SimplifiedGameCard;