// Load User Profile on page startup & Register PWA Service Worker
document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
  registerPWA();
});

function registerPWA() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker registered:', reg.scope))
      .catch(err => console.log('PWA Service Worker failed:', err));
  }
}

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
  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const dob = document.getElementById("editDob").value;
  const address = document.getElementById("editAddress").value.trim();
  let avatar = document.getElementById("editAvatarUrl").value.trim();

  if (tempAvatarBase64) {
    avatar = tempAvatarBase64;
  } else if (avatar === "[Image Uploaded]") {
    const existing = JSON.parse(localStorage.getItem("userProfile"));
    avatar = existing ? existing.avatar : "";
  }

  const profile = { username, email, dob, address, avatar };
  localStorage.setItem("userProfile", JSON.stringify(profile));

  loadProfileData();
  closeProfileModal();
  alert("Profile updated successfully!");
}

// Tab Switching Logic
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

function jsonToCsv() {
  const val = document.getElementById("j2csvInput").value.trim();
  if (!val) return setStatus("j2csvStatus", "Please enter JSON data.", false);
  try {
    const data = JSON.parse(val);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) throw new Error("JSON array is empty.");
    const keys = Object.keys(arr[0]);
    let csv = keys.join(",") + "\n";
    arr.forEach(row => {
      csv += keys.map(k => `"${String(row[k] !== undefined ? row[k] : '')}"`).join(",") + "\n";
    });
    saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "converted.csv");
    setStatus("j2csvStatus", "CSV file created and downloaded successfully!");
  } catch (err) {
    setStatus("j2csvStatus", "Error: " + err.message, false);
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
  const fileInput = document.getElementById("svgFile");
  const svgCodeInput = document.getElementById("svgCodeInput").value.trim();
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => processSvgString(e.target.result, fileInput.files[0].name.replace(/\.svg$/i, "") || "converted_svg");
    reader.readAsText(fileInput.files[0]);
  } else if (svgCodeInput) {
    processSvgString(svgCodeInput, "custom_svg_design");
  } else {
    setStatus("svgStatus", "Please upload an SVG file or paste raw SVG code first.", false);
  }
}

function processSvgString(svgText, filenamePrefix) {
  try {
    if (!svgText.includes("xmlns")) {
      svgText = svgText.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 600;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(pngBlob => {
        URL.revokeObjectURL(url);
        if (!pngBlob) return setStatus("svgStatus", "Rasterization failed.", false);
        saveBlob(pngBlob, filenamePrefix + ".png");
        setStatus("svgStatus", "SVG successfully converted to PNG and downloaded!");
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); setStatus("svgStatus", "Invalid SVG markup.", false); };
    img.src = url;
  } catch (err) {
    setStatus("svgStatus", "Error processing SVG: " + err.message, false);
  }
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

function processUrl(isEncode) {
  const val = document.getElementById("urlInput").value;
  if (!val.trim()) return setStatus("urlStatus", "Please enter URL text.", false);
  try {
    if (isEncode) {
      document.getElementById("urlInput").value = encodeURIComponent(val);
      setStatus("urlStatus", "URL successfully encoded!");
    } else {
      document.getElementById("urlInput").value = decodeURIComponent(val);
      setStatus("urlStatus", "URL successfully decoded!");
    }
  } catch (err) {
    setStatus("urlStatus", "Invalid string for URL processing.", false);
  }
}

function mdToHtml() {
  const md = document.getElementById("mdInput").value;
  if (!md.trim()) return setStatus("mdStatus", "Enter markdown text.", false);
  let html = md.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*/gim, '<b>$1</b>');
  saveBlob(new Blob([html.trim()], { type: "text/html;charset=utf-8" }), "markdown.html");
  setStatus("mdStatus", "Markdown converted and downloaded!");
}

function convertTextCase(type) {
  const field = document.getElementById("caseInput");
  const val = field.value;
  if (!val.trim()) return setStatus("textCaseStatus", "Please enter text.", false);
  if (type === 'upper') {
    field.value = val.toUpperCase();
    setStatus("textCaseStatus", "Converted to UPPERCASE!");
  } else if (type === 'lower') {
    field.value = val.toLowerCase();
    setStatus("textCaseStatus", "Converted to lowercase!");
  } else if (type === 'title') {
    field.value = val.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    setStatus("textCaseStatus", "Converted to Title Case!");
  }
}

const morseMap = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/'
};
const reverseMorseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

function textToMorse() {
  const val = document.getElementById("morseInput").value.toUpperCase();
  if (!val.trim()) return setStatus("morseStatus", "Please enter text.", false);
  document.getElementById("morseInput").value = val.split("").map(char => morseMap[char] || char).join(" ");
  setStatus("morseStatus", "Converted to Morse Code!");
}

function morseToText() {
  const val = document.getElementById("morseInput").value.trim();
  if (!val) return setStatus("morseStatus", "Please enter Morse code.", false);
  document.getElementById("morseInput").value = val.split(" ").map(code => reverseMorseMap[code] || code).join("");
  setStatus("morseStatus", "Converted to Plain Text!");
}

function textToBinary() {
  const val = document.getElementById("binaryInput").value;
  if (!val.trim()) return setStatus("binaryStatus", "Please enter text.", false);
  document.getElementById("binaryInput").value = val.split("").map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(" ");
  setStatus("binaryStatus", "Converted to Binary!");
}

function binaryToText() {
  const val = document.getElementById("binaryInput").value.trim();
  if (!val) return setStatus("binaryStatus", "Please enter binary string.", false);
  try {
    document.getElementById("binaryInput").value = val.split(" ").map(bin => String.fromCharCode(parseInt(bin, 2))).join("");
    setStatus("binaryStatus", "Converted to Text!");
  } catch (e) {
    setStatus("binaryStatus", "Invalid binary format.", false);
  }
}

function convertColor() {
  const input = document.getElementById("colorInput").value.trim();
  const preview = document.getElementById("colorPreviewBox");
  if (!input) return setStatus("colorStatus", "Please enter a color value.", false);
  let hex = "", rgb = "";
  if (input.startsWith("#")) {
    hex = input;
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) cleanHex = cleanHex.split("").map(c => c + c).join("");
    if (cleanHex.length !== 6) return setStatus("colorStatus", "Invalid HEX code format.", false);
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    rgb = `rgb(${r}, ${g}, ${b})`;
  } else if (input.toLowerCase().includes("rgb") || input.includes(",")) {
    const parts = input.replace(/[^\d,]/g, "").split(",").map(n => parseInt(n.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) return setStatus("colorStatus", "Invalid RGB format.", false);
    rgb = `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
    hex = "#" + parts.map(x => x.toString(16).padStart(2, '0')).join("");
  } else {
    return setStatus("colorStatus", "Unrecognized color format.", false);
  }
  preview.style.background = hex;
  preview.style.color = (parseInt(hex.replace("#",""), 16) > 0x888888) ? "#000" : "#fff";
  preview.textContent = `HEX: ${hex} | RGB: ${rgb}`;
  setStatus("colorStatus", "Color successfully converted!");
}

function generateSecurePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!";
  let pass = "";
  for (let i = 0; i < 16; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("generatedPassword").value = pass;
  setStatus("passGenStatus", "Secure password generated successfully!");
}

function analyzeText() {
  const text = document.getElementById("wordCountInput").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const seconds = Math.ceil(words / 3.3);
  document.getElementById("wcWords").textContent = words;
  document.getElementById("wcChars").textContent = chars;
  document.getElementById("wcTime").textContent = seconds + "s";
  setStatus("wordCountStatus", "Live text statistics active.");
}

function generateQR() {
  const text = document.getElementById("qrInput").value.trim();
  if (!text) return setStatus("qrStatus", "Please enter text or URL.", false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
  document.getElementById("qrPreviewArea").innerHTML = `<img src="${qrUrl}" alt="QR" style="border-radius:8px; border:2px solid var(--card-border);">`;
  setStatus("qrStatus", "QR Code generated!");
}
