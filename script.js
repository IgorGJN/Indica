// ================= ELEMENTOS =================
const mapa = document.getElementById("mapa");

const boxNome = document.getElementById("boxNome");
const boxApagar = document.getElementById("boxApagar");
const boxLimpar = document.getElementById("boxLimpar");

const nomeInput = document.getElementById("nomeInput");
const salvarNome = document.getElementById("salvarNome");

const confirmarApagar = document.getElementById("confirmarApagar");
const cancelarApagar = document.getElementById("cancelarApagar");

const confirmarLimpar = document.getElementById("confirmarLimpar");
const cancelarLimpar = document.getElementById("cancelarLimpar");

const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const limparTudo = document.getElementById("limparTudo");

const cancelarNome = document.getElementById("cancelarNome");


// ================= ESTADO =================
let escala = 1;
let pontoAtual = null;
let pontoTemporario = null;
let isDragging = false;
let longPressTimer = null;

// ================= ZOOM =================
zoomIn.onclick = () => {
    escala += 0.1;
    mapa.style.transform = `scale(${escala})`;
};

zoomOut.onclick = () => {
    escala = Math.max(0.5, escala - 0.1);
    mapa.style.transform = `scale(${escala})`;
};

// ================= STORAGE =================
function salvarPontos() {
    const pontos = [];
    document.querySelectorAll(".ponto").forEach(p => {
        pontos.push({
            x: p.style.left,
            y: p.style.top,
            nome: p.dataset.nome || "",
            cor: p.style.background
        });
    });
    localStorage.setItem("pontos", JSON.stringify(pontos));
}

function carregarPontos() {
    const dados = JSON.parse(localStorage.getItem("pontos") || "[]");
    dados.forEach(d => criarPonto(d.x, d.y, d.nome, d.cor, true));
}

carregarPontos();

// ================= CRIAR PONTO =================
mapa.addEventListener("pointerdown", (e) => {
    if (e.target !== mapa) return;
    isDragging = false;
});

mapa.addEventListener("pointerup", (e) => {
    if (isDragging || e.target !== mapa) return;

    pontoTemporario = criarPonto(
        e.offsetX + "px",
        e.offsetY + "px",
        "",
        "red",
        false
    );

    pontoAtual = pontoTemporario;
    abrirBoxNome(e.clientX, e.clientY);
});

// ================= FUNÇÃO PONTO =================
function criarPonto(x, y, nome = "", cor = "red", definitivo = true) {
    const ponto = document.createElement("div");
    ponto.className = "ponto";
    ponto.style.left = x;
    ponto.style.top = y;
    ponto.style.background = cor;
    ponto.dataset.nome = nome;

    const label = document.createElement("span");
    label.textContent = nome;
    ponto.appendChild(label);

    // Toque / clique muda cor
    ponto.addEventListener("click", (e) => {
        e.stopPropagation();
        ponto.style.background =
            ponto.style.background === "red" ? "blue" : "red";
        salvarPontos();
    });

    // Editar nome (duplo toque rápido)
    ponto.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        pontoAtual = ponto;
        abrirBoxNome(e.clientX, e.clientY, ponto.dataset.nome);
    });

    // LONG PRESS (apagar)
    ponto.addEventListener("pointerdown", (e) => {
        isDragging = false;

        longPressTimer = setTimeout(() => {
            pontoAtual = ponto;
            abrirBoxApagar();
        }, 700);

        const startX = e.clientX;
        const startY = e.clientY;

        function mover(ev) {
            const dx = Math.abs(ev.clientX - startX);
            const dy = Math.abs(ev.clientY - startY);

            if (dx > 5 || dy > 5) {
                clearTimeout(longPressTimer);
                isDragging = true;

                ponto.style.left = ev.clientX - 8 + "px";
                ponto.style.top = ev.clientY - 8 + "px";
            }
        }

        document.addEventListener("pointermove", mover);

        document.addEventListener("pointerup", () => {
            clearTimeout(longPressTimer);
            document.removeEventListener("pointermove", mover);
            salvarPontos();
        }, { once: true });
    });

    mapa.appendChild(ponto);
    if (definitivo) salvarPontos();
    return ponto;
}

// ================= BOX NOME =================
function abrirBoxNome(x, y, valor = "") {
    nomeInput.value = valor;
    boxNome.style.left = x + "px";
    boxNome.style.top = y + "px";
    boxNome.classList.remove("hidden");
    nomeInput.focus();
}

function confirmarNome() {
    if (!pontoAtual) return;

    pontoAtual.dataset.nome = nomeInput.value;
    pontoAtual.querySelector("span").textContent = nomeInput.value;

    pontoTemporario = null;
    pontoAtual = null;

    boxNome.classList.add("hidden");
    salvarPontos();
}

function cancelarCriacao() {
    if (pontoTemporario) {
        pontoTemporario.remove();
        pontoTemporario = null;
    }
    pontoAtual = null;
    boxNome.classList.add("hidden");
}

cancelarNome.onclick = cancelarCriacao;

// Botão salvar
salvarNome.onclick = confirmarNome;

// Teclado virtual
nomeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmarNome();
    if (e.key === "Escape") cancelarCriacao();
});

// ================= BOX APAGAR =================
function abrirBoxApagar() {
    boxApagar.style.left = "50%";
    boxApagar.style.top = "50%";
    boxApagar.style.transform = "translate(-50%, -50%)";
    boxApagar.classList.remove("hidden");
}

confirmarApagar.onclick = () => {
    if (pontoAtual) pontoAtual.remove();
    pontoAtual = null;
    boxApagar.classList.add("hidden");
    salvarPontos();
};

cancelarApagar.onclick = () => {
    pontoAtual = null;
    boxApagar.classList.add("hidden");
};

// ================= LIMPAR TUDO =================
limparTudo.onclick = () => {
    boxLimpar.style.left = "50%";
    boxLimpar.style.top = "50%";
    boxLimpar.style.transform = "translate(-50%, -50%)";
    boxLimpar.classList.remove("hidden");
};

confirmarLimpar.onclick = () => {
    document.querySelectorAll(".ponto").forEach(p => p.remove());
    localStorage.removeItem("pontos");
    boxLimpar.classList.add("hidden");
};

cancelarLimpar.onclick = () => {
    boxLimpar.classList.add("hidden");
};
