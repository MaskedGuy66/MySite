document.addEventListener("DOMContentLoaded", () => {
  const idolContainer = document.getElementById("idolCheckboxes");
  const songInputsContainer = document.getElementById("songInputs");
  const addSongBtn = document.getElementById("addSongBtn");

  let songs = [];

  // Fetch idols và render checkbox
  fetch("../data/idols.json")
    .then((res) => res.json())
    .then((idols) => {
      idols.forEach((idol) => {
        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.flexDirection = "column";
        label.style.alignItems = "center";
        label.style.gap = "4px";

        const image = document.createElement("img");
        image.src = idol.image;
        image.style.width = "6vw";
        image.style.height = "6vw";
        image.style.objectFit = "cover";
        image.style.objectPosition = "top";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "favoriteIdols";
        checkbox.value = idol.id;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = idol.name;

        label.appendChild(image);
        label.appendChild(checkbox);
        label.appendChild(nameSpan);

        idolContainer.appendChild(label);
      });
    })
    .catch((err) => console.error("Lỗi khi tải idols:", err));

  // Fetch songs trước để dùng cho select
  fetch("../data/songs.json")
    .then((res) => res.json())
    .then((data) => {
      songs = data;
      addSongInput(); // thêm select đầu tiên sau khi có dữ liệu
    })
    .catch((err) => console.error("Lỗi khi tải songs:", err));

  function addSongInput() {
    const currentCount = songInputsContainer.querySelectorAll("select").length;
    if (currentCount >= 6) return alert("Chỉ được chọn tối đa 6 bài hát");

    const select = document.createElement("select");
    select.name = "favoriteSongs";
    select.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Chọn bài hát --";
    select.appendChild(defaultOption);

    songs.forEach((song) => {
      const option = document.createElement("option");
      option.value = song.id;
      option.textContent = `${song.title} - ${song.artist}`;
      select.appendChild(option);
    });

    songInputsContainer.appendChild(select);
  }

  addSongBtn.addEventListener("click", addSongInput);
});
