/* ==========================================================================
   FILE CONVERTER PRO 2027 - COMPLETE SCRIPT SUITE
   Developer: kaushalji
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
  initThemePreference();
  initCanvasListeners();
  initCalendar();
  renderBgSelectedColors();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("./sw.js").catch(err => console.warn("Service worker registration failed:", err));
  }
});

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("appTheme", newTheme);
}

function initThemePreference() {
  const savedTheme = localStorage.getItem("appTheme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);
}

function loadProfileData() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || { username: "kaushalji" };
  const navUsername = document.getElementById("navUsername");
  const navAvatar = document.getElementById("navAvatar");
  if(navUsername) navUsername.textContent = profile.username;
  if(navAvatar) navAvatar.textContent = profile.username.substring(0, 2).toUpperCase();
}

function openProfileModal() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || { username: "kaushalji" };
  document.getElementById("editUsername").value = profile.username;
  document.getElementById("profileModal").classList.add("active");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("active");
}

function saveProfile(event) {
  event.preventDefault();
  const username = document.getElementById("editUsername").value.trim();
  localStorage.setItem("userProfile", JSON.stringify({ username }));
  loadProfileData();
  closeProfileModal();
}

function openTool(viewId) {
  document.getElementById('homeDashboard').style.display = 'none';
  document.querySelectorAll('.tool-view').forEach(el => el.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if(targetView) targetView.classList.add('active');
  if (viewId === 'typingSpeedView') resetTypingTest();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  stopTypingTestForce();
  document.querySelectorAll('.tool-view').forEach(el => el.classList.remove('active'));
  document.getElementById('homeDashboard').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openAppInfoModal() { document.getElementById('appInfoModal').classList.add('active'); }
function closeAppInfoModal() { document.getElementById('appInfoModal').classList.remove('active'); }

function setStatus(id, text, isSuccess = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'status ' + (isSuccess ? 'success' : 'error');
}

function updateFileName(input, textId) {
  if (input.files && input.files[0]) {
    document.getElementById(textId).innerHTML = `<i class="fa-solid fa-file"></i> ${input.files[0].name}`;
  }
}

/* ================= FILE REVIEW & EXPORT MODAL SYSTEM ================= */
let generatedFileBlobCache = null;
let generatedFileNameCache = "";

function showFileReviewModal(blob, fileName, fileType = "text") {
  generatedFileBlobCache = blob;
  generatedFileNameCache = fileName;
  const modal = document.getElementById("fileReviewModal");
  const previewBox = document.getElementById("reviewContentBox");
  if(!modal || !previewBox) return;

  if (fileType === "text" || fileType === "json" || fileType === "csv" || fileType === "html") {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewBox.value = e.target.result;
    };
    reader.readAsText(blob);
  } else {
    previewBox.value = `[Binary File Ready for Download: ${fileName}]\nSize: ${(blob.size / 1024).toFixed(2)} KB`;
  }
  
  document.getElementById("reviewModalTitle").textContent = `Review Converted File: ${fileName}`;
  modal.classList.add("active");
}

function closeFileReviewModal() {
  const modal = document.getElementById("fileReviewModal");
  if(modal) modal.classList.remove("active");
}

function downloadReviewedFile() {
  if (!generatedFileBlobCache) return;
  saveBlobDirect(generatedFileBlobCache, generatedFileNameCache);
  closeFileReviewModal();
}

function saveBlob(blob, name, fileType = "text") {
  showFileReviewModal(blob, name, fileType);
  saveBlobDirect(blob, name);
}

function saveBlobDirect(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ================= NUMBER SYSTEM CONVERTER LOGIC ================= */
function convertNumberBase() {
  const input = document.getElementById("numInput").value.trim();
  const fromBase = parseInt(document.getElementById("fromBase").value);
  const toBase = parseInt(document.getElementById("toBase").value);

  if (!input) {
    return setStatus("numStatus", "Pehle koi number input karein!", false);
  }

  try {
    const decimalValue = parseInt(input, fromBase);
    if (isNaN(decimalValue)) {
      throw new Error("Invalid number for selected source base.");
    }
    const converted = decimalValue.toString(toBase).toUpperCase();
    document.getElementById("numOutput").value = converted;
    setStatus("numStatus", `Successfully converted from Base ${fromBase} to Base ${toBase}!`);
  } catch (e) {
    setStatus("numStatus", "Invalid Number Format for chosen base!", false);
  }
}

function quickConvertBase(fBase, tBase) {
  document.getElementById("fromBase").value = fBase;
  document.getElementById("toBase").value = tBase;
  convertNumberBase();
}

/* Canvas & Photoshop Logic */
let openPhotosList = [];
let activePhotoIndex = 0;
let activePhotoshopTool = 'global';
let freeformPoints = [];
let isDrawingFreeform = false;
let isDrawingBrush = false, lastX = 0, lastY = 0;

function initCanvasListeners() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas) return;
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  };
  const startAction = (e) => {
    e.preventDefault();
    if (openPhotosList.length === 0) return;
    const pos = getPos(e);
    if (activePhotoshopTool === 'freeform' || activePhotoshopTool === 'crop') {
      if (!isDrawingFreeform) { freeformPoints = [pos]; isDrawingFreeform = true; }
      else { freeformPoints.push(pos); }
      applyEditorFilters();
    } else if (activePhotoshopTool === 'brush') {
      isDrawingBrush = true; lastX = pos.x; lastY = pos.y;
    }
  };
  const moveAction = (e) => {
    e.preventDefault();
    if (openPhotosList.length === 0) return;
    const pos = getPos(e);
    if (isDrawingFreeform) { freeformPoints.push(pos); applyEditorFilters(); }
    else if (isDrawingBrush) {
      const photo = openPhotosList[activePhotoIndex];
      const bCtx = photo.bufferCanvas.getContext("2d");
      bCtx.strokeStyle = document.getElementById("brushColorPicker").value;
      bCtx.lineWidth = parseInt(document.getElementById("brushSizeRange").value) || 5;
      bCtx.lineCap = "round"; bCtx.lineJoin = "round";
      bCtx.beginPath(); bCtx.moveTo(lastX, lastY); bCtx.lineTo(pos.x, pos.y); bCtx.stroke();
      lastX = pos.x; lastY = pos.y; applyEditorFilters();
    }
  };
  const endAction = (e) => { e.preventDefault(); isDrawingBrush = false; };
  canvas.addEventListener("mousedown", startAction);
  canvas.addEventListener("mousemove", moveAction);
  canvas.addEventListener("mouseup", endAction);
  canvas.addEventListener("touchstart", startAction, { passive: false });
  canvas.addEventListener("touchmove", moveAction, { passive: false });
  canvas.addEventListener("touchend", endAction, { passive: false });
}

function loadMultipleEditorImages(input) {
  if (input.files && input.files.length > 0) {
    let loadedCount = 0;
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const bufCanvas = document.createElement("canvas");
          bufCanvas.width = img.width; bufCanvas.height = img.height;
          bufCanvas.getContext("2d").drawImage(img, 0, 0);
          openPhotosList.push({ name: file.name, imgObj: img, bufferCanvas: bufCanvas, brightness: 100, contrast: 100, saturate: 100, blur: 0, rotate: 0, flip: false, specialEffect: 'none' });
          loadedCount++;
          if (loadedCount === input.files.length) {
            activePhotoIndex = openPhotosList.length - 1;
            document.getElementById("editorControls").classList.remove("hidden");
            document.getElementById("photoTabsContainer").classList.remove("hidden");
            renderPhotoTabs(); applyEditorFilters();
          }
        }; img.src = e.target.result;
      }; reader.readAsDataURL(file);
    });
  }
}

function renderPhotoTabs() {
  const list = document.getElementById("tabsList"); if(!list) return; list.innerHTML = "";
  openPhotosList.forEach((photo, idx) => {
    const tab = document.createElement("button");
    tab.className = `photo-tab-item ${idx === activePhotoIndex ? 'active' : ''}`;
    tab.innerHTML = `<i class="fa-solid fa-image"></i> ${photo.name} <span class="tab-close" onclick="closePhotoTab(event, ${idx})">&times;</span>`;
    tab.onclick = () => switchActivePhoto(idx);
    list.appendChild(tab);
  });
}

function switchActivePhoto(idx) {
  activePhotoIndex = idx; freeformPoints = []; renderPhotoTabs();
  const photo = openPhotosList[activePhotoIndex];
  document.getElementById("eBrightness").value = photo.brightness;
  document.getElementById("eContrast").value = photo.contrast;
  document.getElementById("eSaturate").value = photo.saturate;
  document.getElementById("eBlur").value = photo.blur;
  applyEditorFilters();
  setStatus("editorStatus", `Switched to photo: ${photo.name}`);
}

function closePhotoTab(event, idx) {
  event.stopPropagation(); openPhotosList.splice(idx, 1);
  if (openPhotosList.length === 0) {
    document.getElementById("editorControls").classList.add("hidden");
    document.getElementById("photoTabsContainer").classList.add("hidden");
  } else {
    if (activePhotoIndex >= openPhotosList.length) activePhotoIndex = openPhotosList.length - 1;
    renderPhotoTabs(); switchActivePhoto(activePhotoIndex);
  }
}

function setPhotoshopTool(toolName) {
  activePhotoshopTool = toolName;
  document.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.remove('active'));
  if (toolName === 'global') document.getElementById('btnToolGlobal').classList.add('active');
  if (toolName === 'freeform') document.getElementById('btnToolFreeform').classList.add('active');
  if (toolName === 'brush') document.getElementById('btnToolBrush').classList.add('active');
  if (toolName === 'crop') document.getElementById('btnToolCrop').classList.add('active');
  document.getElementById("globalControlsPanel").classList.toggle("hidden", toolName !== 'global');
  document.getElementById("freeformControlsPanel").classList.toggle("hidden", toolName !== 'freeform');
  document.getElementById("brushControlsPanel").classList.toggle("hidden", toolName !== 'brush');
  if (toolName !== 'freeform') { freeformPoints = []; isDrawingFreeform = false; applyEditorFilters(); }
  setStatus("editorStatus", `Active Tool: ${toolName.toUpperCase()}`);
}

function applyEditorFilters() {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  if (activePhotoshopTool === 'global') {
    photo.brightness = document.getElementById("eBrightness").value;
    photo.contrast = document.getElementById("eContrast").value;
    photo.saturate = document.getElementById("eSaturate").value;
    photo.blur = document.getElementById("eBlur").value;
  }
  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = (photo.rotate % 180 === 0) ? photo.bufferCanvas.width : photo.bufferCanvas.height;
  canvas.height = (photo.rotate % 180 === 0) ? photo.bufferCanvas.height : photo.bufferCanvas.width;
  ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((photo.rotate * Math.PI) / 180);
  ctx.scale(photo.flip ? -1 : 1, 1);
  let filter = `brightness(${photo.brightness}%) contrast(${photo.contrast}%) saturate(${photo.saturate}%) blur(${photo.blur}px)`;
  if (photo.specialEffect === 'sepia') filter += ' sepia(100%)';
  if (photo.specialEffect === 'invert') filter += ' invert(100%)';
  ctx.filter = filter;
  ctx.drawImage(photo.bufferCanvas, -photo.bufferCanvas.width / 2, -photo.bufferCanvas.height / 2);
  ctx.restore();
  if (freeformPoints.length > 1) {
    ctx.save(); ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(freeformPoints[0].x, freeformPoints[0].y);
    for (let i = 1; i < freeformPoints.length; i++) { ctx.lineTo(freeformPoints[i].x, freeformPoints[i].y); }
    ctx.closePath(); ctx.stroke(); ctx.fillStyle = 'rgba(249, 115, 22, 0.2)'; ctx.fill(); ctx.restore();
  }
}

function clearSelection() { freeformPoints = []; isDrawingFreeform = false; applyEditorFilters(); setStatus("editorStatus", "Freeform shape cleared."); }

function fillCustomShapeWithColor() {
  if (freeformPoints.length < 3) return alert("Pehle screen par koi shape/lasso draw karein!");
  const photo = openPhotosList[activePhotoIndex];
  const bCtx = photo.bufferCanvas.getContext("2d");
  const fillColor = document.getElementById("shapeFillColor").value;
  bCtx.save(); bCtx.beginPath(); bCtx.moveTo(freeformPoints[0].x, freeformPoints[0].y);
  for (let i = 1; i < freeformPoints.length; i++) { bCtx.lineTo(freeformPoints[i].x, freeformPoints[i].y); }
  bCtx.closePath(); bCtx.fillStyle = fillColor; bCtx.fill(); bCtx.restore();
  freeformPoints = []; isDrawingFreeform = false; applyEditorFilters();
  setStatus("editorStatus", "Color filled successfully inside the freeform shape!");
}

function editSelectedArea(type) {
  if (freeformPoints.length < 3) return alert("Pehle screen par koi shape/lasso draw karein!");
  const photo = openPhotosList[activePhotoIndex];
  const bCtx = photo.bufferCanvas.getContext("2d");
  bCtx.save(); bCtx.beginPath(); bCtx.moveTo(freeformPoints[0].x, freeformPoints[0].y);
  for (let i = 1; i < freeformPoints.length; i++) { bCtx.lineTo(freeformPoints[i].x, freeformPoints[i].y); }
  bCtx.closePath(); bCtx.clip();
  const imgData = bCtx.getImageData(0, 0, photo.bufferCanvas.width, photo.bufferCanvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (type === 'brightness') { d[i] = Math.min(255, d[i] + 50); d[i + 1] = Math.min(255, d[i + 1] + 50); d[i + 2] = Math.min(255, d[i + 2] + 50); }
    else if (type === 'darken') { d[i] = Math.max(0, d[i] - 50); d[i + 1] = Math.max(0, d[i + 1] - 50); d[i + 2] = Math.max(0, d[i + 2] - 50); }
    else if (type === 'grayscale') { const avg = (d[i] + d[i + 1] + d[i + 2]) / 3; d[i] = avg; d[i + 1] = avg; d[i + 2] = avg; }
  }
  bCtx.putImageData(imgData, 0, 0); bCtx.restore();
  freeformPoints = []; isDrawingFreeform = false; applyEditorFilters();
  setStatus("editorStatus", `Applied ${type} to freeform shape!`);
}

function rotateEditorImage(deg) { if (openPhotosList.length === 0) return; const photo = openPhotosList[activePhotoIndex]; photo.rotate = (photo.rotate + deg) % 360; applyEditorFilters(); }
function flipEditorImage() { if (openPhotosList.length === 0) return; const photo = openPhotosList[activePhotoIndex]; photo.flip = !photo.flip; applyEditorFilters(); }
function applySpecialEffect(eff) { if (openPhotosList.length === 0) return; const photo = openPhotosList[activePhotoIndex]; photo.specialEffect = (photo.specialEffect === eff) ? 'none' : eff; applyEditorFilters(); }
function quickFilterAdjust(type) {
  if (openPhotosList.length === 0) return; const photo = openPhotosList[activePhotoIndex];
  if (type === 'brightness') { photo.brightness = 140; document.getElementById("eBrightness").value = 140; }
  if (type === 'contrast') { photo.contrast = 150; document.getElementById("eContrast").value = 150; }
  if (type === 'grayscale') { photo.saturate = 0; document.getElementById("eSaturate").value = 0; }
  applyEditorFilters();
}
function resetCurrentPhoto() {
  if (openPhotosList.length === 0) return; const photo = openPhotosList[activePhotoIndex];
  const buf = document.createElement("canvas"); buf.width = photo.imgObj.width; buf.height = photo.imgObj.height;
  buf.getContext("2d").drawImage(photo.imgObj, 0, 0); photo.bufferCanvas = buf;
  photo.brightness = 100; photo.contrast = 100; photo.saturate = 100; photo.blur = 0; photo.rotate = 0; photo.flip = false; photo.specialEffect = 'none';
  freeformPoints = []; applyEditorFilters(); setStatus("editorStatus", "Photo reset to original state.");
}
function downloadEditedImage() {
  if (openPhotosList.length === 0) return; const photo = openPhotosList[activePhotoIndex];
  document.getElementById("editorCanvas").toBlob(blob => { saveBlob(blob, `PhotoshopFreeform_${photo.name}`, "image"); setStatus("editorStatus", "Photo ready for review & download!"); }, "image/png");
}

/* Typing Test Logic */
const typingLessons = { 1: "asdf jkl; asdf jkl; ff jj dd kk ss ll aa ;; touch typing builds finger muscle memory for fast and accurate typing sessions.", 2: "client side web architecture relies heavily on efficient html markup cascading style sheets and modern modular javascript code structures.", 3: "graphic design and digital asset creation require distinct neon aesthetics vibrant color palettes and precise typography matching user branding.", 4: "firebase real-time databases and secure cloud storage configurations empower seamless user registration workflows and dynamic data handlers.", 5: "progressive web apps deploy robust offline caching mechanics via service workers ensuring continuity independent of live network connections.", 6: "maintaining a personal philosophy of helping others without causing distress fosters positive interpersonal experiences and supportive networks.", 7: "network device protocols routers and backend firewall security rules protect corporate servers against unauthorized external intrusion.", 8: "python programming logic and problem solving algorithms simplify complex data manipulation tasks and automate repetitive workflows.", 9: "tally prime software configurations optimize corporate invoice printing setups and financial record management within educational constraints.", 10: "expert touch typists achieve remarkable speed exceeding eighty words per minute by maintaining correct finger placement rhythm and absolute focus." };
let typingTimer = null; let timeLeft = 60; let totalTimeSec = 60; let isTypingActive = false; let currentLessonText = "";

function beginTypingTestSession() {
  const lessonId = document.getElementById("typingLessonSelect").value;
  currentLessonText = typingLessons[lessonId];
  totalTimeSec = parseInt(document.getElementById("typingTimeSelect").value);
  timeLeft = totalTimeSec;
  document.getElementById("typingSetupBox").classList.add("hidden");
  document.getElementById("typingWorkspace").classList.remove("hidden");
  const passageBox = document.getElementById("passageDisplayBox");
  passageBox.innerHTML = currentLessonText.split("").map(c => `<span>${c}</span>`).join("");
  const inputArea = document.getElementById("typingInput");
  inputArea.value = ""; inputArea.disabled = false; inputArea.focus();
  document.getElementById("tsTime").textContent = timeLeft + "s";
  document.getElementById("tsWpm").textContent = "0";
  document.getElementById("tsAccuracy").textContent = "100%";
  document.getElementById("tsErrors").textContent = "0";
  document.getElementById("typingProgressBar").style.width = "0%";
  if (typingTimer) clearInterval(typingTimer);
  isTypingActive = true;
  typingTimer = setInterval(() => {
    timeLeft--; document.getElementById("tsTime").textContent = timeLeft + "s";
    const progressPercent = ((totalTimeSec - timeLeft) / totalTimeSec) * 100;
    document.getElementById("typingProgressBar").style.width = progressPercent + "%";
    if (timeLeft <= 0) { finishTypingTest(); }
  }, 1000);
}

function evaluateTyping() {
  if (!isTypingActive) return;
  const typedVal = document.getElementById("typingInput").value;
  const spans = document.getElementById("passageDisplayBox").querySelectorAll("span");
  let errors = 0;
  for (let i = 0; i < spans.length; i++) {
    if (i < typedVal.length) {
      if (typedVal[i] === currentLessonText[i]) { spans[i].style.color = "var(--success)"; }
      else { spans[i].style.color = "var(--error)"; errors++; }
    } else { spans[i].style.color = "var(--text-main)"; }
  }
  const timeElapsedMin = (totalTimeSec - timeLeft) / 60;
  const wordsTyped = typedVal.trim().split(/\s+/).filter(Boolean).length;
  const wpm = timeElapsedMin > 0 ? Math.round(wordsTyped / timeElapsedMin) : 0;
  const accuracy = typedVal.length > 0 ? Math.max(0, Math.round(((typedVal.length - errors) / typedVal.length) * 100)) : 100;
  document.getElementById("tsWpm").textContent = wpm;
  document.getElementById("tsAccuracy").textContent = accuracy + "%";
  document.getElementById("tsErrors").textContent = errors;
  if (typedVal.length >= currentLessonText.length) { finishTypingTest(); }
}

function finishTypingTest() {
  if (!isTypingActive) return;
  isTypingActive = false; clearInterval(typingTimer);
  document.getElementById("typingInput").disabled = true;
  const finalWpm = document.getElementById("tsWpm").textContent;
  const finalAcc = document.getElementById("tsAccuracy").textContent;
  const lessonNum = document.getElementById("typingLessonSelect").value;
  document.getElementById("modalFinalWpm").textContent = finalWpm;
  document.getElementById("modalFinalAcc").textContent = finalAcc;
  document.getElementById("modalLessonName").textContent = `Completed Lesson ${lessonNum}: Typing Master 12 Certified`;
  document.getElementById("typingResultModal").classList.add("active");
}

function closeTypingResultModal() { document.getElementById("typingResultModal").classList.remove("active"); resetTypingTest(); }
function resetTypingTest() { if (typingTimer) clearInterval(typingTimer); isTypingActive = false; document.getElementById("typingWorkspace").classList.add("hidden"); document.getElementById("typingSetupBox").classList.remove("hidden"); setStatus("typingStatus", "Lesson reset. Choose parameters to start again."); }
function stopTypingTestForce() { if (typingTimer) clearInterval(typingTimer); isTypingActive = false; }

/* SVG Utilities */
let loadedSvgString = "";
function loadSvgFile(input) {
  if (input.files && input.files[0]) {
    updateFileName(input, 'svgFileText');
    const reader = new FileReader();
    reader.onload = e => {
      loadedSvgString = e.target.result;
      document.getElementById("svgCodeInput").value = loadedSvgString;
      setStatus("svgStatus", "SVG file loaded successfully!");
    }; reader.readAsText(input.files[0]);
  }
}

function svgToPng() {
  const code = document.getElementById("svgCodeInput").value.trim() || loadedSvgString;
  if (!code) { return setStatus("svgStatus", "Pehle SVG code paste karein ya file upload karein!", false); }
  const blob = new Blob([code], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || 800; c.height = img.naturalHeight || 600;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
    c.toBlob(pngBlob => {
      URL.revokeObjectURL(url);
      saveBlob(pngBlob, "Converted_Logo.png", "image");
      setStatus("svgStatus", "SVG successfully converted & ready for review!");
    }, "image/png");
  };
  img.onerror = () => { setStatus("svgStatus", "Invalid SVG code format!", false); };
  img.src = url;
}

/* BG Remover Logic */
let bgSourceImageObj = null; let selectedBgColors = [];
function loadBgRemImage(input) {
  if (input.files && input.files[0]) {
    updateFileName(input, 'bgImgText');
    const r = new FileReader();
    r.onload = e => {
      bgSourceImageObj = new Image();
      bgSourceImageObj.onload = () => {
        selectedBgColors = [];
        document.getElementById("bgControlsContainer").classList.remove("hidden");
        const c = document.getElementById("bgSourceCanvas");
        c.width = bgSourceImageObj.naturalWidth; c.height = bgSourceImageObj.naturalHeight;
        c.getContext("2d").drawImage(bgSourceImageObj, 0, 0);
        renderBgSelectedColors(); processBgRemovalLive();
      }; bgSourceImageObj.src = e.target.result;
    }; r.readAsDataURL(input.files[0]);
  }
}

function pickColorForBg(e) {
  if (!bgSourceImageObj) return;
  const c = document.getElementById("bgSourceCanvas");
  const rect = c.getBoundingClientRect();
  const x = Math.max(0, Math.min(c.width - 1, Math.floor((e.clientX - rect.left) * (c.width / rect.width))));
  const y = Math.max(0, Math.min(c.height - 1, Math.floor((e.clientY - rect.top) * (c.height / rect.height))));
  const pixel = c.getContext("2d").getImageData(x, y, 1, 1).data;
  const color = { r: pixel[0], g: pixel[1], b: pixel[2] };
  const duplicate = selectedBgColors.some(v => Math.hypot(v.r - color.r, v.g - color.g, v.b - color.b) < 8);
  if (!duplicate) selectedBgColors.push(color);
  renderBgSelectedColors(); processBgRemovalLive();
}

function renderBgSelectedColors() {
  const host = document.getElementById("bgSelectedColors");
  const display = document.getElementById("selectedColorDisplay");
  if (!host || !display) return;
  display.textContent = `Selected colors: ${selectedBgColors.length}`;
  host.innerHTML = "";
  if (!selectedBgColors.length) {
    host.innerHTML = '<span class="muted-note">Image par alag-alag background colors tap karke select karein.</span>';
    return;
  }
  selectedBgColors.forEach((c, index) => {
    const chip = document.createElement('span'); chip.className = 'bg-color-chip';
    const swatch = document.createElement('span'); swatch.className = 'bg-color-swatch'; swatch.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    const label = document.createElement('span'); label.textContent = `RGB ${c.r}, ${c.g}, ${c.b}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.title = 'Remove this color'; remove.textContent = '×';
    remove.addEventListener('click', () => { selectedBgColors.splice(index, 1); renderBgSelectedColors(); processBgRemovalLive(); });
    chip.append(swatch, label, remove); host.appendChild(chip);
  });
}

function clearBgSelectedColors() { selectedBgColors = []; renderBgSelectedColors(); processBgRemovalLive(); }
function updateBgToleranceLabel() { document.getElementById("tolValueLabel").textContent = document.getElementById("bgTolerance").value; }

function processBgRemovalLive() {
  if (!bgSourceImageObj) return;
  const tol = parseInt(document.getElementById("bgTolerance").value, 10) || 35;
  const p = document.getElementById("bgPreviewCanvas");
  p.width = bgSourceImageObj.naturalWidth; p.height = bgSourceImageObj.naturalHeight;
  const ctx = p.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, p.width, p.height); ctx.drawImage(bgSourceImageObj, 0, 0);
  if (!selectedBgColors.length) return;
  const imgData = ctx.getImageData(0, 0, p.width, p.height);
  const d = imgData.data;
  const threshold = tol * 3.5;
  for (let i = 0; i < d.length; i += 4) {
    for (const color of selectedBgColors) {
      const dist = Math.hypot(d[i] - color.r, d[i + 1] - color.g, d[i + 2] - color.b);
      if (dist <= threshold) { d[i + 3] = 0; break; }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function downloadBgRemovedImage() {
  const canvas = document.getElementById("bgPreviewCanvas");
  if (!canvas || !bgSourceImageObj) return setStatus("bgRemStatus", "Choose an image first", false);
  canvas.toBlob(blob => {
    if (blob) saveBlob(blob, "Transparent.png", "image");
  }, "image/png");
}

/* Text & Emoji Mapping */
const textEmojiMap = { "i love you": "❤️", "love you": "❤️", "good morning": "🌅", "good night": "🌙", "thank you": "🙏", "thanks": "🙏", "happy birthday": "🎂🎉", "congratulations": "🎉", "good luck": "🍀", "well done": "👏", "take care": "🤗", "how are you": "🤝", "fine": "😊", "welcome": "✨", "good job": "👍", "see you later": "👋", "bye bye": "👋", "happy new year": "🎆", "merry christmas": "🎄", "happy diwali": "🪔", "happy holi": "🎨", "happy eid": "🌙✨", "i am happy": "😊", "i'm happy": "😊", "i am sad": "😢", "i'm sad": "😢", "i am angry": "😠", "i am tired": "🥱", "happy": "😊", "smile": "😊", "sad": "😢", "cry": "😭", "angry": "😠", "love": "❤️", "heart": "❤️", "laugh": "😂", "smile please": "😁", "crying": "😭", "excited": "🤩", "shocked": "😱", "surprised": "😲", "fear": "😨", "scared": "👻", "bored": "😐", "sleepy": "😴", "hungry": "🤤", "thirsty": "🥤", "sick": "🤒", "cool": "😎", "smart": "🤓", "nerd": "🤓", "proud": "😌", "shy": "😳", "wink": "😉", "kiss": "💋", "hug": "🫂", "thinking": "🤔", "confused": "😕", "dizzy": "😵", "like": "👍", "dislike": "👎", "yes": "✅", "no": "❌", "ok": "👌", "okay": "👌", "hello": "👋", "hi": "👋", "bye": "👋", "clap": "👏", "pray": "🙏", "high five": "🙌", "peace": "✌️", "rock": "🤘", "punch": "👊", "muscle": "💪", "run": "🏃", "walk": "🚶", "jump": "🦘", "dance": "💃", "sit": "🪑", "stand": "🧍", "sleep": "🛌", "wake up": "⏰", "eat": "🍽️", "drink": "🥤", "cook": "👨‍🍳", "write": "✍️", "read": "📖", "listen": "👂", "look": "👀", "speak": "🗣️", "talk": "💬", "call": "📞", "message": "✉️", "send": "📤", "receive": "📥", "search": "🔍", "find": "🔎", "buy": "🛍️", "sell": "🏷️", "pay": "💳", "money": "💰", "work": "💻", "play": "🎮", "game": "🕹️", "win": "🏆", "lose": "❌", "fight": "⚔️", "friend": "🫂", "friends": "🫂", "family": "👨‍👩‍👧‍👦", "mother": "👩", "father": "👨", "brother": "👦", "sister": "👧", "son": "👦", "daughter": "👧", "baby": "👶", "boy": "👦", "girl": "👧", "man": "👨", "woman": "👩", "grandfather": "👴", "grandmother": "👵", "teacher": "👨‍🏫", "student": "👨‍🎓", "doctor": "👨‍⚕️", "nurse": "👩‍⚕️", "police": "👮", "king": "👑", "queen": "👸", "boss": "💼", "employee": "🧑‍💻", "leader": "🦁", "hero": "🦸", "villain": "🦹", "food": "🍔", "pizza": "🍕", "burger": "🍔", "tea": "☕", "coffee": "☕", "water": "💧", "milk": "🥛", "juice": "🧃", "beer": "🍺", "wine": "🍷", "party": "🥳", "cake": "🎂", "ice cream": "🍨", "chocolate": "🍫", "candy": "🍬", "fruit": "🍎", "apple": "🍎", "banana": "🍌", "mango": "🥭", "orange": "🍊", "grapes": "🍇", "watermelon": "🍉", "vegetable": "🥦", "potato": "🥔", "tomato": "🍅", "onion": "🧅", "garlic": "🧄", "rice": "🍚", "bread": "🍞", "egg": "🥚", "chicken": "🍗", "meat": "🥩", "fish": "🐟", "soup": "🍲", "salt": "🧂", "sugar": "🍬", "honey": "🍯", "rain": "🌧️", "sun": "☀️", "fire": "🔥", "star": "⭐", "moon": "🌙", "cloud": "☁️", "storm": "⛈️", "lightning": "⚡", "snow": "❄️", "wind": "💨", "rainbow": "🌈", "earth": "🌍", "world": "🌎", "tree": "🌳", "flower": "🌸", "rose": "🌹", "leaf": "🍃", "grass": "🌱", "mountain": "⛰️", "river": "🌊", "ocean": "🌊", "sea": "🌊", "beach": "🏖️", "desert": "🏜️", "animal": "🐾", "dog": "🐶", "cat": "🐱", "cow": "🐮", "buffalo": "🐃", "horse": "🐴", "sheep": "🐑", "goat": "🐐", "lion": "🦁", "tiger": "🐅", "elephant": "🐘", "monkey": "🐒", "rabbit": "🐇", "fox": "🦊", "bear": "🐻", "panda": "🐼", "bird": "🐦", "parrot": "🦜", "pigeon": "🕊️", "crow": "🐦‍⬛", "eagle": "🦅", "duck": "🦆", "fish": "🐟", "shark": "🦈", "whale": "🐋", "dolphin": "🐬", "snake": "🐍", "lizard": "🦎", "frog": "🐸", "butterfly": "🦋", "bee": "🐝", "ant": "🐜", "school": "🏫", "college": "🏛️", "university": "🎓", "study": "📚", "book": "📖", "pen": "🖊️", "pencil": "✏️", "paper": "📄", "note": "📝", "test": "📝", "exam": "📝", "result": "📊", "computer": "💻", "laptop": "💻", "phone": "📱", "mobile": "📱", "tablet": "📱", "internet": "🌐", "wifi": "📶", "code": "💻", "programming": "👨‍💻", "software": "⚙️", "hardware": "🖥️", "keyboard": "⌨️", "mouse": "🖱️", "printer": "🖨️", "camera": "📷", "video": "📹", "battery": "🔋", "travel": "✈️", "car": "🚗", "bike": "🏍️", "bicycle": "🚲", "bus": "🚌", "train": "🚆", "metro": "🚇", "plane": "✈️", "helicopter": "🚁", "ship": "🚢", "boat": "⛵", "rocket": "🚀", "map": "🗺️", "location": "📍", "hotel": "🏨", "house": "🏠", "building": "🏢", "hospital": "🏥", "bank": "🏦", "shop": "🏪", "market": "🛒", "airport": "✈️", "station": "🚉", "time": "⏰", "watch": "⌚", "clock": "🕒", "watch out": "⚠️", "key": "🔑", "lock": "🔒", "door": "🚪", "window": "🪟", "light": "💡", "bulb": "💡", "bag": "🎒", "box": "📦", "gift": "🎁", "ring": "💍", "glasses": "👓", "shirt": "👕", "pant": "👖", "shoe": "👞", "hat": "🧢", "umbrella": "☂️", "mirror": "🪞", "soap": "🧼", "brush": "🪥", "bed": "🛏️", "red": "🔴", "blue": "🔵", "green": "🟢", "yellow": "🟡", "black": "⚫", "white": "⚪", "purple": "🟣", "orange color": "🟠", "good": "👍", "bad": "👎", "best": "🏆", "worst": "💩", "fast": "⚡", "slow": "🐢", "big": "🐘", "small": "🐜", "hot": "🔥", "cold": "❄️", "new": "✨", "old": "📜", "true": "✅", "false": "❌", "right": "➡️", "left": "⬅️", "up": "⬆️", "down": "⬇️", "day": "☀️", "night": "🌙", "week": "📅", "month": "🗓️", "year": "⏳", "today": "📌", "tomorrow": "🌅", "yesterday": "⏪", "now": "⏱️", "later": "⏳", "always": "♾️", "never": "🚫", "here": "📍", "there": "👉", "where": "❓", "what": "❓", "who": "👤", "why": "❓", "how": "⚙️", "all": "💯", "none": "∅", "some": "➕", "more": "📈", "less": "📉", "high": "📈", "low": "📉", "rich": "🤑", "poor": "💸", "strong": "💪", "weak": "🥀", "clean": "✨", "dirty": "🗑️", "smart": "🧠", "fool": "🤡", "danger": "⚠️", "safe": "🛡️", "help": "🆘", "stop": "🛑", "start": "▶️", "play": "▶️", "pause": "⏸️", "record": "⏺️", "delete": "🗑️", "save": "💾", "share": "🔗", "copy": "📋", "paste": "📌", "cut": "✂️", "settings": "⚙️", "info": "ℹ️", "profile": "👤", "user": "🧑", "admin": "👑" };
const emojiTextMap = Object.fromEntries(Object.entries(textEmojiMap).map(([word, emoji]) => [emoji, word]));

function convertTextToEmoji() {
  const input = document.getElementById('emojiInput').value;
  if (!input.trim()) return setStatus('emojiStatus', 'Please enter a sentence first.', false);
  let output = input;
  Object.keys(textEmojiMap).sort((a, b) => b.length - a.length).forEach(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), match => textEmojiMap[match.toLowerCase()]);
  });
  document.getElementById('emojiOutput').value = output;
  setStatus('emojiStatus', 'Text converted to emoji.');
}

function convertEmojiToText() {
  const input = document.getElementById('emojiInput').value;
  if (!input.trim()) return setStatus('emojiStatus', 'Please enter emoji first.', false);
  let output = input;
  Object.keys(emojiTextMap).sort((a, b) => b.length - a.length).forEach(emoji => {
    output = output.split(emoji).join(` ${emojiTextMap[emoji]} `);
  });
  document.getElementById('emojiOutput').value = output.replace(/\s+([,.!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  setStatus('emojiStatus', 'Emoji converted to text.');
}

function copyEmojiResult() {
  const value = document.getElementById('emojiOutput').value;
  if (!value) return setStatus('emojiStatus', 'Nothing to copy.', false);
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(value).then(() => setStatus('emojiStatus', 'Copied to clipboard.')).catch(() => setStatus('emojiStatus', 'Copy not available.', false));
  else {
    const out = document.getElementById('emojiOutput');
    out.focus(); out.select();
    try { document.execCommand('copy'); setStatus('emojiStatus', 'Copied to clipboard.'); } catch (e) { setStatus('emojiStatus', 'Copy not available.', false); }
  }
}

function clearEmojiFields() { document.getElementById('emojiInput').value = ''; document.getElementById('emojiOutput').value = ''; setStatus('emojiStatus', ''); }

function convertToUltraHD(scale) {
  const input = document.getElementById("hdImgFile");
  if (!input.files || !input.files[0]) return setStatus("hdStatus", "Choose image first", false);
  const img = new Image(); const url = URL.createObjectURL(input.files[0]);
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = img.naturalWidth * scale; c.height = img.naturalHeight * scale;
    const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(blob => { URL.revokeObjectURL(url); saveBlob(blob, `UltraHD_${scale}X.png`, "image"); setStatus("hdStatus", "Upscaled & ready for review!"); }, "image/png");
  }; img.src = url;
}

function htmlToJson() {
  const htmlContent = document.getElementById("htmlInput").value;
  const jsonStr = JSON.stringify({ html: htmlContent }, null, 2);
  saveBlob(new Blob([jsonStr], { type: "application/json" }), "conv.json", "json");
  setStatus("h2jStatus", "HTML converted to JSON successfully!");
}

function jsonToHtml() {
  try {
    const o = JSON.parse(document.getElementById("jsonInput").value);
    const htmlContent = o.html || o;
    saveBlob(new Blob([htmlContent], { type: "text/html" }), "conv.html", "html");
    setStatus("j2hStatus", "JSON converted to HTML successfully!");
  } catch (e) { setStatus("j2hStatus", e.message, false); }
}

function csvToJson() {
  const lines = document.getElementById("csvInput").value.trim().split("\n");
  const headers = lines[0].split(",");
  const res = lines.slice(1).map(l => { const v = l.split(","); const o = {}; headers.forEach((h, i) => o[h] = v[i] || ""); return o; });
  const jsonStr = JSON.stringify(res, null, 2);
  saveBlob(new Blob([jsonStr], { type: "application/json" }), "csv.json", "json");
  setStatus("csvStatus", "CSV converted to JSON successfully!");
}

function jsonToCsv() {
  try {
    const d = JSON.parse(document.getElementById("j2csvInput").value);
    const keys = Object.keys(d[0]);
    let csv = keys.join(",") + "\n";
    d.forEach(r => csv += keys.map(k => `"${r[k] || ""}"`).join(",") + "\n");
    saveBlob(new Blob([csv], { type: "text/csv" }), "conv.csv", "csv");
    setStatus("j2csvStatus", "JSON converted to CSV successfully!");
  } catch (e) { setStatus("j2csvStatus", e.message, false); }
}

function imageConvert(id, fmt, stat) {
  const inp = document.getElementById(id);
  if (!inp.files[0]) return setStatus(stat, "Select image", false);
  const img = new Image();
  const url = URL.createObjectURL(inp.files[0]);
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    if (fmt === 'jpg') { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0);
    c.toBlob(b => {
      URL.revokeObjectURL(url);
      saveBlob(b, `converted_img.${fmt}`, "image");
      setStatus(stat, "Image formatted & ready for review!");
    }, `image/${fmt === 'jpg' ? 'jpeg' : fmt}`);
  };
  img.src = url;
}

function processBase64(enc) {
  try {
    const v = document.getElementById("base64Input").value;
    const res = enc ? btoa(v) : atob(v);
    document.getElementById("base64Input").value = res;
    setStatus("base64Status", "Success!");
  } catch (e) { setStatus("base64Status", "Error", false); }
}

function processUrl(enc) {
  const v = document.getElementById("urlInput").value;
  document.getElementById("urlInput").value = enc ? encodeURIComponent(v) : decodeURIComponent(v);
  setStatus("urlStatus", "Success!");
}

function mdToHtml() {
  let md = document.getElementById("mdInput").value;
  let html = md.replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*/gim, '<b>$1</b>');
  saveBlob(new Blob([html], { type: "text/html" }), "md.html", "html");
  setStatus("mdStatus", "Markdown converted to HTML!");
}

function convertTextCase(t) {
  let f = document.getElementById("caseInput"); let v = f.value;
  if (t === 'upper') f.value = v.toUpperCase();
  else if (t === 'lower') f.value = v.toLowerCase();
  else f.value = v.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  setStatus("textCaseStatus", "Converted!");
}

const mmap = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', ' ': '/' };
const rmap = Object.fromEntries(Object.entries(mmap).map(([k, v]) => [v, k]));
function textToMorse() { let v = document.getElementById("morseInput").value.toUpperCase(); document.getElementById("morseInput").value = v.split("").map(c => mmap[c] || c).join(" "); setStatus("morseStatus", "Converted!"); }
function morseToText() { let v = document.getElementById("morseInput").value.trim(); document.getElementById("morseInput").value = v.split(" ").map(c => rmap[c] || c).join(""); setStatus("morseStatus", "Converted!"); }
function textToBinary() { let v = document.getElementById("binaryInput").value; document.getElementById("binaryInput").value = v.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(" "); setStatus("binaryStatus", "Converted!"); }
function binaryToText() { try { let v = document.getElementById("binaryInput").value.trim(); document.getElementById("binaryInput").value = v.split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join(""); setStatus("binaryStatus", "Converted!"); } catch (e) { setStatus("binaryStatus", "Error", false); } }
function convertColor() { let i = document.getElementById("colorInput").value.trim(); let p = document.getElementById("colorPreviewBox"); p.style.background = i; p.textContent = "Color: " + i; setStatus("colorStatus", "Converted!"); }
function generateSecurePassword() { let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$"; let p = ""; for (let i = 0; i < 16; i++) p += chars[Math.floor(Math.random() * chars.length)]; document.getElementById("generatedPassword").value = p; setStatus("passGenStatus", "Generated!"); }
function analyzeText() { let t = document.getElementById("wordCountInput").value; let w = t.trim() ? t.trim().split(/\s+/).length : 0; document.getElementById("wcWords").textContent = w; document.getElementById("wcChars").textContent = t.length; document.getElementById("wcTime").textContent = Math.ceil(w / 3.3) + "s"; }

function generateQR() {
  let t = document.getElementById("qrInput").value.trim();
  if (!t) return setStatus("qrStatus", "Enter text", false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(t)}`;
  document.getElementById("qrPreviewArea").innerHTML = `<img src="${qrUrl}" alt="QR">`;
  
  fetch(qrUrl).then(res => res.blob()).then(blob => {
    saveBlob(blob, "QRCode.png", "qr");
  }).catch(() => {});
  
  setStatus("qrStatus", "QR Generated & Ready for Review!");
}

/* Clock & Calendar Logic */
let calendarCursor = new Date(); let calendarTimer = null;
function initCalendar() { renderCalendar(); updateLiveClock(); if (calendarTimer) clearInterval(calendarTimer); calendarTimer = setInterval(updateLiveClock, 1000); }
function updateLiveClock() { const now = new Date(); const clock = document.getElementById("liveClock"); const date = document.getElementById("liveDate"); if (clock) clock.textContent = now.toLocaleTimeString("en-IN", { hour12: true }); if (date) date.textContent = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
function renderCalendar() {
  const monthYear = document.getElementById("calendarMonthYear"); const daysBox = document.getElementById("calendarDays"); const selected = document.getElementById("selectedCalendarDate");
  if (!monthYear || !daysBox) return;
  const year = calendarCursor.getFullYear(); const month = calendarCursor.getMonth(); const today = new Date();
  monthYear.textContent = calendarCursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  daysBox.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay(); const totalDays = new Date(year, month + 1, 0).getDate(); const previousMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < 42; i++) {
    const dayNumber = i - firstDay + 1; const cell = document.createElement("button"); cell.type = "button"; cell.className = "calendar-day"; let cellDate;
    if (dayNumber < 1) { const n = previousMonthDays + dayNumber; cell.textContent = n; cell.classList.add("muted-day"); cellDate = new Date(year, month - 1, n); }
    else if (dayNumber > totalDays) { const n = dayNumber - totalDays; cell.textContent = n; cell.classList.add("muted-day"); cellDate = new Date(year, month + 1, n); }
    else { cell.textContent = dayNumber; cellDate = new Date(year, month, dayNumber); }
    if (cellDate.toDateString() === today.toDateString()) cell.classList.add("today");
    cell.addEventListener("click", () => { calendarCursor = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1); if (selected) selected.textContent = cellDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); renderCalendar(); });
    daysBox.appendChild(cell);
  }
  if (selected && selected.textContent === "--") { selected.textContent = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
}
function changeCalendarMonth(step) { calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + step, 1); renderCalendar(); }
function goToToday() { const today = new Date(); calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1); const selected = document.getElementById("selectedCalendarDate"); if (selected) selected.textContent = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); renderCalendar(); }

async function shareToInstagram() {
  const shareData = { title: "File Converter Pro", text: "Try File Converter Pro - an all-in-one utility app.", url: window.location.href };
  const status = document.getElementById("shareStatus");
  try {
    if (navigator.share) { await navigator.share(shareData); if (status) status.textContent = "Share menu opened. Choose Instagram if available."; }
    else if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(shareData.url); if (status) status.textContent = "App link copied. Open Instagram and paste it."; window.open("https://www.instagram.com/", "_blank", "noopener"); }
    else { window.open("https://www.instagram.com/", "_blank", "noopener"); }
  } catch (error) { if (error.name !== "AbortError" && status) status.textContent = "Sharing was not completed."; }
}
