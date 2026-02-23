const addStoryBtn = document.getElementById("addStoryBtn");
const fileInput = document.getElementById("fileInput");
const storiesContainer = document.getElementById("stories");
const viewer = document.getElementById("viewer");
const viewerImage = document.getElementById("viewerImage");
const progressContainer = document.getElementById("progressContainer");

let stories = JSON.parse(localStorage.getItem("stories")) || [];
let currentIndex = 0;
let timeout;

// 🟢 Remove expired stories (24 hours)
function removeExpiredStories() {
  const now = Date.now();
  stories = stories.filter(story => now - story.time < 24 * 60 * 60 * 1000);
  localStorage.setItem("stories", JSON.stringify(stories));
}
removeExpiredStories();

function renderStories() {
  storiesContainer.innerHTML = "";
  stories.forEach((story, index) => {
    const div = document.createElement("div");
    div.className = "story";
    div.innerHTML = `<img src="${story.image}" />`;
    div.onclick = () => openViewer(index);
    storiesContainer.appendChild(div);
  });
}
renderStories();

// ➕ Add Story
addStoryBtn.onclick = () => fileInput.click();

fileInput.onchange = function () {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {

    const img = new Image();
    img.src = e.target.result;

    img.onload = function () {
      // Resize if larger than 1080x1920
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      const maxWidth = 1080;
      const maxHeight = 1920;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL("image/jpeg", 0.8);

      stories.push({
        image: base64,
        time: Date.now()
      });

      localStorage.setItem("stories", JSON.stringify(stories));
      renderStories();
    };
  };
  reader.readAsDataURL(file);
};

// 👁️ Open Viewer
function openViewer(index) {
  currentIndex = index;
  viewer.classList.remove("hidden");
  showStory();
}

// 🔄 Show Story
function showStory() {
  clearTimeout(timeout);
  viewerImage.src = stories[currentIndex].image;

  // Progress Bars
  progressContainer.innerHTML = "";
  stories.forEach((_, i) => {
    const bar = document.createElement("div");
    bar.className = "progress-bar";

    const fill = document.createElement("div");
    fill.className = "progress-fill";

    if (i < currentIndex) fill.style.width = "100%";

    bar.appendChild(fill);
    progressContainer.appendChild(bar);

    if (i === currentIndex) {
      setTimeout(() => fill.style.width = "100%", 50);
    }
  });

  timeout = setTimeout(() => {
    nextStory();
  }, 3000);
}

// ▶ Next Story
function nextStory() {
  if (currentIndex < stories.length - 1) {
    currentIndex++;
    showStory();
  } else {
    viewer.classList.add("hidden");
  }
}

// 👈 Swipe Support
let startX = 0;

viewer.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

viewer.addEventListener("touchend", e => {
  let diff = e.changedTouches[0].clientX - startX;

  if (diff > 50) {
    // swipe right
    if (currentIndex > 0) {
      currentIndex--;
      showStory();
    }
  } else if (diff < -50) {
    // swipe left
    nextStory();
  }
});

// Close viewer on click
viewer.onclick = () => viewer.classList.add("hidden");