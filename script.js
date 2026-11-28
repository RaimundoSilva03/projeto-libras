// Carrega a API oficial do YouTube uma única vez
if (!window.YT && !document.getElementById("youtube-iframe-api")) {
  const tag = document.createElement("script");
  tag.id = "youtube-iframe-api";
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

const dadosCategorias = {
  cores: {
    titulo: "CORES",
    itens: [
      { nome: "Azul", corHex: "#2563eb", youtubeId: "f8z8XK7HPbQ", inicio: 10, fim: 13 },
      { nome: "Amarelo", corHex: "#facc15", youtubeId: "f8z8XK7HPbQ", inicio: 7, fim: 8.7 },
      { nome: "Vermelho", corHex: "#ef4444", youtubeId: "f8z8XK7HPbQ", inicio: 15, fim: 18.5 },
      { nome: "Verde", corHex: "#22c55e", youtubeId: "f8z8XK7HPbQ", inicio: 25, fim: 27.6 },
      { nome: "Laranja", corHex: "#f97316", youtubeId: "f8z8XK7HPbQ", inicio: 30, fim: 32.6 },
      { nome: "Roxo", corHex: "#9333ea", youtubeId: "f8z8XK7HPbQ", inicio: 34, fim: 37.6 },
      { nome: "Rosa", corHex: "#ec4899", youtubeId: "f8z8XK7HPbQ", inicio: 44, fim: 46.6 },
      { nome: "Preto", corHex: "#1e293b", youtubeId: "f8z8XK7HPbQ", inicio: 20, fim: 23 },
      { nome: "Branco", corHex: "#ffffff", youtubeId: "f8z8XK7HPbQ", inicio: 49, fim: 51.3 },
      { nome: "Marrom", corHex: "#78350f", youtubeId: "f8z8XK7HPbQ", inicio: 53, fim: 56.1 }
    ]
  },
  animais: {
    titulo: "ANIMAIS",
    itens: [
      { nome: "Cachorro", arquivo: "cachorro", emoji: "🐶", youtubeId: "", inicio: 0, fim: 0 },
      { nome: "Gato", arquivo: "gato", emoji: "🐱", youtubeId: "", inicio: 0, fim: 0 },
      { nome: "Leão", arquivo: "leao", emoji: "🦁", youtubeId: "", inicio: 0, fim: 0 },
      { nome: "Coelho", arquivo: "coelho", emoji: "🐰", youtubeId: "", inicio: 0, fim: 0 },
      { nome: "Peixe", arquivo: "peixe", emoji: "🐟", youtubeId: "", inicio: 0, fim: 0 }
    ]
  },
  frutas: {
    titulo: "FRUTAS",
    itens: [
      { nome: "Maçã", arquivo: "maca", emoji: "🍎", youtubeId: "", inicio: 0, fim: 0 },
      { nome: "Banana", arquivo: "banana", emoji: "🍌", youtubeId: "", inicio: 0, fim: 0 },
      { nome: "Uva", arquivo: "uva", emoji: "🍇", youtubeId: "", inicio: 0, fim: 0 }
    ]
  },
  familia: {
    titulo: "FAMÍLIA",
    itens: [
      { nome: "Papai", arquivo: "papai", emoji: "👨" },
      { nome: "Mamãe", arquivo: "mamae", emoji: "👩" },
      { nome: "Irmão", arquivo: "irmao", emoji: "👦" },
      { nome: "Irmã", arquivo: "irma", emoji: "👧" },
      { nome: "Tio", arquivo: "titio", emoji: "👨" },
      { nome: "Tia", arquivo: "titia", emoji: "👩" },
      { nome: "Avô", arquivo: "vovo_m", emoji: "👴" },
      { nome: "Avó", arquivo: "vovo_f", emoji: "👵" }
    ]
  },
};

let categoriaAtual = "cores";
let indiceItemAtual = 0;
let estrelas = 0;
let respostaCorretaAtual = null;
let bloqueadoQuiz = false;

// Estado do quiz
const RODADAS_POR_PARTIDA = 5;
const OPCOES_POR_RODADA = 4;
let filaQuiz = [];
let rodadaAtual = 0;
let errouNestaRodada = false;
let timeoutProximaRodada = null;

let ytPlayerAtual = null;
let videoIdCarregado = "";
let monitorTempoYt = null;

// --- NAVEGAÇÃO ENTRE TELAS ---
function mostrarTela(idTela) {
  document.querySelectorAll(".tela").forEach(tela => tela.classList.remove("ativa"));
  document.getElementById(idTela).classList.add("ativa");
}

function voltarMenu() {
  limparVideos();
  mostrarTela("tela-menu");
}

function voltarAprender() {
  limparVideos();
  mostrarTela("tela-aprender");
  selecionarItem(indiceItemAtual);
}

function limparVideos() {
  clearInterval(monitorTempoYt);
  clearTimeout(timeoutProximaRodada);
  ytPlayerAtual = null;
  videoIdCarregado = "";
  document.getElementById("container-video").innerHTML = "";
  document.getElementById("quiz-video-box").innerHTML = "";
}

// --- MODO APRENDER ---
function abrirCategoria(categoria) {
  limparVideos();
  categoriaAtual = categoria;
  indiceItemAtual = 0;

  const dados = dadosCategorias[categoria];
  document.getElementById("titulo-categoria-atual").textContent = dados.titulo;

  const listaItens = document.getElementById("lista-itens");
  listaItens.innerHTML = "";

  dados.itens.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.className = "btn-item";
    btn.textContent = item.nome;
    btn.onclick = () => selecionarItem(index);
    listaItens.appendChild(btn);
  });

  mostrarTela("tela-aprender");
  selecionarItem(0);
}

function selecionarItem(index) {
  indiceItemAtual = index;
  const dados = dadosCategorias[categoriaAtual];
  const item = dados.itens[index];

  const botoes = document.querySelectorAll("#lista-itens .btn-item");
  botoes.forEach((btn, i) => {
    btn.classList.toggle("selecionado", i === index);
  });

  document.getElementById("palavra-texto").textContent = item.nome.toUpperCase();

  const visualConceito = document.getElementById("visual-conceito");
  if (item.corHex) {
    visualConceito.innerHTML = `<div style="width:150px; height:150px; border-radius:50%; background:${item.corHex}; border:4px solid #cbd5e1; box-shadow: 0 6px 14px rgba(0,0,0,0.12);"></div>`;
  } else {
    visualConceito.innerHTML = `<img src="midia/${categoriaAtual}/${item.arquivo}.png" alt="${item.nome}" onerror="this.outerHTML='<span>${item.emoji}</span>'">`;
  }

  renderizarVideoLibras("container-video", item);
}

// --- PLAYER HÍBRIDO (LOCAL .MP4 + YOUTUBE) ---
function renderizarVideoLibras(containerId, item) {
  const container = document.getElementById(containerId);
  clearInterval(monitorTempoYt);

  if (categoriaAtual === "cores") {
    container.classList.add("vertical");
  } else {
    container.classList.remove("vertical");
  }

  // MODO 1: VÍDEO LOCAL (.mp4) QUANDO NÃO HOUVER youtubeId (Ex: Família)
  if (!item.youtubeId) {
    ytPlayerAtual = null;
    videoIdCarregado = "";

    if (categoriaAtual === "familia") {
      const caminhoVideo = `midia/${categoriaAtual}/${item.arquivo}.mp4`;
      container.style.flexDirection = "column";
      container.innerHTML = `
        <div style="width: 100%; flex: 1; position: relative; overflow: hidden; background: #000;">
          <video id="${containerId}-local-video" src="${caminhoVideo}" autoplay muted playsinline style="width:100%; height:100%; object-fit:cover;">
            Vídeo não encontrado.
          </video>
        </div>
        <button type="button" id="${containerId}-btn-repetir" style="width:100%; padding:10px; background:#6d28d9; color:white; border:none; font-weight:bold; cursor:pointer; font-size:1rem;">
          🔄 Repetir Sinal
        </button>`;

      const videoEl = document.getElementById(`${containerId}-local-video`);
      document.getElementById(`${containerId}-btn-repetir`).onclick = () => {
        videoEl.currentTime = 0;
        videoEl.play();
      };
    } else {
      container.innerHTML = `<p>🤟 Vídeo do sinal <strong>"${item.nome}"</strong> em breve!</p>`;
    }
    return;
  }

  // MODO 2: YOUTUBE (Ex: Cores - Sem engasgo na primeira abertura)
  const playerDivId = `${containerId}-yt-player`;

  if (ytPlayerAtual && videoIdCarregado === item.youtubeId && document.getElementById(playerDivId)) {
    const btnRepetir = document.getElementById(`${containerId}-btn-repetir`);
    if (btnRepetir) {
      btnRepetir.onclick = () => tocarTrechoPreciso(item.inicio, item.fim);
    }
    tocarTrechoPreciso(item.inicio, item.fim);
    return;
  }

  videoIdCarregado = item.youtubeId;
  container.style.flexDirection = "column";
  container.innerHTML = `
    <div style="width: 100%; flex: 1; position: relative; overflow: hidden;">
      <div id="${playerDivId}" style="width: 100%; height: 100%;"></div>
    </div>
    <button type="button" id="${containerId}-btn-repetir" style="width:100%; padding:10px; background:#6d28d9; color:white; border:none; font-weight:bold; cursor:pointer; font-size:1rem;">
      🔄 Repetir Sinal
    </button>`;

  document.getElementById(`${containerId}-btn-repetir`).onclick = () => {
    tocarTrechoPreciso(item.inicio, item.fim);
  };

  const criarPlayer = () => {
    if (!document.getElementById(playerDivId)) return;
    ytPlayerAtual = new YT.Player(playerDivId, {
      videoId: item.youtubeId,
      playerVars: {
        start: Math.floor(item.inicio || 0),
        autoplay: 1,
        mute: 1,
        rel: 0,
        modestbranding: 1,
        controls: 0,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          event.target.mute();
          event.target.playVideo();
          vigiarFimDoTrecho(item.inicio, item.fim);
        }
      }
    });
  };

  if (window.YT && window.YT.Player) {
    criarPlayer();
  } else {
    window.onYouTubeIframeAPIReady = criarPlayer;
  }
}

function vigiarFimDoTrecho(inicio, fim) {
  clearInterval(monitorTempoYt);
  let comecouATocar = false;

  monitorTempoYt = setInterval(() => {
    if (!ytPlayerAtual || typeof ytPlayerAtual.getPlayerState !== "function") {
      clearInterval(monitorTempoYt);
      return;
    }

    const estado = ytPlayerAtual.getPlayerState();
    const tempoAtual = ytPlayerAtual.getCurrentTime();

    if (estado === YT.PlayerState.PLAYING && tempoAtual >= inicio - 0.3) {
      comecouATocar = true;
    }

    if (comecouATocar && tempoAtual >= fim) {
      ytPlayerAtual.pauseVideo();
      clearInterval(monitorTempoYt);
    }
  }, 150);
}

function tocarTrechoPreciso(inicio, fim) {
  clearInterval(monitorTempoYt);
  if (!ytPlayerAtual || typeof ytPlayerAtual.seekTo !== "function") return;

  ytPlayerAtual.mute();
  ytPlayerAtual.seekTo(inicio, true);
  ytPlayerAtual.playVideo();
  vigiarFimDoTrecho(inicio, fim);
}

// --- MINI-JOGO (QUIZ) ---
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Só entram como "pergunta" os itens que realmente têm vídeo do sinal
function itemTemVideo(item) {
  return Boolean(item.youtubeId) || categoriaAtual === "familia";
}

function atualizarEstrelas() {
  document.getElementById("estrelas").textContent = estrelas;
}

function mostrarRodadaQuiz() {
  document.getElementById("quiz-rodada").hidden = false;
  document.getElementById("quiz-final").hidden = true;
}

function mostrarMensagemQuiz(html) {
  limparVideos();
  document.getElementById("quiz-rodada").hidden = true;
  const caixa = document.getElementById("quiz-final");
  caixa.innerHTML = html;
  caixa.hidden = false;
}

function iniciarJogo() {
  limparVideos();
  estrelas = 0;
  rodadaAtual = 0;
  atualizarEstrelas();
  mostrarTela("tela-jogo");

  const itens = dadosCategorias[categoriaAtual].itens;
  const jogaveis = itens.filter(itemTemVideo);

  if (jogaveis.length === 0 || itens.length < 2) {
    mostrarMensagemQuiz(`
      <div class="quiz-final-emoji">🚧</div>
      <h3>Os sinais deste tema ainda estão chegando!</h3>
      <p>Volte em breve para praticar.</p>
      <div class="botoes-final">
        <button class="btn-voltar" onclick="voltarAprender()">⬅ Voltar a Aprender</button>
      </div>`);
    return;
  }

  filaQuiz = embaralhar(jogaveis).slice(0, RODADAS_POR_PARTIDA);
  mostrarRodadaQuiz();
  proximaRodadaQuiz();
}

function proximaRodadaQuiz() {
  clearTimeout(timeoutProximaRodada);

  if (rodadaAtual >= filaQuiz.length) {
    mostrarFimDoQuiz();
    return;
  }

  bloqueadoQuiz = false;
  errouNestaRodada = false;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-progresso").textContent =
    `Pergunta ${rodadaAtual + 1} de ${filaQuiz.length}`;

  const itens = dadosCategorias[categoriaAtual].itens;
  respostaCorretaAtual = filaQuiz[rodadaAtual];

  renderizarVideoLibras("quiz-video-box", respostaCorretaAtual);

  // 1 correta + distratores da mesma categoria
  const distratores = embaralhar(itens.filter(i => i !== respostaCorretaAtual))
    .slice(0, OPCOES_POR_RODADA - 1);
  const opcoes = embaralhar([respostaCorretaAtual, ...distratores]);

  const gradeOpcoes = document.getElementById("quiz-opcoes");
  gradeOpcoes.innerHTML = "";

  opcoes.forEach(opcao => {
    const btn = document.createElement("button");
    btn.className = "opcao-quiz";

    let visualMini = "";
    if (opcao.corHex) {
      visualMini = `<div style="width:75px; height:75px; border-radius:50%; background:${opcao.corHex}; border:3px solid #cbd5e1;"></div>`;
    } else {
      visualMini = `<img src="midia/${categoriaAtual}/${opcao.arquivo}.png" alt="${opcao.nome}" style="width:85px; height:85px; object-fit:contain;" onerror="this.outerHTML='<span style=\\'font-size:3rem;\\'>${opcao.emoji}</span>'">`;
    }

    btn.innerHTML = `${visualMini}<span>${opcao.nome}</span>`;
    btn.onclick = () => verificarResposta(opcao, btn);
    gradeOpcoes.appendChild(btn);
  });
}

function verificarResposta(opcaoEscolhida, botaoClicado) {
  if (bloqueadoQuiz) return;
  const feedback = document.getElementById("quiz-feedback");

  if (opcaoEscolhida.nome === respostaCorretaAtual.nome) {
    bloqueadoQuiz = true;
    botaoClicado.classList.add("correta");
    feedback.style.color = "#16a34a";

    // Estrela só se acertou de primeira
    if (!errouNestaRodada) {
      estrelas++;
      atualizarEstrelas();
      feedback.textContent = `🎉 Muito bem! Esse é o sinal de ${respostaCorretaAtual.nome}!`;
    } else {
      feedback.textContent = `👏 Isso! Esse é o sinal de ${respostaCorretaAtual.nome}!`;
    }

    rodadaAtual++;
    timeoutProximaRodada = setTimeout(proximaRodadaQuiz, 1800);
  } else {
    errouNestaRodada = true;
    botaoClicado.classList.add("errada");
    botaoClicado.disabled = true;
    feedback.style.color = "#dc2626";
    feedback.textContent = "❌ Quase lá! Veja o sinal de novo e tente outra opção.";

    // Reforço: repete o sinal automaticamente
    const btnRepetir = document.getElementById("quiz-video-box-btn-repetir");
    if (btnRepetir) btnRepetir.click();
  }
}

function mostrarFimDoQuiz() {
  const total = filaQuiz.length;
  const estrelasTexto = "⭐".repeat(estrelas) + "☆".repeat(total - estrelas);

  let mensagem;
  if (estrelas === total) mensagem = "Perfeito! Você acertou tudo de primeira! 🏆";
  else if (estrelas >= total / 2) mensagem = "Muito bem! Você está aprendendo os sinais! 🎉";
  else mensagem = "Bom começo! Vamos treinar mais um pouquinho? 💪";

  mostrarMensagemQuiz(`
    <div class="quiz-final-emoji">🎊</div>
    <h3>Parabéns!</h3>
    <p class="estrelas-final">${estrelasTexto}</p>
    <p>Você acertou <strong>${estrelas}</strong> de <strong>${total}</strong> sinais de primeira.</p>
    <p>${mensagem}</p>
    <div class="botoes-final">
      <button class="btn-jogar" onclick="iniciarJogo()">🔄 Jogar de novo</button>
      <button class="btn-voltar" onclick="voltarAprender()">⬅ Voltar a Aprender</button>
    </div>`);
}
