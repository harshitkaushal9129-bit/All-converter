document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
  initThemePreference();
  registerPWA();
});

function registerPWA() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker registered:', reg.scope))
      .catch(err => console.log('PWA Service Worker failed:', err));
  }
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");
  const themeBtn = document.getElementById("themeToggleBtn");
  const currentTheme = body.getAttribute("data-theme");
  
  if (currentTheme === "dark") {
    body.setAttribute("data-theme", "light");
    if(themeIcon) themeIcon.className = "fa-solid fa-sun";
    if(themeBtn) themeBtn.innerHTML = `<i class="fa-solid fa-sun" id="themeIcon"></i> Switch to Dark Mode`;
    localStorage.setItem("appTheme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    if(themeIcon) themeIcon.className = "fa-solid fa-moon";
    if(themeBtn) themeBtn.innerHTML = `<i class="fa-solid fa-moon" id="themeIcon"></i> Switch to Light Mode`;
    localStorage.setItem("appTheme", "dark");
  }
}

function initThemePreference() {
  const savedTheme = localStorage.getItem("appTheme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);
  const themeIcon = document.getElementById("themeIcon");
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeIcon && themeBtn) {
    if (savedTheme === "light") {
      themeIcon.className = "fa-solid fa-sun";
      themeBtn.innerHTML = `<i class="fa-solid fa-sun" id="themeIcon"></i> Switch to Dark Mode`;
    } else {
      themeIcon.className = "fa-solid fa-moon";
      themeBtn.innerHTML = `<i class="fa-solid fa-moon" id="themeIcon"></i> Switch to Light Mode`;
    }
  }
}

// Profile Header Data
function loadProfileData() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {
    userId: "kaushalji9129",
    username: "kaushalji",
    mobile: "9876543210",
    dob: "2004-09-13",
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

function openProfileModal() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {
    userId: "",
    username: "kaushalji",
    mobile: "",
    dob: "2004-09-13",
    avatar: ""
  };

  document.getElementById("editUserId").value = profile.userId || "";
  document.getElementById("editUsername").value = profile.username || "";
  document.getElementById("editMobile").value = profile.mobile || "";
  document.getElementById("editDob").value = profile.dob || "";
  document.getElementById("editAvatarUrl").value = profile.avatar && !profile.avatar.startsWith("data:") ? profile.avatar : "";

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
  const userId = document.getElementById("editUserId").value.trim();
  const username = document.getElementById("editUsername").value.trim();
  const mobile = document.getElementById("editMobile").value.trim();
  const dob = document.getElementById("editDob").value;
  let avatar = document.getElementById("editAvatarUrl").value.trim();

  if (tempAvatarBase64) {
    avatar = tempAvatarBase64;
  } else if (avatar === "[Image Uploaded]") {
    const existing = JSON.parse(localStorage.getItem("userProfile"));
    avatar = existing ? existing.avatar : "";
  }

  const profile = { userId, username, mobile, dob, avatar };
  localStorage.setItem("userProfile", JSON.stringify(profile));

  loadProfileData();
  closeProfileModal();
  alert("Registration data saved successfully to Local Storage!");
}

function openTool(viewId) {
  const home = document.getElementById('homeDashboard');
  if (home) home.style.display = 'none';
  document.querySelectorAll('.tool-view').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  document.querySelectorAll('.tool-view').forEach(el => el.classList.remove('active'));
  const home = document.getElementById('homeDashboard');
  if (home) home.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// ================= NAYE 3 TOOLS LOGIC =================

// 1. Ultra HD Image Enhancer
function convertToUltraHD(scale) {
  const input = document.getElementById("hdImgFile");
  if (!input.files || !input.files[0]) return setStatus("hdStatus", "Please choose an image file first.", false);
  
  const file = input.files[0];
  const img = new Image();
  const url = URL.createObjectURL(file);
  
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      URL.revokeObjectURL(url);
      saveBlob(blob, `UltraHD_${scale}X_${file.name}`);
      setStatus("hdStatus", `Successfully converted to ${scale}X Ultra HD!`);
    }, "image/png", 1.0);
  };
  img.src = url;
}

// 2. Background Remover
function removeBackground() {
  const input = document.getElementById("bgImgFile");
  if (!input.files || !input.files[0]) return setStatus("bgRemStatus", "Please choose an image file first.", false);
  
  const file = input.files[0];
  const tolerance = parseInt(document.getElementById("bgTolerance").value) || 30;
  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const bgR = data[0], bgG = data[1], bgB = data[2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (Math.abs(r - bgR) < tolerance && Math.abs(g - bgG) < tolerance && Math.abs(b - bgB) < tolerance) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvas.toBlob(blob => {
      URL.revokeObjectURL(url);
      saveBlob(blob, `BG_Removed_${file.name.replace(/\.[^.]+$/, "")}.png`);
      setStatus("bgRemStatus", "Background removed successfully!");
    }, "image/png");
  };
  img.src = url;
}

// 3. Photoshop Image Editor
let editorImageObj = null;
let editorRotateAngle = 0;
let editorIsFlipped = false;

function loadEditorImage(input) {
  if (input.files && input.files[0]) {
    updateFileName(input, 'editorImgText');
    const reader = new FileReader();
    reader.onload = e => {
      editorImageObj = new Image();
      editorImageObj.onload = () => {
        document.getElementById("editorControls").style.display = "block";
        editorRotateAngle = 0;
        editorIsFlipped = false;
        applyEditorFilters();
      };
      editorImageObj.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function applyEditorFilters() {
  if (!editorImageObj) return;
  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas.getContext("2d");

  const b = document.getElementById("eBrightness").value;
  const c = document.getElementById("eContrast").value;
  const s = document.getElementById("eSaturate").value;
  const blur = document.getElementById("eBlur").value;

  canvas.width = (editorRotateAngle % 180 === 0) ? editorImageObj.width : editorImageObj.height;
  canvas.height = (editorRotateAngle % 180 === 0) ? editorImageObj.height : editorImageObj.width;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((editorRotateAngle * Math.PI) / 180);
  ctx.scale(editorIsFlipped ? -1 : 1, 1);
  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${blur}px)`;
  ctx.drawImage(editorImageObj, -editorImageObj.width / 2, -editorImageObj.height / 2);
  ctx.restore();
}

function rotateEditorImage(deg) {
  editorRotateAngle = (editorRotateAngle + deg) % 360;
  applyEditorFilters();
}

function flipEditorImage() {
  editorIsFlipped = !editorIsFlipped;
  applyEditorFilters();
}

function downloadEditedImage() {
  const canvas = document.getElementById("editorCanvas");
  canvas.toBlob(blob => {
    saveBlob(blob, "edited_photoshop_image.png");
    setStatus("editorStatus", "Edited image saved successfully!");
  }, "image/png");
}

// Baaki Converters
function htmlToJson() {
  const value = document.getElementById("htmlInput").value;
  if (!value.trim()) return setStatus("h2jStatus", "Please enter HTML content first.", false);
  saveBlob(new Blob([JSON.stringify({ html: value }, null, 2)], { type: "application/json" }), "converted.json");
  setStatus("h2jStatus", "JSON file created successfully.");
}

function jsonToHtml() {
  const value = document.getElementById("jsonInput").value;
  try {
    const obj = JSON.parse(value);
    const html = typeof obj === "string" ? obj : (obj && typeof obj.html === "string" ? obj.html : null);
    if (html === null) throw new Error('Requires "html" property.');
    saveBlob(new Blob([html], { type: "text/html;charset=utf-8" }), "converted.html");
    setStatus("j2hStatus", "HTML file created successfully.");
  } catch (error) { setStatus("j2hStatus", "Error: " + error.message, false); }
}

function csvToJson() {
  const csv = document.getElementById("csvInput").value.trim();
  if (!csv) return setStatus("csvStatus", "Please enter CSV data.", false);
  try {
    const lines = csv.split("\n").map(l => l.trim()).filter(l => l);
    const headers = lines[0].split(",").map(h => h.trim());
    const result = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj = {}; headers.forEach((h, i) => obj[h] = values[i] || ""); return obj;
    });
    saveBlob(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }), "csv_converted.json");
    setStatus("csvStatus", "CSV successfully converted to JSON!");
  } catch (e) { setStatus("csvStatus", "Error: " + e.message, false); }
}

function jsonToCsv() {
  const val = document.getElementById("j2csvInput").value.trim();
  if (!val) return setStatus("j2csvStatus", "Please enter JSON data.", false);
  try {
    const data = JSON.parse(val);
    const arr = Array.isArray(data) ? data : [data];
    const keys = Object.keys(arr[0]);
    let csv = keys.join(",") + "\n";
    arr.forEach(row => { csv += keys.map(k => `"${String(row[k] !== undefined ? row[k] : '')}"`).join(",") + "\n"; });
    saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "converted.csv");
    setStatus("j2csvStatus", "CSV file created successfully!");
  } catch (err) { setStatus("j2csvStatus", "Error: " + err.message, false); }
}

function imageConvert(inputId, format, statusId) {
  const input = document.getElementById(inputId);
  if (!input.files || !input.files[0]) return setStatus(statusId, "Please select an image file first.", false);
  const file = input.files[0];
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (format === "jpg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    const mimeMap = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
    canvas.toBlob(blob => {
      URL.revokeObjectURL(url);
      saveBlob(blob, `converted_image.${format}`);
      setStatus(statusId, "Image converted & downloaded!");
    }, mimeMap[format], 0.92);
  };
  img.src = url;
}

function svgToPng() {
  const fileInput = document.getElementById("svgFile");
  const svgCodeInput = document.getElementById("svgCodeInput").value.trim();
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => processSvgString(e.target.result, "svg_converted");
    reader.readAsText(fileInput.files[0]);
  } else if (svgCodeInput) { processSvgString(svgCodeInput, "custom_svg"); }
  else { setStatus("svgStatus", "Upload SVG or paste code first.", false); }
}

function processSvgString(svgText, filenamePrefix) {
  try {
    if (!svgText.includes("xmlns")) svgText = svgText.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800; canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(pngBlob => { URL.revokeObjectURL(url); saveBlob(pngBlob, filenamePrefix + ".png"); setStatus("svgStatus", "SVG converted to PNG!"); }, "image/png");
    };
    img.src = url;
  } catch (err) { setStatus("svgStatus", "Error processing SVG.", false); }
}

function processBase64(isEncode) {
  const val = document.getElementById("base64Input").value;
  if (!val.trim()) return setStatus("base64Status", "Please enter input text.", false);
  try {
    document.getElementById("base64Input").value = isEncode ? btoa(unescape(encodeURIComponent(val))) : decodeURIComponent(escape(atob(val)));
    setStatus("base64Status", isEncode ? "Encoded to Base64!" : "Decoded from Base64!");
  } catch (err) { setStatus("base64Status", "Invalid string.", false); }
}

function processUrl(isEncode) {
  const val = document.getElementById("urlInput").value;
  if (!val.trim()) return setStatus("urlStatus", "Please enter URL text.", false);
  try {
    document.getElementById("urlInput").value = isEncode ? encodeURIComponent(val) : decodeURIComponent(val);
    setStatus("urlStatus", isEncode ? "Encoded URL!" : "Decoded URL!");
  } catch (err) { setStatus("urlStatus", "Invalid URL.", false); }
}

function mdToHtml() {
  const md = document.getElementById("mdInput").value;
  if (!md.trim()) return setStatus("mdStatus", "Enter markdown text.", false);
  let html = md.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*/gim, '<b>$1</b>');
  saveBlob(new Blob([html.trim()], { type: "text/html;charset=utf-8" }), "markdown.html");
  setStatus("mdStatus", "Markdown converted!");
}

function convertTextCase(type) {
  const field = document.getElementById("caseInput");
  const val = field.value;
  if (!val.trim()) return setStatus("textCaseStatus", "Please enter text.", false);
  if (type === 'upper') field.value = val.toUpperCase();
  else if (type === 'lower') field.value = val.toLowerCase();
  else if (type === 'title') field.value = val.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  setStatus("textCaseStatus", "Text case converted!");
}

const morseMap = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
const reverseMorseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

function textToMorse() {
  const val = document.getElementById("morseInput").value.toUpperCase();
  if (!val.trim()) return setStatus("morseStatus", "Enter text.", false);
  document.getElementById("morseInput").value = val.split("").map(char => morseMap[char] || char).join(" ");
  setStatus("morseStatus", "Converted to Morse!");
}

function morseToText() {
  const val = document.getElementById("morseInput").value.trim();
  if (!val) return setStatus("morseStatus", "Enter Morse code.", false);
  document.getElementById("morseInput").value = val.split(" ").map(code => reverseMorseMap[code] || code).join("");
  setStatus("morseStatus", "Converted to Text!");
}

function textToBinary() {
  const val = document.getElementById("binaryInput").value;
  if (!val.trim()) return setStatus("binaryStatus", "Enter text.", false);
  document.getElementById("binaryInput").value = val.split("").map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(" ");
  setStatus("binaryStatus", "Converted to Binary!");
}

function binaryToText() {
  const val = document.getElementById("binaryInput").value.trim();
  if (!val) return setStatus("binaryStatus", "Enter binary.", false);
  try {
    document.getElementById("binaryInput").value = val.split(" ").map(bin => String.fromCharCode(parseInt(bin, 2))).join("");
    setStatus("binaryStatus", "Converted to Text!");
  } catch (e) { setStatus("binaryStatus", "Invalid binary.", false); }
}

function convertColor() {
  const input = document.getElementById("colorInput").value.trim();
  const preview = document.getElementById("colorPreviewBox");
  if (!input) return setStatus("colorStatus", "Enter a color.", false);
  let hex = "", rgb = "";
  if (input.startsWith("#")) {
    hex = input;
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) cleanHex = cleanHex.split("").map(c => c + c).join("");
    const r = parseInt(cleanHex.substring(0, 2), 16), g = parseInt(cleanHex.substring(2, 4), 16), b = parseInt(cleanHex.substring(4, 6), 16);
    rgb = `rgb(${r}, ${g}, ${b})`;
  } else if (input.includes(",")) {
    const parts = input.replace(/[^\d,]/g, "").split(",").map(n => parseInt(n.trim()));
    rgb = `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
    hex = "#" + parts.map(x => x.toString(16).padStart(2, '0')).join("");
  }
  preview.style.background = hex;
  preview.textContent = `HEX: ${hex} | RGB: ${rgb}`;
  setStatus("colorStatus", "Color converted!");
}

function generateSecurePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!";
  let pass = "";
  for (let i = 0; i < 16; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  document.getElementById("generatedPassword").value = pass;
  setStatus("passGenStatus", "Password generated!");
}

function analyzeText() {
  const text = document.getElementById("wordCountInput").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById("wcWords").textContent = words;
  document.getElementById("wcChars").textContent = text.length;
  document.getElementById("wcTime").textContent = Math.ceil(words / 3.3) + "s";
}

function generateQR() {
  const text = document.getElementById("qrInput").value.trim();
  if (!text) return setStatus("qrStatus", "Enter text or URL.", false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
  document.getElementById("qrPreviewArea").innerHTML = `<img src="${qrUrl}" alt="QR" style="border-radius:8px; border:2px solid var(--card-border);">`;
  setStatus("qrStatus", "QR Code generated!");
}
