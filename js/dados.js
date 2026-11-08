/* ============================================================
   A CASA — onde os dados moram
   ------------------------------------------------------------
   Uma "casa" e um par de aparelhos ligados por um codigo de 6
   caracteres. Dentro dela existem duas partes separadas:

     cadastro → remedios, exercicios, consultas, telefones, nome
                Escrito por QUEM CUIDA.
     registro → o que foi feito em cada dia.
                Escrito por QUEM E CUIDADO.

   Sao separadas de proposito. Se fossem uma coisa so, o "Tomei"
   marcado as 18:30 apagaria o remedio que a filha cadastrou as
   18:29 — quem grava por ultimo vence.

   Tudo tambem fica gravado no proprio aparelho, entao o app
   funciona sem internet e sobe o que mudou quando a rede volta.

   TROCAR DE SERVIDOR: e so aqui. As telas nao sabem de onde o
   dado vem — elas so chamam Casa.mudou() e escutam Casa.assinar().
   ============================================================ */

window.Casa = (function () {
  "use strict";

  var SEMENTE = {
    perfil: { trato: "Sr.", nome: "José" },
    remedios: [
      { id: "r1", hora: "07:00", nome: "Losartana", motivo: "Pressão" },
      { id: "r2", hora: "07:00", nome: "Metformina", motivo: "Diabetes" },
      { id: "r3", hora: "07:00", nome: "Cálcio", motivo: "Osteoporose" },
      { id: "r4", hora: "12:30", nome: "Metformina", motivo: "Diabetes" },
      { id: "r5", hora: "18:30", nome: "Metformina", motivo: "Diabetes" },
      { id: "r6", hora: "21:00", nome: "Anlodipino", motivo: "Pressão" }
    ],
    exercicios: [
      { id: "e1", nome: "Caminhada", detalhe: "30 minutos" },
      { id: "e2", nome: "Sentar e levantar", detalhe: "8 vezes" },
      { id: "e3", nome: "Elevação lateral das pernas", detalhe: "segurando em apoio — 12 vezes" }
    ],
    consultas: [
      { id: "c1", data: "2026-11-10", hora: "15:00", medico: "Dra. Carol", especialidade: "Cardiologista" },
      { id: "c2", data: "2026-11-25", hora: "08:00", medico: "Dr. Carlos", especialidade: "Geriatra" }
    ],
    contatos: [
      { id: "k1", nome: "Maria (filha)", telefone: "11988887777" },
      { id: "k2", nome: "Dra. Carol", telefone: "1133334444" }
    ]
  };

  function clonar(o) { return JSON.parse(JSON.stringify(o)); }
  function guardar(c, v) { try { localStorage.setItem(c, JSON.stringify(v)); } catch (e) {} }
  function buscar(c) { try { var v = localStorage.getItem(c); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  // O Firebase apaga lista vazia e devolve nada no lugar. Isto recompoe a forma.
  function arrumarCadastro(c) {
    c = c || {};
    return {
      perfil: c.perfil || { trato: "", nome: "" },
      remedios: c.remedios || [],
      exercicios: c.exercicios || [],
      consultas: c.consultas || [],
      contatos: c.contatos || []
    };
  }
  function arrumarRegistro(r) {
    r = r || {};
    return { dias: r.dias || {}, consultas: r.consultas || {} };
  }

  var Casa = {
    codigo: null,
    papel: "idoso",
    cadastro: arrumarCadastro(null),
    registro: { dias: {}, consultas: {} },
    estado: "sozinha",          // sozinha | procurando | ligada
    ouvintes: [],

    _bd: null,
    _refs: [],
    _pendentes: {},

    SEMENTE: SEMENTE,

    // ---------- quem quer saber quando algo muda ----------
    assinar: function (fn) { this.ouvintes.push(fn); },
    esquecerTodos: function () { this.ouvintes = []; },
    avisar: function () { this.ouvintes.forEach(function (f) { try { f(); } catch (e) {} }); },

    // ---------- liga o servidor: Firebase se houver; senao, o servidor.js da casa ----------
    ligarServidor: function () {
      var cfg = window.CONFIG_FIREBASE || {};
      if (!cfg.databaseURL || !window.firebase) { this.estado = "sozinha"; this._procurarServidorDaCasa(); return false; }
      try {
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        this._bd = firebase.database();
        this.estado = "procurando";
        var eu = this;
        // O proprio Firebase avisa quando a conexao cai e volta.
        this._bd.ref(".info/connected").on("value", function (s) {
          eu.estado = s.val() ? "ligada" : "procurando";
          eu.avisar();
        });
        return true;
      } catch (e) {
        this._bd = null; this.estado = "sozinha"; return false;
      }
    },

    temServidor: function () { return !!this._bd || this._api; },

    // ---------- servidor da casa (servidor.js), quando nao ha Firebase ----------
    // Existe quando o app foi aberto pelo endereco do servidor.js.
    // Aberto direto do arquivo, ou num site sem ele, o ping falha e o
    // aparelho segue guardando os dados sozinho, como antes.
    _api: false,
    _eventos: null,
    _naoEnviado: {},

    _procurarServidorDaCasa: function () {
      var eu = this;
      if (location.protocol === "file:" || !window.fetch || !window.EventSource) return;
      fetch("api/ping", { cache: "no-store" }).then(function (r) {
        if (!r.ok) return;
        eu._api = true;
        eu.estado = "procurando";
        eu.avisar();
        if (eu.codigo) eu._escutarServidorDaCasa();   // a casa abriu antes da resposta chegar
      }).catch(function () {});
    },

    _escutarServidorDaCasa: function () {
      var eu = this;
      var es = new EventSource("api/casas/" + encodeURIComponent(eu.codigo) + "/eventos");
      eu._eventos = es;
      var arrumar = { cadastro: arrumarCadastro, registro: arrumarRegistro };

      es.onopen = function () {
        eu.estado = "ligada";
        // O que nao conseguiu subir enquanto a rede estava fora sobe agora,
        // antes de o servidor mandar o estado dele por cima.
        Object.keys(eu._naoEnviado).forEach(function (parte) { eu._publicar(parte); });
        eu._naoEnviado = {};
        eu.avisar();
      };
      es.onerror = function () {
        // O EventSource tenta de novo sozinho a cada 3 segundos.
        eu.estado = "procurando";
        eu.avisar();
      };
      es.onmessage = function (ev) {
        var msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        if (!arrumar[msg.parte]) return;
        // Casa nova: quem cuida e o dono do cadastro, entao e ele quem o cria.
        if (msg.valor === null) {
          if (msg.parte === "cadastro" && eu.papel === "responsavel") eu._publicar("cadastro");
          return;
        }
        if (eu._pendentes[msg.parte]) return;   // temos mudanca local por enviar: ela vale mais
        eu[msg.parte] = arrumar[msg.parte](msg.valor);
        eu._gravarLocal();
        eu.avisar();
      };
    },

    // ---------- a casa existe? (antes de entrar com um codigo digitado) ----------
    // Responde true, false, ou null quando nao da para saber agora
    // (sem internet, ou servidor da casa) — nesse caso o app deixa entrar.
    casaExiste: function (codigo) {
      var eu = this;
      return new Promise(function (responder) {
        if (!eu._bd) return responder(null);
        var desistiu = setTimeout(function () { responder(null); }, 6000);
        eu._bd.ref("casas/" + codigo + "/cadastro").once("value").then(function (s) {
          clearTimeout(desistiu); responder(s.exists());
        }, function () { clearTimeout(desistiu); responder(null); });
      });
    },

    // ---------- abre uma casa ----------
    // Casa nova comeca vazia. A demonstracao passa Casa.SEMENTE para
    // ter o que mostrar.
    abrir: function (codigo, papel, semente) {
      var eu = this;
      eu.fechar();
      eu.codigo = codigo;
      if (papel) eu.papel = papel;

      // 1. o que ja estava neste aparelho aparece na hora
      var local = buscar("viva:casa:" + codigo);
      eu.cadastro = arrumarCadastro(local && local.cadastro ? local.cadastro : semente ? clonar(semente) : null);
      eu.registro = arrumarRegistro(local && local.registro);
      eu.avisar();

      // 2. e o servidor manda o que houver de mais novo
      if (eu._api) return eu._escutarServidorDaCasa();
      if (!eu._bd) return;
      eu._escutar("cadastro", arrumarCadastro);
      eu._escutar("registro", arrumarRegistro);
    },

    fechar: function () {
      this._refs.forEach(function (r) { try { r.off(); } catch (e) {} });
      this._refs = [];
      if (this._eventos) { this._eventos.close(); this._eventos = null; }
    },

    _caminho: function (parte) { return "casas/" + this.codigo + "/" + parte; },

    _escutar: function (parte, arrumar) {
      var eu = this;
      var ref = eu._bd.ref(eu._caminho(parte));
      ref.on("value", function (snap) {
        // Casa nova: quem cuida e o dono do cadastro, entao e ele quem o cria.
        if (!snap.exists()) {
          if (parte === "cadastro" && eu.papel === "responsavel") eu._publicar("cadastro");
          return;
        }
        if (eu._pendentes[parte]) return;   // temos mudanca local por enviar: ela vale mais
        eu[parte] = arrumar(snap.val());
        eu._gravarLocal();
        eu.avisar();
      }, function () {
        eu.estado = "sozinha"; eu.avisar();
      });
      eu._refs.push(ref);
    },

    // ---------- mexeu em Casa.cadastro / Casa.registro? chame isto ----------
    mudou: function (parte) {
      this._gravarLocal();
      this.avisar();
      this._publicar(parte);
    },

    _gravarLocal: function () {
      if (this.codigo) guardar("viva:casa:" + this.codigo, { cadastro: this.cadastro, registro: this.registro });
    },

    // Junta as gravacoes de 400ms num envio so — evita mandar a cada toque.
    _publicar: function (parte) {
      var eu = this;
      if ((!eu._bd && !eu._api) || !eu.codigo) return;
      clearTimeout(eu._pendentes[parte]);
      eu._pendentes[parte] = setTimeout(function () {
        eu._pendentes[parte] = null;
        if (eu._api) {
          fetch("api/casas/" + encodeURIComponent(eu.codigo) + "/" + parte, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eu[parte])
          }).then(function (r) {
            if (!r.ok) throw new Error(r.status);
          }).catch(function () {
            eu._naoEnviado[parte] = true;   // sobe de novo quando a conexao voltar
            eu.estado = "procurando"; eu.avisar();
          });
          return;
        }
        eu._bd.ref(eu._caminho(parte)).set(clonar(eu[parte])).catch(function () {
          eu.estado = "sozinha"; eu.avisar();
        });
      }, 400);
    },

    // ---------- perguntas que as telas fazem ----------
    resposta: function (id, dia) {
      var r = this.registro.dias[dia || this.hoje()];
      return (r && r[id]) || null;
    },
    responder: function (id, valor) {
      var dia = this.hoje();
      if (!this.registro.dias[dia]) this.registro.dias[dia] = {};
      if (this.registro.dias[dia][id] === valor) delete this.registro.dias[dia][id];
      else this.registro.dias[dia][id] = valor;
      this.mudou("registro");
    },
    respostaConsulta: function (id) { return this.registro.consultas[id] || null; },
    responderConsulta: function (id, valor) {
      if (this.registro.consultas[id] === valor) delete this.registro.consultas[id];
      else this.registro.consultas[id] = valor;
      this.mudou("registro");
    },

    hoje: function () {
      var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    },

    recomecar: function () {
      this.cadastro = arrumarCadastro(clonar(SEMENTE));
      this.registro = { dias: {}, consultas: {} };
      this.mudou("cadastro");
      this.mudou("registro");
    }
  };

  return Casa;
})();
