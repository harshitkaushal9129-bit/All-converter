// Load User Profile on page startup
document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
});

function loadProfileData() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {
    username: "kaushalji",
    email: "kaushalji@example.com",
    dob: "2004-09-13",
    address: "India",
    avatar: ""
  };

  document.getElementById("navUsername").textContent = profile.username;
  const avatarEl = document.getElementById("navAvatar");
  
  if (profile.avatar) {
    avatarEl.innerHTML = `<img src="${profile.avatar}" alt="Avatar">`;
  } else {
    avatarEl.textContent = profile.username.substring(0, 2).toUpperCase();
  }
}

// Profile Modal Actions
function openProfileModal() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {
    username: "kaushalji",
    email: "kaushalji@example.com",
    dob: "2004-09-13",
    address: "India",
    avatar: ""
  };

  document.getElementById("editUsername").value = profile.username || "";
  document.getElementById("editEmail").value = profile.email || "";
  document.getElementById("editDob").value = profile.dob || "";
  document.getElementById("editAddress").value = profile.address || "";
  document.getElementById("editAvatarUrl").value = profile.avatar.startsWith("data:") ? "" : profile.avatar;

  document.getElementById("profileModal").classList.add("active");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("active");
}

let tempAvatarBase64 = "";
function previewAvatarFile(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      tempAvatarBase64 = e.target.result;
      document.getElementById("editAvatarUrl").value = "[Image Uploaded]";
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function saveProfile(event) {
  event.preventDefault();
  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const dob = document.getElementById("editDob").value;
  const address = document.getElementById("editAddress").value.trim();
  let avatar = document.getElementById("editAvatarUrl").value.trim();

  if (tempAvatarBase64) {
    avatar = tempAvatarBase64;
  }

  const profile = { username, email, dob, address, avatar };
  localStorage.setItem("userProfile", JSON.stringify(profile));

  loadProfileData();
  closeProfileModal();
  alert("Profile updated successfully!");
}

// Tab Switching Logic
function openTool(viewId) {
  document.getElementById('homeDashboard').style.display = 'none';
  document.querySelectorAll('.tool-view').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  document.querySelectorAll('.tool-view').forEach(el => el.classList.remove('active'));
  document.getElementById('homeDashboard').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// App Info Modal Management
function openAppInfoModal() {
  document.getElementById('appInfoModal').classList.add('active');
}
function closeAppInfoModal() {
  document.getElementById('appInfoModal').classList.remove('active');
}
function shareApp(type) {
  const url = window.location.href;
  if (type === 'copy') {
    navigator.clipboard.writeText(url);
    alert('App link copied to clipboard!');
  } else if (type === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out File Converter Pro 2027: ' + url)}`, '_blank');
  }
}

// Utility Functions
function setStatus(id, text, isSuccess = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'status ' + (isSuccess ? 'success' : 'error');
}

function updateFileName(input, textId) {
  const label = document.getElementById(textId);
  if (input.files && input.files[0]) {
    label.innerHTML = `<i class="fa-solid fa-file"></i> ${input.files[0].name}`;
  }
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// Tool Implementation Logic
function htmlToJson() {
  const value = document.getElementById("htmlInput").value;
  if (!value.trim()) return setStatus("h2jStatus", "Please enter HTML content first.", false);
  const json = JSON.stringify({ html: value }, null, 2);
  saveBlob(new Blob([json], { type: "application/json" }), "converted.json");
  setStatus("h2jStatus", "JSON file created and downloaded successfully.");
}

function jsonToHtml() {
  const value = document.getElementById("jsonInput").value;
  try {
    const obj = JSON.parse(value);
    const html = typeof obj === "string" ? obj : (obj && typeof obj.html === "string" ? obj.html : null);
    if (html === null) throw new Error('Requires string or object with "html" property.');
    saveBlob(new Blob([html], { type: "text/html;charset=utf-8" }), "converted.html");
    setStatus("j2hStatus", "HTML file created successfully.");
  } catch (error) {
    setStatus("j2hStatus", "Error: " + error.message, false);
  }
}

function csvToJson() {
  const csv = document.getElementById("csvInput").value.trim();
  if (!csv) return setStatus("csvStatus", "Please enter CSV data.", false);
  try {
    const lines = csv.split("\n").map(l => l.trim()).filter(l => l);
    if (lines.length < 2) throw new Error("CSV requires headers and at least 1 row.");
    const headers = lines[0].split(",").map(h => h.trim());
    const result = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || "");
      return obj;
    });
    saveBlob(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }), "csv_converted.json");
    setStatus("csvStatus", "CSV successfully converted to JSON!");
  } catch (e) {
    setStatus("csvStatus", "Error: " + e.message, false);
  }
}

function imageConvert(inputId, format, statusId) {
  const input = document.getElementById(inputId);
  const file = input.files[0];
  if (!file) return setStatus(statusId, "Please select an image file first.", false);

  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    if (format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);
    const mimeMap = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

    canvas.toBlob(blob => {
      URL.revokeObjectURL(url);
      if (!blob) return setStatus(statusId, "Conversion failed.", false);
      const name = file.name.replace(/\.[^.]+$/, "") || "converted_image";
      saveBlob(blob, `${name}.${format}`);
      setStatus(statusId, "Image converted & downloaded successfully!");
    }, mimeMap[format], 0.92);
  };
  img.onerror = () => { URL.revokeObjectURL(url); setStatus(statusId, "Failed to load image.", false); };
  img.src = url;
}

function svgToPng() {
  const file = document.getElementById("svgFile").files[0];
  if (!file) return setStatus("svgStatus", "Please select an SVG file.", false);
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const blob = new Blob([e.target.result], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 800; canvas.height = img.height || 600;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(pngBlob => {
        URL.revokeObjectURL(url);
        saveBlob(pngBlob, file.name.replace(/\.svg$/i, "") + ".png");
        setStatus("svgStatus", "SVG converted to PNG successfully!");
      }, "image/png");
    };
    img.src = url;
  };
  reader.readAsText(file);
}

function processBase64(isEncode) {
  const val = document.getElementById("base64Input").value;
  if (!val.trim()) return setStatus("base64Status", "Please enter input text.", false);
  try {
    if (isEncode) {
      document.getElementById("base64Input").value = btoa(unescape(encodeURIComponent(val)));
      setStatus("base64Status", "Encoded to Base64!");
    } else {
      document.getElementById("base64Input").value = decodeURIComponent(escape(atob(val)));
      setStatus("base64Status", "Decoded from Base64!");
    }
  } catch (err) {
    setStatus("base64Status", "Invalid Base64 string.", false);
  }
}

function mdToHtml() {
  const md = document.getElementById("mdInput").value;
  if (!md.trim()) return setStatus("mdStatus", "Enter markdown text.", false);
  let html = md.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*/gim, '<b>$1</b>');
  saveBlob(new Blob([html.trim()], { type: "text/html;charset=utf-8" }), "markdown.html");
  setStatus("mdStatus", "Markdown converted and downloaded!");
}

function generateQR() {
  const text = document.getElementById("qrInput").value.text || document.getElementById("qrInput").value.trim();
  if (!text) return setStatus("qrStatus", "Please enter text or URL.", false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
  document.getElementById("qrPreviewArea").innerHTML = `<img src="${qrUrl}" alt="QR" style="border-radius:8px; border:2px solid var(--card-border);">`;
  setStatus("qrStatus", "QR Code generated!");
}
