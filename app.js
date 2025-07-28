import express from "express";
import db from "#db/client";
const app = express();
app.use(express.json());

app.get("/files", async (req, res, next) => {
  const { rows } = await db.query(`
      SELECT files.*, 
      folders.name AS folder_name
      FROM files
      JOIN folders ON files.folder_id = folders.id
    `);
  res.json(rows);
});

app.get("/folders", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM folders");
  res.json(rows);
});

app.get("/folders/:id", async (req, res, next) => {
  const id = req.params.id;
  const { rows } = await db.query(
    `
      SELECT folders.id, folders.name, json_agg(files.*) AS files
      FROM folders
      LEFT JOIN files ON folders.id = files.folder_id
      WHERE folders.id = $1
      GROUP BY folders.id, folders.name
    `,
    [id]
  );

  if (rows.length === 0)
    return res.status(404).json({ error: "Folder doesn't exist" });
  res.json(rows[0]);
});

app.post("/folders/:id/files", async (req, res) => {
  const folderId = parseInt(req.params.id);
  const folderCheck = await db.query("SELECT id FROM folders WHERE id = $1", [
    folderId,
  ]);

  if (folderCheck.rows.length === 0) {
    return res.status(404).json({ error: "Folder doesn't exist" });
  }
  if (!req.body) {
    return res.status(400).json({ error: "Request body not provided" });
  }

  const { name, size } = req.body;

  if (!name || size === undefined || size === null) {
    return res
      .status(400)
      .json({ error: "Request body is missing required fields" });
  }

  const insertSql = `
      INSERT INTO files (name, size, folder_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;

  const { rows } = await db.query(insertSql, [name, size, folderId]);
  res.status(201).json(rows[0]);
});

export default app;
