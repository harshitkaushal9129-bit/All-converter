document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
  initThemePreference();
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
  document.getElementById("navUsername").textContent = profile.username;
  document.getElementById("navAvatar").textContent = profile.username.substring(0, 2).toUpperCase();
}

function openProfileModal() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || { username: "kaushalji" };
  document.getElementById("editUsername").value = profile.username;
  document.getElementById("profileModal").classList.add("active");
}
function closeProfileModal() { document.getElementById("profileModal").classList.remove("active"); }

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
  document.getElementById(viewId).classList.add('active');
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
  if (input.files && input.files[0]) document.getElementById(textId).innerHTML = `<i class="fa-solid fa-file"></i> ${input.files[0].name}`;
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ================= TYPING MASTER 12 (10 LESSONS & PRINT) =================
const typingLessons = {
  1: "asdf jkl; asdf jkl; ff jj dd kk ss ll aa ;; touch typing builds finger muscle memory for fast and accurate typing sessions.",
  2: "client side web architecture relies heavily on efficient html markup cascading style sheets and modern modular javascript code structures.",
  3: "graphic design and digital asset creation require distinct neon aesthetics vibrant color palettes and precise typography matching user branding.",
  4: "firebase real-time databases and secure cloud storage configurations empower seamless user registration workflows and dynamic data handlers.",
  5: "progressive web apps deploy robust offline caching mechanics via service workers ensuring continuity independent of live network connections.",
  6: "maintaining a personal philosophy of helping others without causing distress fosters positive interpersonal experiences and supportive networks.",
  7: "network device protocols routers and backend firewall security rules protect corporate servers against unauthorized external intrusion.",
  8: "python programming logic and problem solving algorithms simplify complex data manipulation tasks and automate repetitive workflows.",
  9: "tally prime software configurations optimize corporate invoice printing setups and financial record management within educational constraints.",
  10: "expert touch typists achieve remarkable speed exceeding eighty words per minute by maintaining correct finger placement rhythm and absolute focus."
};

let typingTimer = null;
let timeLeft = 60;
let totalTimeSec = 60;
let isTypingActive = false;
let currentLessonText = "";

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
  inputArea.value = "";
  inputArea.disabled = false;
  inputArea.focus();

  document.getElementById("tsTime").textContent = timeLeft + "s";
  document.getElementById("tsWpm").textContent = "0";
  document.getElementById("tsAccuracy").textContent = "100%";
  document.getElementById("tsErrors").textContent = "0";
  document.getElementById("typingProgressBar").style.width = "0%";

  if (typingTimer) clearInterval(typingTimer);
  isTypingActive = true;
  
  typingTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("tsTime").textContent = timeLeft + "s";
    const progressPercent = ((totalTimeSec - timeLeft) / totalTimeSec) * 100;
    document.getElementById("typingProgressBar").style.width = progressPercent + "%";

    if (timeLeft <= 0) {
      finishTypingTest();
    }
  }, 1000);
}

function evaluateTyping() {
  if (!isTypingActive) return;
  const typedVal = document.getElementById("typingInput").value;
  const spans = document.getElementById("passageDisplayBox").querySelectorAll("span");

  let errors = 0;
  for (let i = 0; i < spans.length; i++) {
    if (i < typedVal.length) {
      if (typedVal[i] === currentLessonText[i]) {
        spans[i].style.color = "var(--success)";
      } else {
        spans[i].style.color = "var(--error)";
        errors++;
      }
    } else {
      spans[i].style.color = "var(--text-main)";
    }
  }

  const timeElapsedMin = (totalTimeSec - timeLeft) / 60;
  const wordsTyped = typedVal.trim().split(/\s+/).filter(Boolean).length;
  const wpm = timeElapsedMin > 0 ? Math.round(wordsTyped / timeElapsedMin) : 0;
  const accuracy = typedVal.length > 0 ? Math.max(0, Math.round(((typedVal.length - errors) / typedVal.length) * 100)) : 100;

  document.getElementById("tsWpm").textContent = wpm;
  document.getElementById("tsAccuracy").textContent = accuracy + "%";
  document.getElementById("tsErrors").textContent = errors;

  if (typedVal.length >= currentLessonText.length) {
    finishTypingTest();
  }
}

function finishTypingTest() {
  if (!isTypingActive) return;
  isTypingActive = false;
  clearInterval(typingTimer);
  document.getElementById("typingInput").disabled = true;

  const finalWpm = document.getElementById("tsWpm").textContent;
  const finalAcc = document.getElementById("tsAccuracy").textContent;
  const lessonNum = document.getElementById("typingLessonSelect").value;

  document.getElementById("modalFinalWpm").textContent = finalWpm;
  document.getElementById("modalFinalAcc").textContent = finalAcc;
  document.getElementById("modalLessonName").textContent = `Completed Lesson ${lessonNum}: Typing Master 12 Certified`;
  document.getElementById("typingResultModal").classList.add("active");
}

function closeTypingResultModal() {
  document.getElementById("typingResultModal").classList.remove("active");
  resetTypingTest();
}

function resetTypingTest() {
  if (typingTimer) clearInterval(typingTimer);
  isTypingActive = false;
  document.getElementById("typingWorkspace").classList.add("hidden");
  document.getElementById("typingSetupBox").classList.remove("hidden");
  setStatus("typingStatus", "Lesson reset. Choose parameters to start again.");
}

function stopTypingTestForce() {
  if (typingTimer) clearInterval(typingTimer);
  isTypingActive = false;
}


// ================= PHOTOSHOP STUDIO PRO (12 TOOLS) =================
let openPhotosList = [];
let activePhotoIndex = 0;
let activePhotoshopTool = 'global';

let isSelecting = false, startX = 0, startY = 0, selectionRect = null;
let isDrawing = false, lastX = 0, lastY = 0;

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

          openPhotosList.push({
            name: file.name,
            imgObj: img,
            bufferCanvas: bufCanvas,
            brightness: 100, contrast: 100, saturate: 100, blur: 0,
            rotate: 0, flip: false, specialEffect: 'none'
          });
          loadedCount++;
          if (loadedCount === input.files.length) {
            activePhotoIndex = openPhotosList.length - 1;
            document.getElementById("editorControls").classList.remove("hidden");
            document.getElementById("photoTabsContainer").classList.remove("hidden");
            renderPhotoTabs();
            applyEditorFilters();
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

function renderPhotoTabs() {
  const list = document.getElementById("tabsList");
  list.innerHTML = "";
  openPhotosList.forEach((photo, idx) => {
    const tab = document.createElement("button");
    tab.className = `photo-tab-item ${idx === activePhotoIndex ? 'active' : ''}`;
    tab.innerHTML = `<i class="fa-solid fa-image"></i> ${photo.name} <span class="tab-close" onclick="closePhotoTab(event, ${idx})">&times;</span>`;
    tab.onclick = () => switchActivePhoto(idx);
    list.appendChild(tab);
  });
}

function switchActivePhoto(idx) {
  activePhotoIndex = idx;
  selectionRect = null;
  renderPhotoTabs();
  const photo = openPhotosList[activePhotoIndex];
  document.getElementById("eBrightness").value = photo.brightness;
  document.getElementById("eContrast").value = photo.contrast;
  document.getElementById("eSaturate").value = photo.saturate;
  document.getElementById("eBlur").value = photo.blur;
  applyEditorFilters();
  setStatus("editorStatus", `Switched to photo: ${photo.name}`);
}

function closePhotoTab(event, idx) {
  event.stopPropagation();
  openPhotosList.splice(idx, 1);
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

  if (toolName !== 'freeform') { selectionRect = null; applyEditorFilters(); }
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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((photo.rotate * Math.PI) / 180);
  ctx.scale(photo.flip ? -1 : 1, 1);

  let filter = `brightness(${photo.brightness}%) contrast(${photo.contrast}%) saturate(${photo.saturate}%) blur(${photo.blur}px)`;
  if (photo.specialEffect === 'sepia') filter += ' sepia(100%)';
  if (photo.specialEffect === 'invert') filter += ' invert(100%)';

  ctx.filter = filter;
  ctx.drawImage(photo.bufferCanvas, -photo.bufferCanvas.width / 2, -photo.bufferCanvas.height / 2);
  ctx.restore();

  if (selectionRect) {
    ctx.save();
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
    ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
    ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
    ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
    ctx.restore();
  }
}

function startCanvasInteraction(e) {
  if (activePhotoshopTool === 'freeform' || activePhotoshopTool === 'crop') {
    const canvas = document.getElementById("editorCanvas");
    const rect = canvas.getBoundingClientRect();
    isSelecting = true;
    startX = (e.clientX - rect.left) * (canvas.width / rect.width);
    startY = (e.clientY - rect.top) * (canvas.height / rect.height);
    selectionRect = { x: startX, y: startY, w: 0, h: 0 };
  } else if (activePhotoshopTool === 'brush') {
    isDrawing = true;
    const canvas = document.getElementById("editorCanvas");
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
  }
}

function moveCanvasInteraction(e) {
  const canvas = document.getElementById("editorCanvas");
  const rect = canvas.getBoundingClientRect();
  const currX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const currY = (e.clientY - rect.top) * (canvas.height / rect.height);

  if (isSelecting) {
    selectionRect.w = currX - startX;
    selectionRect.h = currY - startY;
    applyEditorFilters();
  } else if (isDrawing) {
    const photo = openPhotosList[activePhotoIndex];
    const bCtx = photo.bufferCanvas.getContext("2d");
    bCtx.strokeStyle = document.getElementById("brushColorPicker").value;
    bCtx.lineWidth = parseInt(document.getElementById("brushSizeRange").value) || 5;
    bCtx.lineCap = "round"; bCtx.lineJoin = "round";
    bCtx.beginPath(); bCtx.moveTo(lastX, lastY); bCtx.lineTo(currX, currY); bCtx.stroke();
    lastX = currX; lastY = currY;
    applyEditorFilters();
  }
}

function endCanvasInteraction() {
  if (isSelecting) {
    isSelecting = false;
    if (selectionRect.w < 0) { selectionRect.x += selectionRect.w; selectionRect.w = Math.abs(selectionRect.w); }
    if (selectionRect.h < 0) { selectionRect.y += selectionRect.h; selectionRect.h = Math.abs(selectionRect.h); }
    if (activePhotoshopTool === 'crop' && selectionRect.w > 10 && selectionRect.h > 10) {
      executeCropPhoto();
    }
  }
  isDrawing = false;
}

function clearSelection() { selectionRect = null; applyEditorFilters(); }

function editSelectedArea(type) {
  if (!selectionRect || selectionRect.w < 5) return alert("Please select an area first!");
  const photo = openPhotosList[activePhotoIndex];
  const bCtx = photo.bufferCanvas.getContext("2d");
  const x = Math.max(0, Math.floor(selectionRect.x)), y = Math.max(0, Math.floor(selectionRect.y));
  const w = Math.min(photo.bufferCanvas.width - x, Math.floor(selectionRect.w));
  const h = Math.min(photo.bufferCanvas.height - y, Math.floor(selectionRect.h));
  const imgData = bCtx.getImageData(x, y, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    if (type === 'brightness') { d[i] = Math.min(255, d[i]+50); d[i+1] = Math.min(255, d[i+1]+50); d[i+2] = Math.min(255, d[i+2]+50); }
    else if (type === 'darken') { d[i] = Math.max(0, d[i]-50); d[i+1] = Math.max(0, d[i+1]-50); d[i+2] = Math.max(0, d[i+2]-50); }
    else if (type === 'grayscale') { const avg = (d[i]+d[i+1]+d[i+2])/3; d[i]=avg; d[i+1]=avg; d[i+2]=avg; }
  }
  bCtx.putImageData(imgData, x, y);
  applyEditorFilters();
  setStatus("editorStatus", `Applied ${type} to selected region!`);
}

function executeCropPhoto() {
  const photo = openPhotosList[activePhotoIndex];
  const bCtx = photo.bufferCanvas.getContext("2d");
  const x = Math.floor(selectionRect.x), y = Math.floor(selectionRect.y);
  const w = Math.floor(selectionRect.w), h = Math.floor(selectionRect.h);
  const croppedData = bCtx.getImageData(x, y, w, h);
  const newBuf = document.createElement("canvas");
  newBuf.width = w; newBuf.height = h;
  newBuf.getContext("2d").putImageData(croppedData, 0, 0);

  const newImg = new Image();
  newImg.onload = () => {
    photo.bufferCanvas = newBuf;
    photo.imgObj = newImg;
    selectionRect = null;
    applyEditorFilters();
    setStatus("editorStatus", "Photo cropped successfully!");
  };
  newImg.src = newBuf.toDataURL();
}

function rotateEditorImage(deg) {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  photo.rotate = (photo.rotate + deg) % 360;
  applyEditorFilters();
}

function flipEditorImage() {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  photo.flip = !photo.flip;
  applyEditorFilters();
}

function applySpecialEffect(eff) {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  photo.specialEffect = (photo.specialEffect === eff) ? 'none' : eff;
  applyEditorFilters();
}

function quickFilterAdjust(type) {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  if (type === 'brightness') { photo.brightness = 140; document.getElementById("eBrightness").value = 140; }
  if (type === 'contrast') { photo.contrast = 150; document.getElementById("eContrast").value = 150; }
  if (type === 'grayscale') { photo.saturate = 0; document.getElementById("eSaturate").value = 0; }
  applyEditorFilters();
}

function resetCurrentPhoto() {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  const buf = document.createElement("canvas");
  buf.width = photo.imgObj.width; buf.height = photo.imgObj.height;
  buf.getContext("2d").drawImage(photo.imgObj, 0, 0);
  photo.bufferCanvas = buf;
  photo.brightness = 100; photo.contrast = 100; photo.saturate = 100; photo.blur = 0;
  photo.rotate = 0; photo.flip = false; photo.specialEffect = 'none';
  selectionRect = null;
  applyEditorFilters();
  setStatus("editorStatus", "Photo reset to original state.");
}

function downloadEditedImage() {
  if (openPhotosList.length === 0) return;
  const photo = openPhotosList[activePhotoIndex];
  document.getElementById("editorCanvas").toBlob(blob => {
    saveBlob(blob, `PhotoshopPro_${photo.name}`);
    setStatus("editorStatus", "Photo downloaded successfully!");
  }, "image/png");
}

// Other quick utilities
let bgSourceImageObj = null, currentBgColor = { r: 255, g: 255, b: 255 };
function loadBgRemImage(input) {
  if (input.files && input.files[0]) {
    updateFileName(input, 'bgImgText');
    const r = new FileReader();
    r.onload = e => {
      bgSourceImageObj = new Image();
      bgSourceImageObj.onload = () => {
        document.getElementById("bgControlsContainer").classList.remove("hidden");
        const c = document.getElementById("bgSourceCanvas");
        c.width = bgSourceImageObj.width; c.height = bgSourceImageObj.height;
        c.getContext("2d").drawImage(bgSourceImageObj, 0, 0);
        processBgRemovalLive();
      };
      bgSourceImageObj.src = e.target.result;
    };
    r.readAsDataURL(input.files[0]);
  }
}
function pickColorForBg(e) {
  const c = document.getElementById("bgSourceCanvas");
  const rect = c.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * (c.width / rect.width));
  const y = Math.floor((e.clientY - rect.top) * (c.height / rect.height));
  const pixel = c.getContext("2d").getImageData(x, y, 1, 1).data;
  currentBgColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
  document.getElementById("selectedColorDisplay").textContent = `RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  processBgRemovalLive();
}
function updateBgToleranceLabel() { document.getElementById("tolValueLabel").textContent = document.getElementById("bgTolerance").value; }
function processBgRemovalLive() {
  if (!bgSourceImageObj) return;
  const tol = parseInt(document.getElementById("bgTolerance").value) || 35;
  const p = document.getElementById("bgPreviewCanvas");
  p.width = bgSourceImageObj.width; p.height = bgSourceImageObj.height;
  const ctx = p.getContext("2d"); ctx.drawImage(bgSourceImageObj, 0, 0);
  const imgData = ctx.getImageData(0, 0, p.width, p.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.sqrt(Math.pow(d[i]-currentBgColor.r, 2) + Math.pow(d[i+1]-currentBgColor.g, 2) + Math.pow(d[i+2]-currentBgColor.b, 2));
    if (dist <= tol * 3.5) d[i+3] = 0;
  }
  ctx.putImageData(imgData, 0, 0);
}
function downloadBgRemovedImage() {
  document.getElementById("bgPreviewCanvas").toBlob(b => saveBlob(b, "Transparent.png"), "image/png");
}

function convertToUltraHD(scale) {
  const input = document.getElementById("hdImgFile");
  if (!input.files || !input.files[0]) return setStatus("hdStatus", "Choose image first", false);
  const img = new Image(); const url = URL.createObjectURL(input.files[0]);
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth * scale; c.height = img.naturalHeight * scale;
    const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(blob => { URL.revokeObjectURL(url); saveBlob(blob, `UltraHD_${scale}X.png`); setStatus("hdStatus", "Upscaled successfully!"); }, "image/png");
  };
  img.src = url;
}

function htmlToJson() { saveBlob(new Blob([JSON.stringify({html: document.getElementById("htmlInput").value}, null, 2)], {type:"application/json"}), "conv.json"); setStatus("h2jStatus","Converted!"); }
function jsonToHtml() { try{ const o=JSON.parse(document.getElementById("jsonInput").value); saveBlob(new Blob([o.html||o],{type:"text/html"}),"conv.html"); setStatus("j2hStatus","Converted!"); }catch(e){setStatus("j2hStatus",e.message,false);}}
function csvToJson() {
  const lines = document.getElementById("csvInput").value.trim().split("\n");
  const headers = lines[0].split(",");
  const res = lines.slice(1).map(l => { const v = l.split(","); const o={}; headers.forEach((h,i)=>o[h]=v[i]||""); return o; });
  saveBlob(new Blob([JSON.stringify(res, null, 2)],{type:"application/json"}),"csv.json"); setStatus("csvStatus","Converted!");
}
function jsonToCsv() {
  try{ const d=JSON.parse(document.getElementById("j2csvInput").value); const keys=Object.keys(d[0]); let csv=keys.join(",")+"\n";
  d.forEach(r=>csv+=keys.map(k=>`"${r[k]||""}"`).join(",")+"\n"); saveBlob(new Blob([csv],{type:"text/csv"}),"conv.csv"); setStatus("j2csvStatus","Converted!");}catch(e){setStatus("j2csvStatus",e.message,false);}
}
function imageConvert(id, fmt, stat) {
  const inp = document.getElementById(id); if(!inp.files[0])return setStatus(stat,"Select image",false);
  const img = new Image(); const url = URL.createObjectURL(inp.files[0]);
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d"); if(fmt==='jpg'){ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);}
    ctx.drawImage(img,0,0); c.toBlob(b=>{URL.revokeObjectURL(url);saveBlob(b,`img.${fmt}`);setStatus(stat,"Converted!");},`image/${fmt==='jpg'?'jpeg':fmt}`);
  };
  img.src = url;
}
function svgToPng() {
  const code = document.getElementById("svgCodeInput").value.trim();
  if(code) {
    const blob = new Blob([code],{type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob); const img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width=img.naturalWidth||800;c.height=img.naturalHeight||600; c.getContext("2d").drawImage(img,0,0); c.toBlob(b=>{URL.revokeObjectURL(url);saveBlob(b,"svg.png");setStatus("svgStatus","Converted!");}, "image/png"); };
    img.src = url;
  }
}
function processBase64(enc) {
  try{ const v=document.getElementById("base64Input").value; document.getElementById("base64Input").value = enc ? btoa(v) : atob(v); setStatus("base64Status","Success!");}catch(e){setStatus("base64Status","Error",false);}
}
function processUrl(enc) {
  const v=document.getElementById("urlInput").value; document.getElementById("urlInput").value = enc ? encodeURIComponent(v) : decodeURIComponent(v); setStatus("urlStatus","Success!");
}
function mdToHtml() {
  let md=document.getElementById("mdInput").value; let html=md.replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*)\*/gim, '<b>$1</b>');
  saveBlob(new Blob([html],{type:"text/html"}),"md.html"); setStatus("mdStatus","Converted!");
}
function convertTextCase(t) {
  let f=document.getElementById("caseInput"); let v=f.value;
  if(t==='upper')f.value=v.toUpperCase(); else if(t==='lower')f.value=v.toLowerCase(); else f.value=v.replace(/\w\S*/g,txt=>txt.charAt(0).toUpperCase()+txt.substr(1).toLowerCase());
  setStatus("textCaseStatus","Converted!");
}
const mmap={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',' ': '/'};
const rmap=Object.fromEntries(Object.entries(mmap).map(([k,v])=>[v,k]));
function textToMorse() { let v=document.getElementById("morseInput").value.toUpperCase(); document.getElementById("morseInput").value=v.split("").map(c=>mmap[c]||c).join(" "); setStatus("morseStatus","Converted!"); }
function morseToText() { let v=document.getElementById("morseInput").value.trim(); document.getElementById("morseInput").value=v.split(" ").map(c=>rmap[c]||c).join(""); setStatus("morseStatus","Converted!"); }
function textToBinary() { let v=document.getElementById("binaryInput").value; document.getElementById("binaryInput").value=v.split("").map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(" "); setStatus("binaryStatus","Converted!"); }
function binaryToText() { try{let v=document.getElementById("binaryInput").value.trim(); document.getElementById("binaryInput").value=v.split(" ").map(b=>String.fromCharCode(parseInt(b,2))).join("");setStatus("binaryStatus","Converted!");}catch(e){setStatus("binaryStatus","Error",false);}}
function convertColor() {
  let i=document.getElementById("colorInput").value.trim(); let p=document.getElementById("colorPreviewBox");
  p.style.background=i; p.textContent="Color: "+i; setStatus("colorStatus","Converted!");
}
function generateSecurePassword() {
  let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$"; let p=""; for(let i=0;i<16;i++)p+=chars[Math.floor(Math.random()*chars.length)];
  document.getElementById("generatedPassword").value=p; setStatus("passGenStatus","Generated!");
}
function analyzeText() {
  let t=document.getElementById("wordCountInput").value; let w=t.trim()?t.trim().split(/\s+/).length:0;
  document.getElementById("wcWords").textContent=w; document.getElementById("wcChars").textContent=t.length; document.getElementById("wcTime").textContent=Math.ceil(w/3.3)+"s";
}
function generateQR() {
  let t=document.getElementById("qrInput").value.trim(); if(!t)return setStatus("qrStatus","Enter text",false);
  document.getElementById("qrPreviewArea").innerHTML=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(t)}" alt="QR">`;
  setStatus("qrStatus","Generated!");
}
