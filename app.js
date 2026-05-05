const nodes = [
  { name: "Mumbai Edge 07", region: "asia", city: "Mumbai", health: 98, stake: "42k", price: "$0.03/min" },
  { name: "Seoul Relay Bloom", region: "asia", city: "Seoul", health: 94, stake: "35k", price: "$0.04/min" },
  { name: "Berlin Neon Rack", region: "eu", city: "Berlin", health: 91, stake: "29k", price: "$0.05/min" },
  { name: "Lisbon Mesh Dock", region: "eu", city: "Lisbon", health: 88, stake: "21k", price: "$0.04/min" },
  { name: "Bengaluru Burst", region: "asia", city: "Bengaluru", health: 96, stake: "38k", price: "$0.03/min" }
];

const rooms = [
  { title: "DAO townhall", time: "Today, 19:30", mode: "Open" },
  { title: "Creator stream", time: "Tomorrow, 11:00", mode: "Token" },
  { title: "Validator ops", time: "Fri, 16:00", mode: "Private" }
];

const $ = (selector) => document.querySelector(selector);
const nodeTable = $("#nodeTable");
const roomList = $("#roomList");
const toast = $("#toast");
let toastTimer;
let activeFilter = "all";
let rewardBase = 128.6;
let wallet = "";

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function renderNodes() {
  const filtered = nodes.filter((node) => activeFilter === "all" || node.region === activeFilter);
  nodeTable.innerHTML = filtered
    .map(
      (node) => `
        <div class="node-row">
          <div class="node-name">
            <strong>${node.name}</strong>
            <small>${node.city} · ${node.price} · ${node.stake} PMESH staked</small>
          </div>
          <div class="health-bar" aria-label="${node.health}% node health">
            <span style="width:${node.health}%"></span>
          </div>
          <strong>${node.health}%</strong>
          <button type="button" data-node="${node.name}">Route</button>
        </div>
      `
    )
    .join("");
}

function renderRooms() {
  roomList.innerHTML = rooms
    .map(
      (room) => `
        <div class="room-item">
          <div>
            <strong>${room.title}</strong>
            <small>${room.time}</small>
          </div>
          <span class="room-tag">${room.mode}</span>
        </div>
      `
    )
    .join("");
}

function updateStake(value) {
  const rebate = 100 - Number(value);
  $("#stakeValue").textContent = `${value}%`;
  $("#rebateValue").textContent = `${rebate}%`;
  $("#rewardValue").textContent = (rewardBase + Number(value) * 0.73).toFixed(1);
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function addEventLog(message) {
  const log = $("#eventLog");
  const item = document.createElement("li");
  item.textContent = message;
  log.prepend(item);
  while (log.children.length > 4) {
    log.lastElementChild.remove();
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showToast("No browser wallet found. Install MetaMask or another EIP-1193 wallet.");
    addEventLog("Wallet provider unavailable.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    wallet = accounts[0] || "";
    $("#walletAddress").textContent = wallet ? shortAddress(wallet) : "Not connected";
    $("#connectWalletButton").textContent = wallet ? shortAddress(wallet) : "Connect wallet";

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    $("#chainName").textContent = chainId === "0x89" ? "Polygon" : chainId === "0x13882" ? "Polygon Amoy" : `Chain ${chainId}`;
    addEventLog(`Wallet ${shortAddress(wallet)} connected.`);
    showToast("Wallet connected.");
  } catch {
    showToast("Wallet connection cancelled.");
  }
}

async function signRoomEntry() {
  if (!wallet) {
    await connectWallet();
  }
  if (!wallet || !window.ethereum) return;

  const room = $("#roomCode").textContent;
  const message = `Join PulseMesh room ${room} with token-gated DePIN routing.`;

  try {
    await window.ethereum.request({
      method: "personal_sign",
      params: [message, wallet]
    });
    addEventLog(`Signed entry for ${room}.`);
    showToast("Room entry signed.");
  } catch {
    showToast("Signature cancelled.");
  }
}

function drawMesh() {
  const canvas = $("#meshCanvas");
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const points = [
    [width * 0.18, height * 0.28],
    [width * 0.38, height * 0.18],
    [width * 0.66, height * 0.3],
    [width * 0.48, height * 0.58],
    [width * 0.78, height * 0.68],
    [width * 0.24, height * 0.76]
  ];
  let frame = 0;

  function render() {
    frame += 0.012;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#101018";
    ctx.fillRect(0, 0, width, height);

    const stripes = ctx.createLinearGradient(0, 0, width, height);
    stripes.addColorStop(0, "rgba(255,79,154,.36)");
    stripes.addColorStop(0.5, "rgba(55,229,255,.22)");
    stripes.addColorStop(1, "rgba(199,255,53,.30)");
    ctx.fillStyle = stripes;
    for (let x = -width; x < width * 2; x += 44) {
      ctx.fillRect(x + Math.sin(frame) * 28, 0, 18, height);
    }

    ctx.lineWidth = 3;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const distance = Math.abs(i - j);
        if (distance < 3 || distance === 5) {
          ctx.strokeStyle = i % 2 === 0 ? "rgba(55,229,255,.7)" : "rgba(199,255,53,.65)";
          ctx.beginPath();
          ctx.moveTo(points[i][0], points[i][1] + Math.sin(frame + i) * 9);
          ctx.lineTo(points[j][0], points[j][1] + Math.cos(frame + j) * 9);
          ctx.stroke();
        }
      }
    }

    points.forEach(([x, y], index) => {
      const pulse = 15 + Math.sin(frame * 4 + index) * 5;
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

    ctx.fillStyle = "rgba(255,248,232,.88)";
    ctx.font = "900 28px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("DePIN mesh live", 26, 46);
    requestAnimationFrame(render);
  }

  render();
}

async function enableCamera() {
  const video = $("#localVideo");
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera API unavailable in this browser.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.style.opacity = "1";
    showToast("Camera preview connected.");
  } catch {
    showToast("Camera permission skipped. Mesh preview stays active.");
  }
}

document.addEventListener("click", (event) => {
  const nodeButton = event.target.closest("[data-node]");
  if (nodeButton) {
    $("#roomCode").textContent = `room/${nodeButton.dataset.node.toLowerCase().replaceAll(" ", "-")}`;
    $("#relayValue").textContent = String(Math.floor(Math.random() * 12) + 14);
    $("#latencyValue").textContent = `${Math.floor(Math.random() * 24) + 28}ms`;
    showToast(`Traffic routed through ${nodeButton.dataset.node}.`);
  }
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-selected", item === button));
    renderNodes();
  });
});

$("#copyRoomButton").addEventListener("click", async () => {
  const link = `${window.location.href.split("#")[0]}#studio`;
  try {
    await navigator.clipboard.writeText(link);
    showToast("Room link copied.");
  } catch {
    showToast(link);
  }
});

$("#themeButton").addEventListener("click", () => {
  const themes = ["", "theme-pop", "theme-soda"];
  const current = themes.findIndex((theme) => document.body.className === theme);
  document.body.className = themes[(current + 1) % themes.length];
  showToast("Theme shuffled.");
});

$("#connectWalletButton").addEventListener("click", connectWallet);

$("#cameraButton").addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("is-on");
  if (event.currentTarget.classList.contains("is-on")) {
    enableCamera();
  } else {
    const stream = $("#localVideo").srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    $("#localVideo").srcObject = null;
    $("#localVideo").style.opacity = "0";
    showToast("Camera muted.");
  }
});

$("#micButton").addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("is-on");
  showToast(event.currentTarget.classList.contains("is-on") ? "Mic live." : "Mic muted.");
});

$("#shareButton").addEventListener("click", () => showToast("Screen share room slot reserved."));

$("#recordButton").addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("is-recording");
  showToast(event.currentTarget.classList.contains("is-recording") ? "Recording hash queue started." : "Recording stopped.");
});

$("#signButton").addEventListener("click", signRoomEntry);

$("#summarizeButton").addEventListener("click", () => {
  const notes = [
    "Consensus favors Mumbai Edge for the next creator event.",
    "Stake split can move 8% toward node operators without raising host cost.",
    "Two gated rooms are ready for pass holders."
  ];
  $("#noteList").innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
  showToast("AI notes refreshed.");
});

$("#stakeSlider").addEventListener("input", (event) => updateStake(event.target.value));

$("#addRoomButton").addEventListener("click", () => {
  const next = rooms.length + 1;
  rooms.unshift({ title: `Pop-up room ${next}`, time: "Draft", mode: next % 2 ? "Token" : "Open" });
  renderRooms();
  showToast("Room draft added.");
});

$("#gateForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = $("#gateInput").value || 0;
  const nft = $("#nftToggle").checked ? " or pass" : "";
  $("#gateStatus").textContent = `Creators with ${value} PMESH${nft} can join.`;
  showToast("Access gate updated.");
});

$("#mintKeyButton").addEventListener("click", async () => {
  if (!wallet) {
    await connectWallet();
  }
  if (!wallet) return;
  addEventLog(`Room key minted for ${shortAddress(wallet)}.`);
  showToast("Room key minted on the demo contract.");
});

$("#settleButton").addEventListener("click", () => {
  rewardBase += 12.4;
  updateStake($("#stakeSlider").value);
  addEventLog("Rewards settled to host and node operators.");
  showToast("Rewards settled.");
});

renderNodes();
renderRooms();
updateStake($("#stakeSlider").value);
drawMesh();
