console.log("__dirname:", __dirname);
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const multer = require("multer");
const commentsFile = path.join(
  __dirname,
  "public",
  "data",
  "comments",
  "comments.json"
);

const app = express();
const PORT = 3000;

// Middleware cần thiết để đọc dữ liệu từ form
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/data", express.static(path.join(__dirname, "wed_design", "data")));
app.use("/", express.static(path.join(__dirname, "wed_design")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));
});

// Trang profile
app.get("/profile", async (req, res) => {
  try {
    const usersData = await fs.readFile(
      path.join(__dirname, "public", "data", "users.json"),
      "utf-8"
    );
    const idolsData = await fs.readFile(
      path.join(__dirname, "public", "data", "idols.json"),
      "utf-8"
    );
    const songsData = await fs.readFile(
      path.join(__dirname, "public", "data", "songs.json"),
      "utf-8"
    );
    const users = JSON.parse(usersData);
    const idols = JSON.parse(idolsData);
    const songs = JSON.parse(songsData);

    const userId = 1;
    const user = users.find((u) => u.id === userId);

    const userFavoriteIdols = { 1: [2, 5, 6] };
    const userFavoriteSongs = { 1: [1, 2, 3, 4, 5, 6] };

    const idolList = userFavoriteIdols[userId].map((idolId) =>
      idols.find((i) => i.id === idolId)
    );
    const songList = userFavoriteSongs[userId].map((songId) =>
      songs.find((s) => s.id === songId)
    );

    res.render("profile", { user, idolList, songList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

// Cấu hình multer
const upload = multer({ dest: "public/uploads/" });

// Xử lý form upload
app.post(
  "/upload",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "qr", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Debug dữ liệu nhận được
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      // Đọc dữ liệu người dùng hiện có
      const usersData = await fs.readFile("public/data/users.json", "utf-8");
      const users = JSON.parse(usersData);

      // Lấy dữ liệu từ form
      const { name, profession, address, phone, email, youtube_video } =
        req.body;
      const favoriteSongs = req.body.favoriteSongs || [];
      const favoriteIdols = req.body.favoriteIdols || [];

      // Xử lý ảnh
      const avatarPath = req.files["avatar"]
        ? req.files["avatar"][0].path.replace("public", "..")
        : "";
      const profileImagePath = req.files["profileImage"]
        ? req.files["profileImage"][0].path.replace("public", "..")
        : "";
      const qrPath = req.files["qr"]
        ? req.files["qr"][0].path.replace("public", "..")
        : "";

      // Gán ID mới
      const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

      // Tạo object người dùng mới
      const newUser = {
        id: newId,
        name,
        profession,
        address,
        phone,
        email,
        avatar: avatarPath,
        profileImage: profileImagePath,
        qr: qrPath,
        youtube_video,
        favoriteSongs: Array.isArray(favoriteSongs)
          ? favoriteSongs.map(Number)
          : [Number(favoriteSongs)],
        favoriteIdols: Array.isArray(favoriteIdols)
          ? favoriteIdols.map(Number)
          : [Number(favoriteIdols)],
      };

      // Thêm vào danh sách
      users.push(newUser);

      // Ghi lại vào file JSON
      await fs.writeFile(
        path.join(__dirname, "public", "data", "users.json"),
        JSON.stringify(users, null, 2)
      );

      // Điều hướng tới profile
      res.redirect("/profile");
    } catch (error) {
      console.error("Lỗi khi xử lý form upload:", error);
      res.status(500).send("Lỗi server khi lưu dữ liệu");
    }
  }
);

async function ensureCommentsFile() {
  try {
    await fs.access(commentsFile);
  } catch {
    // Tạo thư mục cha nếu chưa tồn tại
    const dir = path.dirname(commentsFile);
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
    // Tạo file comments.json với nội dung mảng rỗng
    await fs.writeFile(commentsFile, "[]", "utf-8");
  }
}

app.use(express.json());

app.post("/comment", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    await ensureCommentsFile();

    const data = await fs.readFile(commentsFile, "utf-8");
    const comments = JSON.parse(data);

    const newComment = {
      message,
      time: new Date().toISOString()
    };

    comments.push(newComment);

    await fs.writeFile(
      commentsFile,
      JSON.stringify(comments, null, 2),
      "utf-8"
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save comment" });
  }
});

app.get("/comments", async (req, res) => {
  try {
    await ensureCommentsFile(); // đảm bảo file tồn tại

    const data = await fs.readFile(commentsFile, "utf-8");
    const comments = JSON.parse(data);

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
});
