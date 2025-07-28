import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // TODO
  await db.query("DELETE FROM files");
  await db.query("DELETE FROM folders");

  const folders = [
    { name: "Folder1" },
    { name: "Folder2" },
    { name: "Folder3" },
  ];

  const data = [
    [
      { name: "File11", size: 1024 },
      { name: "File12", size: 2048 },
      { name: "File13", size: 512 },
      { name: "File14", size: 256 },
      { name: "File15", size: 4096 },
    ],
    [
      { name: "File21", size: 1024 },
      { name: "File22", size: 2048 },
      { name: "File23", size: 512 },
      { name: "File24", size: 256 },
      { name: "File25", size: 4096 },
    ],
    [
      { name: "File31", size: 1024 },
      { name: "File32", size: 2048 },
      { name: "File33", size: 512 },
      { name: "File34", size: 256 },
      { name: "File35", size: 4096 },
    ],
  ];

  const folderIds = [];
  for (const folder of folders) {
    const result = await db.query(
      "INSERT INTO folders (name) VALUES ($1) RETURNING id",
      [folder.name]
    );
    folderIds.push(result.rows[0].id);
  }
  for (let i = 0; i < folderIds.length; i++) {
    const folderId = folderIds[i];
    const files = data[i];

    for (const file of files) {
      await db.query(
        "INSERT INTO files (name, size, folder_id) VALUES ($1, $2, $3)",
        [file.name, file.size, folderId]
      );
    }
  }
}
