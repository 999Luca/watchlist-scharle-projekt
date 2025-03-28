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

// Hilfsfunktion: Benutzername abrufen
const getUsername = async (user_id) => {
  try {
    const params = {
      TableName: "Users", // Tabelle, in der die Benutzerdaten gespeichert sind
      Key: { user_id },
    };

    const result = await docClient.send(new QueryCommand(params));
    if (result.Items && result.Items.length > 0) {
      return result.Items[0].username || `User_${user_id}`;
    }
    return `User_${user_id}`; // Fallback, falls kein Benutzername gefunden wird
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzernamens:", error.message);
    return `User_${user_id}`; // Fallback bei Fehler
  }
};

// ✅ Bewertung, Kommentar und Spielzeit hinzufügen oder aktualisieren
router.post("/:user_id/review/:game_id", async (req, res) => {
  const { user_id, game_id } = req.params;
  let { rating, comment, platform, playtime_hours } = req.body;

  playtime_hours = parseFloat(playtime_hours);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Ungültige Bewertung! Die Bewertung muss eine ganze Zahl zwischen 1 und 5 sein." });
  }

  if (typeof comment !== "string" || comment.trim() === "") {
    return res.status(400).json({ error: "Ungültiger Kommentar! Der Kommentar darf nicht leer sein." });
  }

  if (!["PC", "PlayStation", "Xbox", "Nintendo", "Mobile"].includes(platform)) {
    return res.status(400).json({ error: "Ungültige Plattform! Wähle eine gültige Plattform aus." });
  }

  if (isNaN(playtime_hours) || playtime_hours < 0) {
    return res.status(400).json({ error: "Ungültige Spielzeit! Die Spielzeit muss eine positive Zahl sein." });
  }

  try {
    const username = await getUsername(user_id); // Benutzername abrufen
    const createdAt = new Date().toISOString();

    const queryParams = {
      TableName: "Reviews",
      KeyConditionExpression: "user_id = :user_id AND game_id = :game_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
        ":game_id": game_id,
      },
    };

    const queryResult = await docClient.send(new QueryCommand(queryParams));

    if (queryResult.Items && queryResult.Items.length > 0) {
      const updateParams = {
        TableName: "Reviews",
        Key: {
          user_id,
          game_id,
        },
        UpdateExpression: "SET rating = :rating, #comment = :comment, platform = :platform, playtime_hours = :playtime_hours, username = :username, created_at = :created_at",
        ExpressionAttributeNames: {
          "#comment": "comment",
        },
        ExpressionAttributeValues: {
          ":rating": rating,
          ":comment": comment,
          ":platform": platform,
          ":playtime_hours": playtime_hours,
          ":username": username,
          ":created_at": createdAt,
        },
        ReturnValues: "ALL_NEW",
      };

      await docClient.send(new UpdateCommand(updateParams));
    } else {
      const putParams = {
        TableName: "Reviews",
        Item: {
          user_id,
          game_id,
          rating,
          comment,
          platform,
          playtime_hours,
          username,
          created_at: createdAt,
        },
      };

      await docClient.send(new PutCommand(putParams));
    }

    await updateGameStats(game_id);

    res.status(200).json({ message: "Bewertung erfolgreich hinzugefügt oder aktualisiert!" });
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Bewertung:", error.message);
    res.status(500).json({ error: "Fehler beim Hinzufügen der Bewertung" });
  }
});

// ✅ Alle Reviews für ein bestimmtes Spiel abrufen
router.get("/:game_id", async (req, res) => {
  const { game_id } = req.params;

  try {
    const queryParams = {
      TableName: "Reviews",
      IndexName: "game_id-index",
      KeyConditionExpression: "game_id = :game_id",
      ExpressionAttributeValues: {
        ":game_id": game_id,
      },
    };

    const queryResult = await docClient.send(new QueryCommand(queryParams));

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res.status(404).json({ error: "Keine Reviews für dieses Spiel gefunden." });
    }

    const reviews = queryResult.Items.map((review) => ({
      ...review,
      username: review.username || `User_${review.user_id}`, // Fallback auf User_ID, falls kein Benutzername vorhanden ist
      posted_at: review.created_at || "Unbekannt",
    }));

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Fehler beim Abrufen der Reviews:", error.message);
    res.status(500).json({ error: "Fehler beim Abrufen der Reviews" });
  }
});

// ✅ Hilfsfunktion: Aktualisiere die Spiele-Statistiken
const updateGameStats = async (game_id) => {
  try {
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

    const updateParams = {
      TableName: "Games",
      Key: {
        game_id,
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