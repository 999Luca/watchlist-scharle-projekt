import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"; // Added ScanCommand
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// DynamoDB Client initialisieren
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-central-1",
});
const docClient = DynamoDBDocumentClient.from(client);


// ✅ Spiel erstellen
router.post("/create", async (req, res) => {
  const { title, genre, release_date, image_url } = req.body;

  if (!title || !genre || !release_date || !image_url) {
    return res.status(400).json({ error: "Fehlende Angaben!" });
  }

  try {
    const scanParams = {
      TableName: "Games",
      ProjectionExpression: "game_id",
    };

    const scanResult = await docClient.send(new ScanCommand(scanParams));
    const gameIds = scanResult.Items.map((item) => parseInt(item.game_id, 10)).filter(Number.isFinite);
    const maxGameId = gameIds.length > 0 ? Math.max(...gameIds) : 0;

    const game_id = (maxGameId + 1).toString();

    const params = {
      TableName: "Games",
      Item: {
        game_id,
        title,
        genre,
        release_date,
        image_url, // Bild-URL speichern
        created_at: new Date().toISOString(),
        reviews_count: 0,
        average_rating: 0,
      },
      ConditionExpression: "attribute_not_exists(game_id)",
    };

    await docClient.send(new PutCommand(params));
    res.status(201).json({ message: "Spiel erfolgreich erstellt!", game_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Alle Spiele abrufen
router.get("/", async (req, res) => {
  try {
    const scanParams = {
      TableName: "Games",
    };

    const scanResult = await docClient.send(new ScanCommand(scanParams));
    res.status(200).json(scanResult.Items || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Einzelnes Spiel abrufen
router.get("/:game_id", async (req, res) => {
  const { game_id } = req.params;

  try {
    const queryParams = {
      TableName: "Games",
      KeyConditionExpression: "game_id = :game_id",
      ExpressionAttributeValues: {
        ":game_id": game_id,
      },
    };

    const queryResult = await docClient.send(new QueryCommand(queryParams));
    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res.status(404).json({ error: "Spiel nicht gefunden!" });
    }

    res.status(200).json(queryResult.Items[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Spiel aktualisieren
router.put("/:game_id", async (req, res) => {
  const { game_id } = req.params;
  const { title, genre, release_date } = req.body;

  if (!title && !genre && !release_date) {
    return res.status(400).json({ error: "Keine Angaben zum Aktualisieren bereitgestellt!" });
  }

  try {
    const updateExpressions = [];
    const expressionAttributeValues = {};

    if (title) {
      updateExpressions.push("title = :title");
      expressionAttributeValues[":title"] = title;
    }
    if (genre) {
      updateExpressions.push("genre = :genre");
      expressionAttributeValues[":genre"] = genre;
    }
    if (release_date) {
      updateExpressions.push("release_date = :release_date");
      expressionAttributeValues[":release_date"] = release_date;
    }

    const updateParams = {
      TableName: "Games",
      Key: {
        game_id,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await docClient.send(new UpdateCommand(updateParams));
    res.status(200).json({ message: "Spiel erfolgreich aktualisiert!", game: updateResult.Attributes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Spiel löschen
router.delete("/:game_id", async (req, res) => {
  const { game_id } = req.params;

  try {
    const deleteParams = {
      TableName: "Games",
      Key: {
        game_id,
      },
    };

    await docClient.send(new DeleteCommand(deleteParams));
    res.status(200).json({ message: "Spiel erfolgreich gelöscht!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Bewertung hinzufügen oder aktualisieren
router.post("/:user_id/rate/:game_id", async (req, res) => {
  const { user_id, game_id } = req.params;
  const { rating } = req.body;

  // Überprüfen, ob die Bewertung eine ganze Zahl zwischen 1 und 5 ist
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Ungültige Bewertung! Die Bewertung muss eine ganze Zahl zwischen 1 und 5 sein." });
  }

  try {
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

      // Aktualisiere die Bewertung in der Reviews-Tabelle
      const updateRatingParams = {
        TableName: "Reviews",
        Key: {
          user_id,
          game_id,
        },
        UpdateExpression: "SET rating = :rating",
        ExpressionAttributeValues: {
          ":rating": rating,
        },
      };

      await docClient.send(new UpdateCommand(updateRatingParams));
    } else {
      // Füge eine neue Bewertung hinzu
      const putRatingParams = {
        TableName: "Reviews",
        Item: {
          user_id,
          game_id,
          rating,
        },
      };

      await docClient.send(new PutCommand(putRatingParams));
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
    console.log("Spiele-Statistiken erfolgreich aktualisiert:", game_id);
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Spiele-Statistiken:", error.message);
  }
};

export default router;