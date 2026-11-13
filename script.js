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