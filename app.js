const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const DATA_PATH = path.join(__dirname, "data"); // <-- Chỉ cần trỏ thẳng vào thư mục data trong project root

function readJSON(filename) {
  const filePath = path.join(DATA_PATH, filename);
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

app.get("/", (req, res) => {
  const users = readJSON("users.json");
  const songs = readJSON("songs.json");
  const idols = readJSON("idols.json");

  // Ví dụ data yêu thích
  const userFavoriteIdols = {
    1: [2, 5, 6],
  };
  const userFavoriteSongs = {
    1: [1, 2, 3, 4, 5, 6],
  };

  const userId = 1;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).send("User not found");

  const idolIds = userFavoriteIdols[userId] || [];
  const favoriteIdols = idolIds
    .map((id) => idols.find((idol) => idol.id === id))
    .filter(Boolean);

  const favoriteSongIds = userFavoriteSongs[userId] || [];
  const favoriteSongs = favoriteSongIds
    .map((id) => songs.find((song) => song.id === id))
    .filter(Boolean);

  res.render("profile", {
    user,
    idolList: favoriteIdols,
    songList: favoriteSongs,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
