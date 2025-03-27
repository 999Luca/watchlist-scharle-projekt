import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// DynamoDB Client initialisieren
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-central-1",
});
const docClient = DynamoDBDocumentClient.from(client);

// ✅ Bewertung, Kommentar und Spielzeit hinzufügen oder aktualisieren
router.post("/:user_id/review/:game_id", async (req, res) => {
    const { user_id, game_id } = req.params;
    const { rating, comment, playtime_hours } = req.body;
  
    // Validierung der Eingaben
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Ungültige Bewertung! Die Bewertung muss eine ganze Zahl zwischen 1 und 5 sein." });
    }
  
    if (typeof comment !== "string" || comment.trim() === "") {
      return res.status(400).json({ error: "Ungültiger Kommentar! Der Kommentar darf nicht leer sein." });
    }
  
    if (!Number.isFinite(playtime_hours) || playtime_hours < 0) {
      return res.status(400).json({ error: "Ungültige Spielzeit! Die Spielzeit muss eine positive Zahl sein." });
    }
  
    try {
      // Überprüfen, ob der Status des Spiels in der Watchlist nicht "will spielen" ist
      const watchlistParams = {
        TableName: "Watchlist",
        KeyConditionExpression: "user_id = :user_id AND game_id = :game_id",
        ExpressionAttributeValues: {
          ":user_id": user_id,
          ":game_id": game_id,
        },
      };
      
      const watchlistResult = await docClient.send(new QueryCommand(watchlistParams));
      
      if (!watchlistResult.Items || watchlistResult.Items.length === 0) {
        return res.status(404).json({ error: "Spiel nicht in der Watchlist gefunden!" });
      }
      
      const watchlistItem = watchlistResult.Items[0];
      if (watchlistItem.status === "will spielen") {
        return res.status(400).json({ error: "Bewertungen können nur abgegeben werden, wenn der Status des Spiels nicht 'will spielen' ist." });
      }
  
      // Überprüfen, ob der Benutzer bereits eine Bewertung abgegeben hat
      const queryParams = {
        TableName: "Reviews",
        KeyConditionExpression: "user_id = :user_id AND game_id = :game_id",
        ExpressionAttributeValues: {
          ":user_id": user_id,
          ":game_id": game_id,
        },
      };
  
      const queryResult = await docClient.send(new QueryCommand(queryParams));
  
      let previousRating = null;
      if (queryResult.Items && queryResult.Items.length > 0) {
        previousRating = queryResult.Items[0].rating;
  
        // Bewertung existiert bereits, aktualisiere sie
        const updateParams = {
          TableName: "Reviews",
          Key: {
            user_id,
            game_id,
          },
          UpdateExpression: "SET rating = :rating, #comment = :comment, playtime_hours = :playtime_hours",
          ExpressionAttributeNames: {
            "#comment": "comment", // Umgehen des reservierten Schlüsselworts
          },
          ExpressionAttributeValues: {
            ":rating": rating,
            ":comment": comment,
            ":playtime_hours": playtime_hours,
          },
          ReturnValues: "ALL_NEW",
        };
  
        await docClient.send(new UpdateCommand(updateParams));
      } else {
        // Füge eine neue Bewertung hinzu
        const putParams = {
          TableName: "Reviews",
          Item: {
            user_id,
            game_id,
            rating,
            comment,
            playtime_hours,
            created_at: new Date().toISOString(),
          },
        };
  
        await docClient.send(new PutCommand(putParams));
      }
  
      // Aktualisiere die Durchschnittsbewertung und die Anzahl der Bewertungen in der Games-Tabelle
      await updateGameStats(game_id);
  
      res.status(200).json({
        message: previousRating !== null ? "Bewertung erfolgreich aktualisiert!" : "Bewertung erfolgreich hinzugefügt!",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// ✅ Bewertung löschen
router.delete("/:user_id/review/:game_id", async (req, res) => {
  const { user_id, game_id } = req.params;

  try {
    // Überprüfen, ob die Bewertung existiert
    const queryParams = {
      TableName: "Reviews",
      KeyConditionExpression: "user_id = :user_id AND game_id = :game_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
        ":game_id": game_id,
      },
    };

    const queryResult = await docClient.send(new QueryCommand(queryParams));

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res.status(404).json({ error: "Bewertung nicht gefunden!" });
    }

    // Lösche die Bewertung
    const deleteParams = {
      TableName: "Reviews",
      Key: {
        user_id,
        game_id,
      },
    };

    await docClient.send(new DeleteCommand(deleteParams));

    // Aktualisiere die Durchschnittsbewertung und die Anzahl der Bewertungen in der Games-Tabelle
    await updateGameStats(game_id);

    res.status(200).json({ message: "Bewertung erfolgreich gelöscht!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Hilfsfunktion: Aktualisiere die Spiele-Statistiken
const updateGameStats = async (game_id) => {
  try {
    // Abrufen aller Bewertungen für das Spiel
    const queryParams = {
      TableName: "Reviews",
      KeyConditionExpression: "game_id = :game_id",
      ExpressionAttributeValues: {
        ":game_id": game_id,
      },
    };

    const queryResult = await docClient.send(new QueryCommand(queryParams));

    const reviews = queryResult.Items || [];
    const reviewsCount = reviews.length;

    let averageRating = 0;
    if (reviewsCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = parseFloat((totalRating / reviewsCount).toFixed(1));
    }

    // Abrufen des Spiels aus der Games-Tabelle, um den Sort Key (title) zu erhalten
    const gameQueryParams = {
      TableName: "Games",
      KeyConditionExpression: "game_id = :game_id",
      ExpressionAttributeValues: {
        ":game_id": game_id,
      },
    };

    const gameQueryResult = await docClient.send(new QueryCommand(gameQueryParams));

    if (!gameQueryResult.Items || gameQueryResult.Items.length === 0) {
      console.error("Spiel nicht gefunden:", game_id);
      return;
    }

    const game = gameQueryResult.Items[0];

    // Aktualisiere die Games-Tabelle
    const updateParams = {
      TableName: "Games",
      Key: {
        game_id: game.game_id,
        title: game.title, // Sort Key
      },
      UpdateExpression: "SET reviews_count = :reviews_count, average_rating = :average_rating",
      ExpressionAttributeValues: {
        ":reviews_count": reviewsCount,
        ":average_rating": averageRating,
      },
    };

    await docClient.send(new UpdateCommand(updateParams));
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Spiele-Statistiken:", error.message);
  }
};

export default router;