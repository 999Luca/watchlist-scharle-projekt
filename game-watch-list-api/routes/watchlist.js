import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// DynamoDB Client initialisieren
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-central-1",
});
const docClient = DynamoDBDocumentClient.from(client);

// Middleware zur Überprüfung, ob `user_id` existiert
const validateUser = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const params = {
      TableName: "Users", // Tabelle, die Benutzer speichert
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };

    const result = await docClient.send(new QueryCommand(params));

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: "Benutzer nicht gefunden!" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware zur Überprüfung, ob `game_id` existiert
const validateGame = async (req, res, next) => {
  const { game_id } = req.params;

  try {
    const params = {
      TableName: "Games", // Tabelle, die Spiele speichert
      KeyConditionExpression: "game_id = :game_id",
      ExpressionAttributeValues: {
        ":game_id": game_id,
      },
    };

    const result = await docClient.send(new QueryCommand(params));

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: "Spiel nicht gefunden!" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Spiel zur Watchlist hinzufügen
router.post("/:user_id/add/:game_id", validateUser, validateGame, async (req, res) => {
  const { user_id, game_id } = req.params;
  const { status } = req.body;

  if (!status || !["will spielen", "spiele gerade", "fertig gespielt"].includes(status)) {
    return res.status(400).json({ error: "Ungültiger Status! Erlaubte Werte: 'will spielen', 'spiele gerade', 'fertig gespielt'." });
  }

  try {
    const params = {
      TableName: "Watchlist",
      Item: {
        user_id, // Partition key
        game_id, // Sort key
        status, // Status des Spiels
        added_at: new Date().toISOString(),
      },
      ConditionExpression: "attribute_not_exists(game_id)", // Verhindert doppelte Einträge
    };

    await docClient.send(new PutCommand(params));
    res.status(201).json({ message: "Spiel erfolgreich zur Watchlist hinzugefügt!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Watchlist eines Benutzers anzeigen (mit Spieldaten)
router.get("/:user_id", validateUser, async (req, res) => {
  const { user_id } = req.params;

  try {
    // Abrufen der Watchlist-Einträge für den Benutzer
    const params = {
      TableName: "Watchlist",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };

    const watchlistResult = await docClient.send(new QueryCommand(params));

    if (!watchlistResult.Items || watchlistResult.Items.length === 0) {
      return res.status(404).json({ error: "Keine Spiele in der Watchlist gefunden!" });
    }

    // Abrufen der Spieldaten für jedes Spiel in der Watchlist
    const enrichedWatchlist = await Promise.all(
      watchlistResult.Items.map(async (item) => {
        const gameParams = {
          TableName: "Games",
          KeyConditionExpression: "game_id = :game_id",
          ExpressionAttributeValues: {
            ":game_id": item.game_id,
          },
        };

        const gameResult = await docClient.send(new QueryCommand(gameParams));

        // Falls das Spiel in der Games-Tabelle nicht gefunden wird, füge nur die Watchlist-Daten hinzu
        if (!gameResult.Items || gameResult.Items.length === 0) {
          return { ...item, game_data: null };
        }

        // Kombiniere die Watchlist-Daten mit den Spieldaten
        return { ...item, game_data: gameResult.Items[0] };
      })
    );

    res.status(200).json({ watchlist: enrichedWatchlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Spiel aus der Watchlist entfernen
router.delete("/:user_id/remove/:game_id", validateUser, validateGame, async (req, res) => {
  const { user_id, game_id } = req.params;

  try {
    const params = {
      TableName: "Watchlist",
      Key: {
        user_id, // Partition key
        game_id, // Sort key
      },
    };

    await docClient.send(new DeleteCommand(params));
    res.status(200).json({ message: "Spiel erfolgreich aus der Watchlist entfernt!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Status eines Spiels aktualisieren
router.put("/:user_id/update-status/:game_id", validateUser, validateGame, async (req, res) => {
  const { user_id, game_id } = req.params;
  const { status } = req.body;

  if (!status || !["will spielen", "spiele gerade", "fertig gespielt"].includes(status)) {
    return res.status(400).json({ error: "Ungültiger Status! Erlaubte Werte: 'will spielen', 'spiele gerade', 'fertig gespielt'." });
  }

  try {
    const params = {
      TableName: "Watchlist",
      Key: {
        user_id, // Partition key
        game_id, // Sort key
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await docClient.send(new UpdateCommand(params));

    res.status(200).json({
      message: "Status erfolgreich aktualisiert!",
      watchlistItem: result.Attributes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;