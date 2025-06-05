// comment.js
document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");

  // Hàm format thời gian thành "HH:mm:ss"
  function formatTime(isoString) {
    const date = new Date(isoString);
 return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });  }

  // Hàm tạo 1 comment div (bên phải, có thời gian bên trái)
  function createCommentElement(comment) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "flex-end";
    wrapper.style.marginBottom = "8px";
    wrapper.style.alignItems = "center";

    // Thời gian bên trái nhỏ
    const timeElem = document.createElement("small");
    timeElem.textContent = formatTime(comment.time);
    timeElem.style.marginRight = "8px";
    timeElem.style.color = "#666";
    timeElem.style.fontSize = "0.7em";
    timeElem.style.userSelect = "none";

    // Nội dung comment (bên phải)
    const messageElem = document.createElement("div");
    messageElem.textContent = comment.message;
    messageElem.style.backgroundColor = "#9abee1";
    messageElem.style.borderRadius = "0.5vw";
    messageElem.style.padding = "0.5vw 1vw";
    messageElem.style.maxWidth = "80%";
    messageElem.style.wordBreak = "break-word";

    wrapper.appendChild(timeElem);
    wrapper.appendChild(messageElem);

    return wrapper;
  }

  // Load comment từ server và hiển thị
  async function loadComments() {
    try {
      const res = await fetch("/comments");
      if (!res.ok) throw new Error("Không lấy được dữ liệu comments");
      const data = await res.json();

      chatMessages.innerHTML = ""; // Xóa hết comment cũ
      data.comments.forEach((comment) => {
        const commentElem = createCommentElement(comment);
        chatMessages.appendChild(commentElem);
      });

      chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống cuối
    } catch (error) {
      console.error(error);
    }
  }

  // Gửi comment mới lên server
  async function sendComment(message) {
    try {
      const res = await fetch("/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Gửi comment thất bại");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  chatInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    const message = chatInput.value.trim();

    // Tạo comment mới local với thời gian hiện tại để hiển thị ngay
    const newComment = {
      message,
      time: new Date().toISOString(),
    };
    const commentElem = createCommentElement(newComment);
    chatMessages.appendChild(commentElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Gửi comment lên server
    await sendComment(message);

    chatInput.value = "";
  }
});  // Load comment ngay khi trang tải xong
  loadComments();
});
