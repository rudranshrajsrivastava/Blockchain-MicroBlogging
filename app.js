const $ = (selector) => document.querySelector(selector);
const toast = $("#toast");
let toastTimer;
let walletConnected = false;
let signed = false;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function setResponse(title, text, tone = "idle") {
  $("#responseTitle").textContent = title;
  $("#responseText").textContent = text;
  $("#responseBox").dataset.tone = tone;
  $("#roomStatus").textContent = title;
}

function drawMesh() {
  const canvas = $("#meshCanvas");
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const points = [
    [width * 0.18, height * 0.3],
    [width * 0.35, height * 0.18],
    [width * 0.68, height * 0.26],
    [width * 0.5, height * 0.58],
    [width * 0.78, height * 0.7],
    [width * 0.24, height * 0.76]
  ];
  let frame = 0;

  function render() {
    frame += 0.012;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#101018";
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255,79,154,.42)");
    gradient.addColorStop(0.5, "rgba(55,229,255,.25)");
    gradient.addColorStop(1, "rgba(199,255,53,.34)");
    ctx.fillStyle = gradient;
    for (let x = -width; x < width * 2; x += 48) {
      ctx.fillRect(x + Math.sin(frame) * 30, 0, 18, height);
    }

    ctx.lineWidth = 3;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        if (Math.abs(i - j) < 3 || Math.abs(i - j) === 5) {
          ctx.strokeStyle = i % 2 === 0 ? "rgba(55,229,255,.72)" : "rgba(199,255,53,.68)";
          ctx.beginPath();
          ctx.moveTo(points[i][0], points[i][1] + Math.sin(frame + i) * 9);
          ctx.lineTo(points[j][0], points[j][1] + Math.cos(frame + j) * 9);
          ctx.stroke();
        }
      }
    }

    points.forEach(([x, y], index) => {
      const pulse = 17 + Math.sin(frame * 4 + index) * 5;
      ctx.fillStyle = index % 2 ? "#c7ff35" : "#ff4f9a";
      ctx.beginPath();
      ctx.arc(x, y + Math.sin(frame + index) * 9, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#17131f";
      ctx.font = "900 14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(index === 0 ? "YOU" : "N", x, y + Math.sin(frame + index) * 9);
    });

    ctx.fillStyle = "rgba(255,248,232,.9)";
    ctx.font = "900 30px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Decentralized room routing", 28, 50);
    requestAnimationFrame(render);
  }

  render();
}

$("#themeButton").addEventListener("click", () => {
  const themes = ["", "theme-pop", "theme-soda"];
  const current = themes.findIndex((theme) => document.body.className === theme);
  document.body.className = themes[(current + 1) % themes.length];
  showToast("Funky theme changed.");
});

$("#walletButton").addEventListener("click", () => {
  walletConnected = true;
  signed = true;
  setResponse("Wallet verified", "Signature accepted. Token gate passed and room access is ready.", "good");
  showToast("Wallet verified.");
});

$("#joinButton").addEventListener("click", () => {
  if (!walletConnected || !signed) {
    setResponse("Signature required", "Connect wallet first so the room can verify token or NFT access.", "busy");
    showToast("Connect wallet first.");
    return;
  }

  setResponse("Joining room", "Selecting the lowest-latency community relay and preparing encrypted media.", "busy");
  showToast("Joining room...");
  window.setTimeout(() => {
    setResponse("Room joined", "You are connected. Media, chat events, recording proof, and node settlement are active.", "good");
    showToast("Room joined.");
  }, 750);
});

drawMesh();
