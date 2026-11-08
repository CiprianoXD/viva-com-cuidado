/* ============================================================
   AS TELAS
   ------------------------------------------------------------
   criarApp(caixa, papel) monta um app inteiro dentro de um
   elemento. O app mobile chama isso uma vez; a pagina de
   demonstracao chama duas, e por isso as duas ficam sempre
   iguais — nao existe uma segunda versao das telas.

   papel: "idoso"       → ve o dia e confirma
          "responsavel" → cadastra e acompanha

   ONDE MEXER:
     · o desenho de cada tela .... HTML_TELAS, logo abaixo
     · as figuras coloridas ...... js/figuras.js
     · as cores e tamanhos ....... css/estilo.css
   ============================================================ */

(function () {
  "use strict";

  var DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function porExtenso(d) { return DIAS[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()]; }
  function dataCurta(iso) { var p = String(iso).split("-"); return p.length === 3 ? p[2] + "/" + p[1] : iso; }
  function minutos(hhmm) { var p = String(hhmm).split(":"); return (+p[0]) * 60 + (+p[1] || 0); }
  function agoraMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function novoId() { return "x" + Date.now().toString(36) + Math.floor(Math.random() * 999).toString(36); }
  function chaveDia(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function telefoneBonito(t) {
    var n = String(t).replace(/\D/g, "");
    if (n.length === 11) return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
    if (n.length === 10) return "(" + n.slice(0, 2) + ") " + n.slice(2, 6) + "-" + n.slice(6);
    return t;
  }
  function saudacaoDaHora() {
    var h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  }

  var CERTO = '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
  var ERRADO = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6 18 18M18 6 6 18"/></svg>';

  var TITULOS = {
    inicio: "Viva com Cuidado", remedios: "Meus Remédios", exercicios: "Meus Exercícios",
    consultas: "Minhas Consultas", ajuda: "Ajuda", responsavel: "Quem cuida"
  };
  // a figura que acompanha o título, e a cor do relógio de cada assunto
  var FIG_TELA = { remedios: "remedios", exercicios: "exercicios", consultas: "consultas", ajuda: "ajuda" };
  var COR_TELA = { remedios: "#1565D8", consultas: "#7B2FBE", exercicios: "#ED7014" };

  // ============================================================
  // O DESENHO DAS TELAS
  // ============================================================
  var HTML_TELAS =
    '<div class="app">' +

    '<header class="topo">' +
      '<button class="btn-voltar" data-el="voltar" hidden>' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 19 8 12l7-7"/></svg>Voltar' +
      '</button>' +
      '<span data-el="figura-topo"></span>' +
      '<h1 data-el="titulo">Viva com Cuidado</h1>' +
      '<div class="fonte-ctl" data-el="fonte-ctl" role="group" aria-label="Tamanho da letra">' +
        '<button data-fonte="1" aria-pressed="true" title="Letra normal">A</button>' +
        '<button data-fonte="1.18" aria-pressed="false" title="Letra maior">A</button>' +
        '<button data-fonte="1.38" aria-pressed="false" title="Letra bem maior">A</button>' +
      '</div>' +
    '</header>' +
    '<div class="faixa-espiando" data-el="faixa-espiando" hidden>Você está vendo a tela da pessoa cuidada</div>' +

    // ---------- inicio ----------
    '<section class="tela" data-tela="inicio">' +
      '<div class="saudacao">' +
        '<div class="oi" data-el="saudacao">Bem-vindo</div>' +
        '<div class="nome" data-el="nome-pessoa"></div>' +
        '<div class="data" data-el="data-hoje"></div>' +
      '</div>' +
      '<div class="agora" data-el="cartao-agora"></div>' +
      '<nav class="menu">' +
        '<button class="menu-item" data-ir="remedios"><span class="selo" data-el="selo-remedios"></span>' +
          '<span data-el="fig-remedios"></span><span class="rotulo">Meus Remédios</span></button>' +
        '<button class="menu-item" data-ir="exercicios"><span class="selo" data-el="selo-exercicios"></span>' +
          '<span data-el="fig-exercicios"></span><span class="rotulo">Meus Exercícios</span></button>' +
        '<button class="menu-item" data-ir="consultas"><span class="selo" data-el="selo-consultas"></span>' +
          '<span data-el="fig-consultas"></span><span class="rotulo">Minhas Consultas</span></button>' +
        '<button class="menu-item ajuda" data-ir="ajuda">' +
          '<span data-el="fig-ajuda"></span><span class="rotulo">AJUDA</span></button>' +
      '</nav>' +
      '<div class="rodape">' +
        '<div class="status-linha"><span class="bolinha" data-el="bolinha-app"></span><span data-el="status-app"></span></div>' +
        '<button class="voltar-txt" data-acao="pedir-avisos" data-el="btn-avisos" hidden>Ativar os avisos de horário</button>' +
        '<button class="voltar-txt" data-acao="trocar-perfil" data-el="btn-trocar" hidden>Trocar de perfil</button>' +
      '</div>' +
    '</section>' +

    '<section class="tela" data-tela="remedios" hidden><div class="lista" data-el="lista-remedios"></div></section>' +
    '<section class="tela" data-tela="exercicios" hidden><div class="lista" data-el="lista-exercicios"></div></section>' +
    '<section class="tela" data-tela="consultas" hidden><div class="lista" data-el="lista-consultas"></div></section>' +

    '<section class="tela" data-tela="ajuda" hidden>' +
      '<button class="sos" data-el="btn-192"><span class="num">192</span><span class="leg">Chamar a ambulância</span></button>' +
      '<p class="aviso-sos">O aparelho vai pedir a sua confirmação antes de ligar.</p>' +
      '<div class="lista" data-el="lista-contatos"></div>' +
    '</section>' +

    // ---------- quem cuida ----------
    '<section class="tela" data-tela="responsavel" hidden>' +
      '<p class="ola-usuario" data-el="ola-usuario" hidden></p>' +
      '<div class="bloco">' +
        '<h3>Como foi o dia</h3>' +
        '<p class="nota">Os últimos 7 dias. ✓ feito · ✕ não feito · – sem resposta.</p>' +
        '<div class="rolagem"><table class="relatorio" data-el="tabela-relatorio"></table></div>' +
      '</div>' +

      '<div class="bloco">' +
        '<h3>Remédios</h3><div data-el="edit-remedios"></div>' +
        '<div class="campos duo">' +
          '<label class="campo">Horário<input type="time" data-el="nr-hora" value="08:00"></label>' +
          '<label class="campo">Remédio<input data-el="nr-nome" placeholder="Losartana"></label></div>' +
        '<div class="campos"><label class="campo">Para quê<input data-el="nr-motivo" placeholder="Pressão"></label>' +
          '<button class="botao" data-acao="add-remedio">Adicionar remédio</button></div>' +
      '</div>' +

      '<div class="bloco">' +
        '<h3>Exercícios</h3><div data-el="edit-exercicios"></div>' +
        '<div class="campos duo">' +
          '<label class="campo">Exercício<input data-el="ne-nome" placeholder="Caminhada"></label>' +
          '<label class="campo">Quanto<input data-el="ne-detalhe" placeholder="30 minutos"></label></div>' +
        '<div class="campos"><button class="botao laranja" data-acao="add-exercicio">Adicionar exercício</button></div>' +
      '</div>' +

      '<div class="bloco">' +
        '<h3>Consultas</h3><div data-el="edit-consultas"></div>' +
        '<div class="campos duo">' +
          '<label class="campo">Data<input type="date" data-el="nc-data"></label>' +
          '<label class="campo">Hora<input type="time" data-el="nc-hora" value="09:00"></label></div>' +
        '<div class="campos duo">' +
          '<label class="campo">Médico<input data-el="nc-medico" placeholder="Dra. Carol"></label>' +
          '<label class="campo">Especialidade<input data-el="nc-esp" placeholder="Cardiologista"></label></div>' +
        '<div class="campos"><button class="botao roxo" data-acao="add-consulta">Adicionar consulta</button></div>' +
      '</div>' +

      '<div class="bloco">' +
        '<h3>Telefones de emergência</h3><div data-el="edit-contatos"></div>' +
        '<div class="campos duo">' +
          '<label class="campo">Quem é<input data-el="nk-nome" placeholder="Maria (filha)"></label>' +
          '<label class="campo">Telefone<input data-el="nk-tel" inputmode="tel" placeholder="11 98888-7777"></label></div>' +
        '<div class="campos"><button class="botao vermelho" data-acao="add-contato">Adicionar telefone</button></div>' +
      '</div>' +

      '<div class="bloco">' +
        '<h3>A pessoa cuidada</h3>' +
        '<div class="campos duo">' +
          '<label class="campo">Tratamento<select data-el="cfg-trato"><option>Sr.</option><option>Sra.</option><option value="">Sem tratamento</option></select></label>' +
          '<label class="campo">Nome<input data-el="cfg-nome" placeholder="José"></label></div>' +
      '</div>' +

      '<div class="bloco">' +
        '<h3>Esta casa</h3>' +
        '<div class="cod-casa" data-el="cod-casa"></div>' +
        '<p class="nota" data-el="nota-casa"></p>' +
        '<div class="campos">' +
          '<button class="botao claro" data-acao="espiar">Ver a tela dela</button>' +
          '<button class="botao claro" data-acao="imprimir">Imprimir agenda de papel</button>' +
          '<button class="botao claro" data-acao="trocar-perfil" data-el="btn-trocar-resp">Trocar de perfil</button></div>' +
      '</div>' +
    '</section>' +

    // ---------- avisos ----------
    '<div class="fundo-modal" data-el="fundo-lembrete" hidden role="dialog" aria-modal="true">' +
      '<div class="modal" data-el="caixa-lembrete"></div></div>' +

    '<div class="fundo-modal" data-el="fundo-ligacao" hidden role="dialog" aria-modal="true">' +
      '<div class="modal">' +
        '<p class="pergunta" style="margin-top:0">Ligar para</p>' +
        '<div class="quem-ligar" data-el="ligacao-quem"></div>' +
        '<div class="num-ligar" data-el="ligacao-num"></div>' +
        '<div class="par">' +
          '<button class="resposta nao" data-acao="ligacao-nao"><span class="marca">' + ERRADO + '</span><span class="rot">Não</span></button>' +
          '<button class="resposta sim" data-acao="ligacao-sim"><span class="marca">' + CERTO + '</span><span class="rot">Ligar</span></button></div>' +
      '</div></div>' +

    '</div>';

  // ============================================================
  // MONTA UM APP
  // ============================================================
  // usuario: o nome de quem entrou neste perfil (opcional).
  function criarApp(caixa, papel, escalaBase, usuario) {
    caixa.innerHTML = HTML_TELAS;

    var raiz = caixa.querySelector(".app");
    var base = escalaBase || 1;
    var fator = 1;
    var telaBase = papel === "responsavel" ? "responsavel" : "inicio";
    var tela = telaBase;
    var dispensados = {};
    var relogioLembrete = null;
    var naDemo = caixa.classList.contains("fone-tela");

    function $(n) { return raiz.querySelector('[data-el="' + n + '"]'); }
    function todas(s) { return [].slice.call(raiz.querySelectorAll(s)); }
    function val(n) { return ($(n).value || "").trim(); }
    function limpar(ns) { ns.forEach(function (n) { $(n).value = ""; }); }
    function aplicarEscala() { raiz.style.setProperty("--esc", base * fator); }
    function subirTopo() { (naDemo ? caixa : window).scrollTo(0, 0); }
    aplicarEscala();

    // as figuras do menu entram uma vez só
    $("fig-remedios").innerHTML = FIGURA.remedios(104);
    $("fig-exercicios").innerHTML = FIGURA.exercicios(104);
    $("fig-consultas").innerHTML = FIGURA.consultas(104);
    $("fig-ajuda").innerHTML = FIGURA.ajuda(104);

    // ---------- navegacao ----------
    function ir(destino) {
      tela = destino;
      todas("[data-tela]").forEach(function (s) { s.hidden = s.dataset.tela !== destino; });
      $("titulo").textContent = TITULOS[destino];
      $("voltar").hidden = (destino === telaBase);
      $("faixa-espiando").hidden = !(papel === "responsavel" && destino !== "responsavel");
      // No topo não cabe tudo em 390px: a figura acompanha o título das
      // subtelas; o tamanho da letra fica só na tela inicial, onde se ajusta.
      $("figura-topo").innerHTML = FIG_TELA[destino] ? FIGURA[FIG_TELA[destino]](50) : "";
      $("fonte-ctl").hidden = (destino !== "inicio");
      subirTopo();
      desenhar();
    }

    // ---------- pedacos ----------
    function parBotoes(id, sim, nao) {
      var r = Casa.resposta(id);
      return '<div class="par">' +
        '<button class="resposta sim" data-resp="sim" data-id="' + id + '" aria-pressed="' + (r === "sim") + '">' +
          '<span class="marca">' + CERTO + '</span><span class="rot">' + sim + "</span></button>" +
        '<button class="resposta nao" data-resp="nao" data-id="' + id + '" aria-pressed="' + (r === "nao") + '">' +
          '<span class="marca">' + ERRADO + '</span><span class="rot">' + nao + "</span></button></div>";
    }
    function classeItem(r) { return r === "sim" ? " feito" : r === "nao" ? " pulado" : ""; }
    function vazio(m) { return '<p class="vazio-msg">' + esc(m) + "</p>"; }

    // ---------- desenho ----------
    function desenhar() {
      if (tela === "inicio") inicio();
      else if (tela === "remedios") listaRemedios();
      else if (tela === "exercicios") listaExercicios();
      else if (tela === "consultas") listaConsultas();
      else if (tela === "ajuda") listaContatos();
      else if (tela === "responsavel") painelResponsavel();
    }

    function inicio() {
      var p = Casa.cadastro.perfil || {};
      $("saudacao").textContent = saudacaoDaHora();
      $("nome-pessoa").textContent = ((p.trato || "") + " " + (p.nome || "")).trim() || usuario || "Bem-vindo";
      $("data-hoje").textContent = porExtenso(new Date());

      selo("selo-remedios", Casa.cadastro.remedios);
      selo("selo-exercicios", Casa.cadastro.exercicios);
      var faltaConsulta = Casa.cadastro.consultas.filter(function (c) { return !Casa.respostaConsulta(c.id); }).length;
      $("selo-consultas").textContent = faltaConsulta || "✓";
      $("selo-consultas").className = "selo" + (faltaConsulta ? "" : " pronto");
      $("selo-consultas").hidden = false;

      var agora = agoraMin();
      var pendentes = Casa.cadastro.remedios.filter(function (r) { return !Casa.resposta(r.id); })
        .sort(function (a, b) { return minutos(a.hora) - minutos(b.hora); });
      var prox = pendentes.filter(function (r) { return minutos(r.hora) >= agora - 60; })[0] || pendentes[0];

      var cx = $("cartao-agora");
      if (prox) {
        var chegou = minutos(prox.hora) <= agora;
        cx.className = "agora" + (chegou ? " chegou" : "");
        cx.innerHTML = FIGURA.relogio(prox.hora, 72, chegou ? "#E02020" : "#1565D8") +
          '<div class="txt"><div class="rot">' + (chegou ? "Está na hora de" : "O próximo remédio é") + "</div>" +
          '<div class="val">' + esc(prox.hora) + " · " + esc(prox.nome) + "</div></div>";
      } else {
        cx.className = "agora pronto";
        cx.innerHTML = FIGURA.relogio(new Date().getHours() + ":" + pad(new Date().getMinutes()), 72, "#17A34A") +
          '<div class="txt"><div class="rot">Tudo em dia</div>' +
          '<div class="val">Nada pendente para hoje</div></div>';
      }

      pintarStatus();
      $("btn-avisos").hidden = !(papel === "idoso" && "Notification" in window && Notification.permission === "default");
    }

    function selo(nome, lista) {
      var faltam = lista.filter(function (x) { return !Casa.resposta(x.id); }).length;
      $(nome).textContent = faltam || "✓";
      $(nome).className = "selo" + (faltam ? "" : " pronto");
    }

    function pintarStatus() {
      var b = $("bolinha-app"), t = $("status-app");
      if (!b) return;
      var outro = papel === "idoso" ? "de quem cuida" : "da pessoa cuidada";
      if (!Casa.temServidor()) { b.className = "bolinha off"; t.textContent = "Funcionando só neste aparelho"; }
      else if (Casa.estado === "ligada") { b.className = "bolinha ok"; t.textContent = "Ligado ao celular " + outro; }
      else { b.className = "bolinha"; t.textContent = "Procurando conexão…"; }
    }

    function listaRemedios() {
      var lista = Casa.cadastro.remedios.slice().sort(function (a, b) { return minutos(a.hora) - minutos(b.hora); });
      $("lista-remedios").innerHTML = lista.length ? lista.map(function (r) {
        return '<article class="item' + classeItem(Casa.resposta(r.id)) + '">' +
          '<div class="item-topo">' + FIGURA.relogio(r.hora, 82, COR_TELA.remedios) +
          '<div class="item-txt"><div class="hora-txt">' + esc(r.hora) + "</div>" +
          '<div class="principal">' + esc(r.nome) + "</div>" +
          '<div class="apoio">' + esc(r.motivo) + "</div></div></div>" +
          parBotoes(r.id, "Tomei", "Não tomei") + "</article>";
      }).join("") : vazio("Nenhum remédio cadastrado ainda.");
    }

    function listaExercicios() {
      // Aqui o número vale mais que a figura: repetir o mesmo desenho em
      // toda linha é ruído, e o que a pessoa precisa saber é a ordem.
      $("lista-exercicios").innerHTML = Casa.cadastro.exercicios.length ? Casa.cadastro.exercicios.map(function (e, i) {
        return '<article class="item' + classeItem(Casa.resposta(e.id)) + '">' +
          '<div class="item-topo"><span class="ordem">' + (i + 1) + "</span>" +
          '<div class="item-txt"><div class="principal">' + esc(e.nome) + "</div>" +
          '<div class="apoio">' + esc(e.detalhe) + "</div></div></div>" +
          parBotoes(e.id, "Fiz", "Não fiz") + "</article>";
      }).join("") : vazio("Nenhum exercício cadastrado ainda.");
    }

    function listaConsultas() {
      var lista = Casa.cadastro.consultas.slice().sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); });
      $("lista-consultas").innerHTML = lista.length ? lista.map(function (c) {
        var r = Casa.respostaConsulta(c.id);
        return '<article class="item' + classeItem(r) + '">' +
          '<div class="item-topo">' + FIGURA.relogio(c.hora, 82, COR_TELA.consultas) +
          '<div class="item-txt"><div class="hora-txt">' + dataCurta(c.data) + " · " + esc(c.hora) + "</div>" +
          '<div class="principal">' + esc(c.medico) + "</div>" +
          '<div class="apoio">' + esc(c.especialidade) + "</div></div></div>" +
          '<div class="par">' +
          '<button class="resposta sim" data-consulta="sim" data-id="' + c.id + '" aria-pressed="' + (r === "sim") + '">' +
            '<span class="marca">' + CERTO + '</span><span class="rot">Fui</span></button>' +
          '<button class="resposta nao" data-consulta="nao" data-id="' + c.id + '" aria-pressed="' + (r === "nao") + '">' +
            '<span class="marca">' + ERRADO + '</span><span class="rot">Não fui</span></button>' +
          "</div></article>";
      }).join("") : vazio("Nenhuma consulta marcada.");
    }

    function listaContatos() {
      $("lista-contatos").innerHTML = Casa.cadastro.contatos.length ? Casa.cadastro.contatos.map(function (k) {
        return '<div class="contato"><div class="quem"><b>' + esc(k.nome) + "</b><span>" + esc(telefoneBonito(k.telefone)) + "</span></div>" +
          '<button class="ligar" data-ligar="' + esc(k.telefone) + '" data-nome="' + esc(k.nome) + '">' +
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 3.5h3.6l1.9 4.8-2.4 1.7a13 13 0 0 0 6.3 6.3l1.7-2.4 4.8 1.9v3.6a2 2 0 0 1-2.2 2A18 18 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/></svg>Ligar</button></div>';
      }).join("") : vazio("Nenhum telefone cadastrado.");
    }

    function painelResponsavel() {
      var p = Casa.cadastro.perfil || {};
      if (document.activeElement !== $("cfg-trato")) $("cfg-trato").value = p.trato || "";
      if (document.activeElement !== $("cfg-nome")) $("cfg-nome").value = p.nome || "";

      $("edit-remedios").innerHTML = Casa.cadastro.remedios.map(function (r) {
        return linhaEdit(r.id, "remedios", r.hora + " · " + r.nome, r.motivo);
      }).join("");
      $("edit-exercicios").innerHTML = Casa.cadastro.exercicios.map(function (e) {
        return linhaEdit(e.id, "exercicios", e.nome, e.detalhe);
      }).join("");
      $("edit-consultas").innerHTML = Casa.cadastro.consultas.map(function (c) {
        return linhaEdit(c.id, "consultas", dataCurta(c.data) + " " + c.hora + " · " + c.medico, c.especialidade);
      }).join("");
      $("edit-contatos").innerHTML = Casa.cadastro.contatos.map(function (k) {
        return linhaEdit(k.id, "contatos", k.nome, telefoneBonito(k.telefone));
      }).join("");

      $("cod-casa").textContent = Casa.codigo || "—";
      $("nota-casa").textContent = !Casa.temServidor()
        ? "Sem servidor configurado: este aparelho guarda tudo sozinho."
        : Casa.estado === "ligada"
          ? "Digite este código no outro celular para os dois verem a mesma coisa."
          : "Sem conexão agora. O que você mudar fica guardado e sobe quando a rede voltar.";

      relatorio();
    }

    function linhaEdit(id, lista, titulo, apoio) {
      return '<div class="linha-edit"><div class="info"><b>' + esc(titulo) + "</b><span>" + esc(apoio) + "</span></div>" +
        '<button class="apagar" data-apagar="' + id + '" data-lista="' + lista + '" aria-label="Apagar ' + esc(titulo) + '">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9L18 7M10 11v5m4-5v5"/></svg></button></div>';
    }

    function relatorio() {
      var dias = [];
      // Hoje na primeira coluna: no celular a tabela rola para o lado,
      // e o dia que mais importa nao pode ficar escondido no fim.
      for (var i = 0; i <= 6; i++) {
        var d = new Date(); d.setDate(d.getDate() - i);
        dias.push({ chave: chaveDia(d), rot: i === 0 ? "Hoje" : pad(d.getDate()) + "/" + pad(d.getMonth() + 1) });
      }
      var itens = Casa.cadastro.remedios.map(function (r) { return { id: r.id, nome: r.hora + " " + r.nome }; })
        .concat(Casa.cadastro.exercicios.map(function (e) { return { id: e.id, nome: e.nome }; }));

      if (!itens.length) { $("tabela-relatorio").innerHTML = "<tbody><tr><td>Nada cadastrado ainda.</td></tr></tbody>"; return; }

      $("tabela-relatorio").innerHTML =
        "<thead><tr><th>Item</th>" + dias.map(function (d) { return "<th>" + d.rot + "</th>"; }).join("") + "</tr></thead><tbody>" +
        itens.map(function (it) {
          return "<tr><td>" + esc(it.nome) + "</td>" + dias.map(function (d) {
            var r = Casa.resposta(it.id, d.chave);
            var cls = r === "sim" ? "s" : r === "nao" ? "n" : "v";
            return '<td><span class="marca-tab ' + cls + '">' + (r === "sim" ? "✓" : r === "nao" ? "✕" : "–") + "</span></td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody>";
    }

    // ---------- lembrete de horario ----------
    function checar() {
      if (papel !== "idoso" || !$("fundo-lembrete").hidden) return;
      var agora = agoraMin();
      var achado = Casa.cadastro.remedios.filter(function (r) {
        var m = minutos(r.hora);
        return m <= agora && agora - m <= 45 && !Casa.resposta(r.id) && !dispensados[r.id];
      }).sort(function (a, b) { return minutos(b.hora) - minutos(a.hora); })[0];
      if (achado) abrirLembrete(achado);
    }

    function abrirLembrete(r) {
      $("caixa-lembrete").innerHTML =
        '<div class="cabeca">' + FIGURA.relogio(r.hora, 88, "#E02020") +
        '<div><div class="hora-txt">' + esc(r.hora) + "</div>" +
        '<div class="principal">' + esc(r.nome) + "</div>" +
        '<div class="apoio">' + esc(r.motivo) + "</div></div></div>" +
        '<p class="pergunta">Você já tomou este remédio?</p>' +
        '<div class="par">' +
        '<button class="resposta sim" data-lembrete="sim" data-id="' + r.id + '"><span class="marca">' + CERTO + '</span><span class="rot">Tomei</span></button>' +
        '<button class="resposta nao" data-lembrete="nao" data-id="' + r.id + '"><span class="marca">' + ERRADO + '</span><span class="rot">Agora não</span></button></div>';
      subirTopo();
      $("fundo-lembrete").hidden = false;
      if (navigator.vibrate) { try { navigator.vibrate([180, 90, 180]); } catch (e) {} }
      avisarPorFora(r);
    }

    // a notificação do sistema — a que aparece por cima de tudo
    function avisarPorFora(r) {
      if (naDemo || !("Notification" in window) || Notification.permission !== "granted") return;
      var corpo = r.hora + " — " + r.nome + (r.motivo ? " (" + r.motivo + ")" : "");
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(function (reg) {
            reg.showNotification("Hora do remédio", {
              body: corpo, icon: "icones/icone-192.png", badge: "icones/icone-192.png",
              tag: "remedio-" + r.id, vibrate: [180, 90, 180], requireInteraction: true
            });
          }).catch(function () {});
        } else {
          new Notification("Hora do remédio", { body: corpo, icon: "icones/icone-192.png" });
        }
      } catch (e) {}
    }

    function pedirLigacao(nome, numero) {
      $("ligacao-quem").textContent = nome;
      $("ligacao-num").textContent = telefoneBonito(numero);
      raiz.querySelector('[data-acao="ligacao-sim"]').dataset.numero = numero;
      subirTopo();
      $("fundo-ligacao").hidden = false;
    }

    // ---------- toques ----------
    raiz.addEventListener("click", function (ev) {
      var alvo = ev.target.closest("button");
      if (!alvo || !raiz.contains(alvo)) return;
      var acao = alvo.dataset.acao;

      if (alvo.dataset.ir) return ir(alvo.dataset.ir);
      if (alvo === $("voltar")) return ir(telaBase);

      if (alvo.dataset.fonte) {
        fator = parseFloat(alvo.dataset.fonte); aplicarEscala();
        [].forEach.call(alvo.parentNode.children, function (b) { b.setAttribute("aria-pressed", b === alvo); });
        return;
      }

      if (alvo.dataset.resp) return Casa.responder(alvo.dataset.id, alvo.dataset.resp);
      if (alvo.dataset.consulta) return Casa.responderConsulta(alvo.dataset.id, alvo.dataset.consulta);

      if (alvo.dataset.lembrete) {
        if (alvo.dataset.lembrete === "sim") Casa.responder(alvo.dataset.id, "sim");
        else dispensados[alvo.dataset.id] = true;
        $("fundo-lembrete").hidden = true;
        return desenhar();
      }

      if (alvo === $("btn-192")) return pedirLigacao("Ambulância (SAMU)", "192");
      if (alvo.dataset.ligar) return pedirLigacao(alvo.dataset.nome, alvo.dataset.ligar);
      if (acao === "ligacao-nao") { $("fundo-ligacao").hidden = true; return; }
      if (acao === "ligacao-sim") {
        $("fundo-ligacao").hidden = true;
        window.location.href = "tel:" + String(alvo.dataset.numero || "").replace(/\D/g, "");
        return;
      }

      if (acao === "pedir-avisos") {
        if ("Notification" in window) Notification.requestPermission().then(function () { desenhar(); });
        return;
      }

      // --- cadastro ---
      if (acao === "add-remedio") {
        if (!val("nr-nome")) return $("nr-nome").focus();
        Casa.cadastro.remedios.push({ id: novoId(), hora: val("nr-hora") || "08:00", nome: val("nr-nome"), motivo: val("nr-motivo") || "—" });
        limpar(["nr-nome", "nr-motivo"]); return Casa.mudou("cadastro");
      }
      if (acao === "add-exercicio") {
        if (!val("ne-nome")) return $("ne-nome").focus();
        Casa.cadastro.exercicios.push({ id: novoId(), nome: val("ne-nome"), detalhe: val("ne-detalhe") || "—" });
        limpar(["ne-nome", "ne-detalhe"]); return Casa.mudou("cadastro");
      }
      if (acao === "add-consulta") {
        if (!val("nc-medico")) return $("nc-medico").focus();
        if (!val("nc-data")) return $("nc-data").focus();
        Casa.cadastro.consultas.push({ id: novoId(), data: val("nc-data"), hora: val("nc-hora") || "09:00", medico: val("nc-medico"), especialidade: val("nc-esp") || "—" });
        limpar(["nc-medico", "nc-esp"]); return Casa.mudou("cadastro");
      }
      if (acao === "add-contato") {
        if (!val("nk-nome")) return $("nk-nome").focus();
        if (!val("nk-tel")) return $("nk-tel").focus();
        Casa.cadastro.contatos.push({ id: novoId(), nome: val("nk-nome"), telefone: val("nk-tel") });
        limpar(["nk-nome", "nk-tel"]); return Casa.mudou("cadastro");
      }
      if (alvo.dataset.apagar) {
        var qual = alvo.dataset.lista, id = alvo.dataset.apagar;
        Casa.cadastro[qual] = Casa.cadastro[qual].filter(function (x) { return x.id !== id; });
        return Casa.mudou("cadastro");
      }

      if (acao === "espiar") return ir("inicio");
      if (acao === "imprimir") { montarAgenda(); return window.print(); }
      if (acao === "trocar-perfil" && window.Aparelho) return window.Aparelho.sair();
    });

    raiz.addEventListener("change", function (ev) {
      if (ev.target === $("cfg-trato") || ev.target === $("cfg-nome")) {
        Casa.cadastro.perfil = { trato: val("cfg-trato"), nome: val("cfg-nome") };
        Casa.mudou("cadastro");
      }
    });

    raiz.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      $("fundo-lembrete").hidden = true;
      $("fundo-ligacao").hidden = true;
    });

    // ---------- liga na casa ----------
    Casa.assinar(desenhar);
    $("nc-data").value = Casa.hoje();
    // Trocar de perfil so existe no app de verdade, nao na demonstracao.
    $("btn-trocar").hidden = (papel !== "idoso" || naDemo);
    $("btn-trocar-resp").hidden = naDemo;
    if (usuario && papel === "responsavel") { $("ola-usuario").textContent = "Olá, " + usuario; $("ola-usuario").hidden = false; }
    ir(telaBase);
    if (papel === "idoso") { checar(); relogioLembrete = setInterval(checar, 30000); }

    return {
      raiz: raiz,
      desenhar: desenhar,
      mostrarLembrete: function () {
        abrirLembrete(Casa.cadastro.remedios[0] || { id: "demo", hora: "18:30", nome: "Metformina", motivo: "Diabetes" });
      },
      destruir: function () { clearInterval(relogioLembrete); caixa.innerHTML = ""; }
    };
  }

  // ============================================================
  // AGENDA DE PAPEL — o caderno para quem não usa celular
  // ============================================================
  function montarAgenda() {
    var alvo = document.getElementById("agenda");
    if (!alvo) return;
    var c = Casa.cadastro, p = c.perfil || {}, q = '<span class="quadro"></span>';
    alvo.innerHTML =
      "<h1>Viva com Cuidado</h1>" +
      '<p class="quem-papel"><b>' + esc(((p.trato || "") + " " + (p.nome || "")).trim()) + "</b> · " + esc(porExtenso(new Date())) + "</p>" +
      "<h2>Meus remédios</h2><ul>" +
      c.remedios.slice().sort(function (a, b) { return minutos(a.hora) - minutos(b.hora); })
        .map(function (r) { return "<li>" + q + "<b>" + esc(r.hora) + "</b> — " + esc(r.nome) + " (" + esc(r.motivo) + ")</li>"; }).join("") +
      "</ul><h2>Meus exercícios</h2><ul>" +
      c.exercicios.map(function (e) { return "<li>" + q + esc(e.nome) + " — " + esc(e.detalhe) + "</li>"; }).join("") +
      "</ul><h2>Minhas consultas</h2><ul>" +
      c.consultas.map(function (x) { return "<li>" + q + "<b>" + dataCurta(x.data) + " " + esc(x.hora) + "</b> — " + esc(x.medico) + " (" + esc(x.especialidade) + ")</li>"; }).join("") +
      "</ul><h2>Telefones</h2><ul><li><b>192</b> — Ambulância (SAMU)</li>" +
      c.contatos.map(function (k) { return "<li><b>" + esc(telefoneBonito(k.telefone)) + "</b> — " + esc(k.nome) + "</li>"; }).join("") +
      '</ul><p class="rodape-papel">Marque o quadradinho quando fizer. Guarde esta folha em lugar visível.</p>';
  }

  window.criarApp = criarApp;
  window.montarAgenda = montarAgenda;
})();
