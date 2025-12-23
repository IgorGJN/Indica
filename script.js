const container = document.getElementById("image-container");
const modal = document.getElementById("name-modal");
const inputName = document.getElementById("point-name");

const btnSave = document.getElementById("save-point");
const btnDelete = document.getElementById("delete-point");
const btnCancel = document.getElementById("cancel-point");
const btnClear = document.getElementById("clear-all");

const cores = [
  "#ff3b30",
  "#007aff",
  "#34c759",
  "#ffcc00",
  "#af52de",
  "#ff9500"
];

let points = [];
let tempPos = null;
let selectedPoint = null;
let scale = 1;

/* ===== CRIAR (SEGURAR FUNDO) ===== */
let holdTimer;

container.addEventListener("pointerdown", e => {
  if (e.target !== container) return;

  holdTimer = setTimeout(() => {
    const rect = container.getBoundingClientRect();
    tempPos = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
    openModal("");
  }, 400);
});

container.addEventListener("pointerup", () => clearTimeout(holdTimer));

/* ===== MODAL ===== */
function openModal(name) {
  modal.classList.add("active");
  inputName.value = name;
  inputName.focus();
  btnDelete.style.display = selectedPoint ? "block" : "none";
}

function closeModal() {
  modal.classList.remove("active");
  tempPos = null;
  selectedPoint = null;
}

/* ===== SALVAR ===== */
btnSave.onclick = () => {
  const name = inputName.value.trim();
  if (!name) return;

  if (selectedPoint) {
    selectedPoint.name = name;
    selectedPoint.el.dataset.name = name;
  } else {
    createPoint(tempPos.x, tempPos.y, name);
  }

  closeModal();
};

/* ===== APAGAR ===== */
btnDelete.onclick = () => {
  if (!selectedPoint) return;
  selectedPoint.el.remove();
  points = points.filter(p => p !== selectedPoint);
  closeModal();
};

btnCancel.onclick = closeModal;

/* ===== CRIAR PONTO ===== */
function createPoint(x, y, name) {
  const el = document.createElement("div");
  el.className = "point";
  el.dataset.name = name;

  const point = {
    x, y, name,
    corIndex: 0,
    el
  };

  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = cores[0];

  container.appendChild(el);
  points.push(point);

  /* TOQUE RÁPIDO → COR */
  el.addEventListener("click", e => {
    e.stopPropagation();
    point.corIndex = (point.corIndex + 1) % cores.length;
    el.style.color = cores[point.corIndex];
  });

  /* SEGURAR → EDITAR */
  let timer;
  el.addEventListener("pointerdown", e => {
    e.stopPropagation();
    selectedPoint = point;

    timer = setTimeout(() => {
      openModal(point.name);
    }, 500);
  });

  el.addEventListener("pointerup", () => clearTimeout(timer));
}

/* ===== ZOOM ===== */
container.addEventListener("wheel", e => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.5, scale), 3);
  container.style.transform = `scale(${scale})`;
});

/* ===== LIMPAR ===== */
btnClear.onclick = () => {
  points.forEach(p => p.el.remove());
  points = [];
};
