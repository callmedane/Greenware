// ================================================== //
// GREENWARE DASHBOARD - MAIN APPLICATION SCRIPT    //
// ================================================== //

document.addEventListener("DOMContentLoaded", () => {
  // ============ NAVIGATION ============
  const navLinks = document.querySelectorAll(".nav-link");
  const pageSections = document.querySelectorAll(".page-section");

  function showSection(sectionId) {
    // Hide all sections
    pageSections.forEach(section => {
      section.classList.remove("active");
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      selectedSection.classList.add("active");
    }
    
    // Update nav links
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-section") === sectionId) {
        link.classList.add("active");
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("data-section");
      showSection(sectionId);
    });
  });

  // ============ DASHBOARD ELEMENTS ============
  const scanBtn = document.getElementById("scanBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const overallStatus = document.getElementById("overallStatus");
  const sidebarStatus = document.getElementById("sidebarStatus");
  const debrisCount = document.getElementById("debrisCount");
  const moistureValue = document.getElementById("moistureValue");
  const dryingValue = document.getElementById("dryingValue");
  const recommendation = document.getElementById("recommendation");
  const defectList = document.getElementById("defectList");
  const sensorGrid = document.getElementById("sensorGrid");
  const historyBody = document.getElementById("historyBody");
  const surfaceCount = document.getElementById("surfaceCount");
  const subsurfaceCount = document.getElementById("subsurfaceCount");
  const highestConfidence = document.getElementById("highestConfidence");
  const decisionLabel = document.getElementById("decisionLabel");
  const mapCanvas = document.getElementById("mapCanvas");
  const ctx = mapCanvas.getContext("2d");
  const clayShape = document.getElementById("clayShape");
  const viewerMarkers = document.getElementById("viewerMarkers");
  const rotationSlider = document.getElementById("rotationSlider");
  const tiltSlider = document.getElementById("tiltSlider");

  // ============ DETECTION ELEMENTS ============
  const confThreshold = document.getElementById("confThreshold");
  const confValue = document.getElementById("confValue");

  if (confThreshold) {
    confThreshold.addEventListener("input", (e) => {
      confValue.textContent = e.target.value + "%";
    });
  }

  // ============ SETTINGS ELEMENTS ============
  const themeSelect = document.getElementById("themeSelect");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const contrastToggle = document.getElementById("contrastToggle");
  const confidenceThreshold = document.getElementById("confidenceThreshold");
  const confidenceValue = document.getElementById("confidenceValue");
  const autoRefreshToggle = document.getElementById("autoRefreshToggle");
  const notificationsToggle = document.getElementById("notificationsToggle");
  const soundToggle = document.getElementById("soundToggle");
  const defectAlertToggle = document.getElementById("defectAlertToggle");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const resetSettingsBtn = document.getElementById("resetSettingsBtn");

  // Load settings from localStorage
  function loadSettings() {
    const theme = localStorage.getItem("theme") || "warm";
    const fontSize = localStorage.getItem("fontSize") || "medium";
    const contrast = localStorage.getItem("contrast") === "true";
    const confidence = localStorage.getItem("confidence") || "70";
    const autoRefresh = localStorage.getItem("autoRefresh") === "true";
    const notifications = localStorage.getItem("notifications") !== "false";
    const sound = localStorage.getItem("sound") === "true";
    const defectAlert = localStorage.getItem("defectAlert") !== "false";

    if (themeSelect) themeSelect.value = theme;
    if (fontSizeSelect) fontSizeSelect.value = fontSize;
    if (contrastToggle) contrastToggle.checked = contrast;
    if (confidenceThreshold) {
      confidenceThreshold.value = confidence;
      confidenceValue.textContent = confidence + "%";
    }
    if (autoRefreshToggle) autoRefreshToggle.checked = autoRefresh;
    if (notificationsToggle) notificationsToggle.checked = notifications;
    if (soundToggle) soundToggle.checked = sound;
    if (defectAlertToggle) defectAlertToggle.checked = defectAlert;

    applyTheme(theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function saveSettings() {
    if (themeSelect) localStorage.setItem("theme", themeSelect.value);
    if (fontSizeSelect) localStorage.setItem("fontSize", fontSizeSelect.value);
    if (contrastToggle) localStorage.setItem("contrast", contrastToggle.checked);
    if (confidenceThreshold) localStorage.setItem("confidence", confidenceThreshold.value);
    if (autoRefreshToggle) localStorage.setItem("autoRefresh", autoRefreshToggle.checked);
    if (notificationsToggle) localStorage.setItem("notifications", notificationsToggle.checked);
    if (soundToggle) localStorage.setItem("sound", soundToggle.checked);
    if (defectAlertToggle) localStorage.setItem("defectAlert", defectAlertToggle.checked);

    alert("Settings saved successfully!");
  }

  function resetSettings() {
    localStorage.clear();
    loadSettings();
    alert("Settings reset to default!");
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", saveSettings);
  }

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", resetSettings);
  }

  // ============ CONTACT FORM ============
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you for your message! We will contact you soon.");
      contactForm.reset();
    });
  }

  // ============ 3D VIEWER CONTROLS ============
  function applyViewerTransform() {
    clayShape.style.transform = `rotateX(${Number(tiltSlider.value)}deg) rotateY(${Number(rotationSlider.value)}deg)`;
  }

  rotationSlider.addEventListener("input", applyViewerTransform);
  tiltSlider.addEventListener("input", applyViewerTransform);
  applyViewerTransform();

  // ============ STATUS MANAGEMENT ============
  function setStatus(status) {
    const statusText = String(status || "idle").toUpperCase();
    overallStatus.textContent = statusText;
    overallStatus.className = `status-pill ${status || "idle"}`;
    sidebarStatus.className = `status-badge ${status || "idle"}`;
    sidebarStatus.textContent = statusText;

    decisionLabel.textContent = status === "pass"
      ? "Proceed"
      : status === "fail"
      ? "Rework Needed"
      : status === "review"
      ? "Manual Review"
      : "Awaiting Scan";
  }

  // ============ CANVAS - 2D DEFECT MAP ============
  function drawMap(defects = []) {
    const w = mapCanvas.width;
    const h = mapCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#fbf5ee");
    gradient.addColorStop(1, "#e8d8c6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#b28f73";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 180, 115, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2 - 110);
    ctx.lineTo(w / 2, h / 2 + 110);
    ctx.moveTo(w / 2 - 180, h / 2);
    ctx.lineTo(w / 2 + 180, h / 2);
    ctx.strokeStyle = "rgba(130, 102, 79, 0.35)";
    ctx.stroke();
    ctx.setLineDash([]);

    defects.forEach((defect, index) => {
      const x = w / 2 + defect.x * 125;
      const y = h / 2 + defect.y * 88;
      const color = defect.depth === "subsurface" ? "#b54141" : "#2f8f5b";
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Arial";
      ctx.fillText(String(index + 1), x - 3, y + 4);
    });
  }

  // ============ 3D VIEWER - MARKERS ============
  function updateViewer(defects = []) {
    viewerMarkers.innerHTML = "";
    defects.forEach((defect) => {
      const marker = document.createElement("div");
      marker.className = `viewer-marker ${defect.depth}`;
      marker.style.left = `${50 + defect.x * 24}%`;
      marker.style.top = `${50 + defect.y * 22}%`;
      marker.title = `${defect.material} • ${defect.depth} • ${defect.confidence}`;
      viewerMarkers.appendChild(marker);
    });
  }

  // ============ DEFECT LIST ============
  function updateDefects(defects = []) {
    defectList.innerHTML = "";
    if (!defects.length) {
      defectList.innerHTML = `<li>No major defects found.</li>`;
      surfaceCount.textContent = "0";
      subsurfaceCount.textContent = "0";
      highestConfidence.textContent = "--";
      return;
    }

    let surface = 0;
    let subsurface = 0;
    let highest = 0;

    defects.forEach((d, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>#${index + 1}</strong> ${d.material} • ${d.depth} • confidence ${d.confidence}`;
      defectList.appendChild(li);
      if (d.depth === "surface") surface += 1;
      if (d.depth === "subsurface") subsurface += 1;
      highest = Math.max(highest, Number(d.confidence || 0));
    });

    surfaceCount.textContent = String(surface);
    subsurfaceCount.textContent = String(subsurface);
    highestConfidence.textContent = highest ? `${(highest * 100).toFixed(0)}%` : "--";
  }

  // ============ SENSOR DATA ============
  function prettifyKey(key) {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function updateSensors(snapshot = {}) {
    sensorGrid.innerHTML = "";
    Object.entries(snapshot).forEach(([key, value]) => {
      const item = document.createElement("div");
      item.className = "sensor-item";
      item.innerHTML = `
        <span class="mini-label">${prettifyKey(key)}</span>
        <strong>${Array.isArray(value) ? value.join(", ") : value}</strong>
      `;
      sensorGrid.appendChild(item);
    });
  }

  // ============ HISTORY TABLE ============
  function updateHistory(history = []) {
    historyBody.innerHTML = "";
    history.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${String(item.scan_id || "").slice(0, 8)}</td>
        <td>${item.overall_status || "--"}</td>
        <td>${item.debris_count ?? 0}</td>
        <td>${item.created_at ? new Date(item.created_at).toLocaleString() : "--"}</td>
      `;
      historyBody.appendChild(tr);
    });
  }

  // ============ DASHBOARD UPDATE ============
  function updateDashboard(latest) {
    if (!latest) return;
    setStatus(latest.overall_status);
    debrisCount.textContent = latest.debris_count ?? 0;
    moistureValue.textContent = `${latest.moisture_estimate ?? "--"}%`;
    dryingValue.textContent = `${latest.drying_time_hours ?? "--"} h`;
    recommendation.textContent = latest.recommendation || "No recommendation available.";
    updateDefects(latest.defects || []);
    updateSensors(latest.sensor_snapshot || {});
    drawMap(latest.defects || []);
    updateViewer(latest.defects || []);
  }

  // ============ API CALLS ============
  async function loadLatest() {
    try {
      const latestRes = await fetch("/api/scan/latest");
      if (!latestRes.ok) return null;
      return latestRes.json();
    } catch (error) {
      console.error("Failed to load latest scan:", error);
      return null;
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/history?limit=10");
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Failed to load history:", error);
      return [];
    }
  }

  async function refreshAll() {
    try {
      if (refreshBtn) refreshBtn.disabled = true;
      const [latest, history] = await Promise.all([loadLatest(), loadHistory()]);
      if (latest) updateDashboard(latest);
      updateHistory(history);
    } catch (error) {
      console.error("Refresh failed:", error);
      recommendation.textContent = "Unable to refresh. Check backend logs and try again.";
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  // ============ SCAN BUTTON ============
  if (scanBtn) {
    scanBtn.addEventListener("click", async () => {
      try {
        scanBtn.disabled = true;
        scanBtn.textContent = "Scanning...";
        const res = await fetch("/api/scan/start", { method: "POST" });
        if (!res.ok) {
          throw new Error("Scan request failed.");
        }
        await refreshAll();
      } catch (error) {
        console.error(error);
        recommendation.textContent = "Unable to run scan. Check backend logs and try again.";
      } finally {
        scanBtn.disabled = false;
        scanBtn.textContent = "Start Scan";
      }
    });
  }

  // ============ REFRESH BUTTON ============
  if (refreshBtn) {
    refreshBtn.addEventListener("click", refreshAll);
  }

  // ============ INITIAL LOAD ============
  loadSettings();
  refreshAll();

  // ============ AUTO-REFRESH ============
  let autoRefreshInterval = null;

  function setupAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    
    if (autoRefreshToggle && autoRefreshToggle.checked) {
      const interval = parseInt(document.getElementById("refreshInterval")?.value || "30") * 1000;
      autoRefreshInterval = setInterval(refreshAll, interval);
    }
  }

  if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener("change", setupAutoRefresh);
  }

  const refreshInterval = document.getElementById("refreshInterval");
  if (refreshInterval) {
    refreshInterval.addEventListener("change", setupAutoRefresh);
  }

  // Apply theme on settings change
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
  }
});
