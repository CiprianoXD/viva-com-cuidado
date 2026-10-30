/* ============================================================
   AS FIGURAS
   ------------------------------------------------------------
   Desenhos coloridos, nao iconezinhos de risco fino. Quem tem
   80 anos reconhece uma AMBULANCIA; nao reconhece um pictograma
   abstrato de telefone.

   Sao SVG escritos a mao — nao dependem de internet nem de
   biblioteca nenhuma, e crescem sem borrar.

   ONDE MEXER: as cores estao no comeco de cada figura.
   ============================================================ */

window.FIGURA = (function () {
  "use strict";

  function svg(conteudo, tamanho) {
    var t = tamanho || 104;
    return '<svg class="figura" width="' + t + '" height="' + t + '" viewBox="0 0 120 120" ' +
      'aria-hidden="true" focusable="false">' + conteudo + "</svg>";
  }

  /* Metade de uma capsula. Desenha o lado arredondado e deixa o
     outro reto, para as duas metades encaixarem. */
  function meiaCapsula(x0, x1, cy, r, cor, ladoRedondo) {
    if (ladoRedondo === "esq") {
      return '<path d="M' + x1 + ' ' + (cy - r) + ' H' + (x0 + r) +
        ' A' + r + ' ' + r + ' 0 0 0 ' + (x0 + r) + ' ' + (cy + r) +
        ' H' + x1 + ' Z" fill="' + cor + '"/>';
    }
    return '<path d="M' + x0 + ' ' + (cy - r) + ' H' + (x1 - r) +
      ' A' + r + ' ' + r + ' 0 0 1 ' + (x1 - r) + ' ' + (cy + r) +
      ' H' + x0 + ' Z" fill="' + cor + '"/>';
  }

  function capsula(cx, cy, comprimento, espessura, corA, corB, giro) {
    var r = espessura / 2;
    var x0 = cx - comprimento / 2, x1 = cx + comprimento / 2, meio = cx;
    return '<g transform="rotate(' + giro + ' ' + cx + ' ' + cy + ')">' +
      meiaCapsula(x0, meio, cy, r, corA, "esq") +
      meiaCapsula(meio, x1, cy, r, corB, "dir") +
      // um brilho, para a pastilha nao ficar chapada
      '<rect x="' + (x0 + r * 0.7) + '" y="' + (cy - r * 0.62) + '" width="' + (comprimento - r * 1.6) +
      '" height="' + (r * 0.42) + '" rx="' + (r * 0.21) + '" fill="#FFFFFF" opacity=".34"/>' +
      '<path d="M' + x0 + ' ' + (cy - r) + ' H' + (x1 - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x1 - r) + ' ' + (cy + r) +
      ' H' + (x0 + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x0 + r) + ' ' + (cy - r) +
      ' Z" fill="none" stroke="#14213D" stroke-width="3.2"/>' +
      '<line x1="' + meio + '" y1="' + (cy - r) + '" x2="' + meio + '" y2="' + (cy + r) + '" stroke="#14213D" stroke-width="3.2"/>' +
      "</g>";
  }

  return {
    // ---------- REMÉDIOS: duas cápsulas cruzadas ----------
    remedios: function (t) {
      return svg(
        capsula(58, 66, 76, 30, "#E02020", "#FFFFFF", -38) +
        capsula(64, 52, 70, 27, "#1565D8", "#FFFFFF", 34),
        t
      );
    },

    // ---------- EXERCÍCIOS: pessoa caminhando ----------
    exercicios: function (t) {
      return svg(
        // pernas
        '<path d="M56 68 L44 96 L34 104" fill="none" stroke="#2E3A46" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M62 68 L76 92 L86 98" fill="none" stroke="#2E3A46" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
        // sapatos
        '<path d="M30 104 h14" stroke="#14213D" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M84 99 h13" stroke="#14213D" stroke-width="9" stroke-linecap="round"/>' +
        // tronco
        '<path d="M59 38 L59 70" stroke="#1565D8" stroke-width="26" stroke-linecap="round"/>' +
        // braços
        '<path d="M56 46 L38 58 L34 70" fill="none" stroke="#1565D8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M64 46 L84 40 L90 30" fill="none" stroke="#1565D8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
        // mãos
        '<circle cx="33" cy="72" r="5.5" fill="#F2C49B"/>' +
        '<circle cx="91" cy="28" r="5.5" fill="#F2C49B"/>' +
        // cabeça, com um topete grisalho discreto
        '<circle cx="59" cy="26" r="14" fill="#F2C49B" stroke="#14213D" stroke-width="3"/>' +
        '<path d="M46.4 19.8 a14 14 0 0 1 25.2 0 a30 30 0 0 0 -25.2 0 Z" fill="#DDE4EA"/>' +
        '<path d="M46.4 19.8 a14 14 0 0 1 25.2 0" fill="none" stroke="#14213D" stroke-width="2.8" stroke-linecap="round"/>',
        t
      );
    },

    // ---------- CONSULTAS: estetoscópio ----------
    consultas: function (t) {
      return svg(
        // olivas
        '<path d="M30 22 v16 a30 30 0 0 0 34 29" fill="none" stroke="#1565D8" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M62 22 v16 a30 30 0 0 1 -34 29" fill="none" stroke="#1565D8" stroke-width="9" stroke-linecap="round"/>' +
        '<circle cx="30" cy="20" r="6" fill="#14213D"/>' +
        '<circle cx="62" cy="20" r="6" fill="#14213D"/>' +
        // tubo até o diafragma
        '<path d="M46 66 v14 a22 22 0 0 0 44 0 v-8" fill="none" stroke="#1565D8" stroke-width="9" stroke-linecap="round"/>' +
        // diafragma
        '<circle cx="90" cy="60" r="17" fill="#CBD6E2" stroke="#14213D" stroke-width="3.4"/>' +
        '<circle cx="90" cy="60" r="9" fill="#8FA3B8" stroke="#14213D" stroke-width="2.6"/>' +
        // coraçãozinho: diz "consulta médica", não "objeto largado"
        '<path d="M22 92 c0-8 12-10 15-3 3-7 15-5 15 3 0 9-15 17-15 17 S22 101 22 92 Z" ' +
        'fill="#E02020" stroke="#14213D" stroke-width="3" stroke-linejoin="round"/>',
        t
      );
    },

    // ---------- AJUDA: ambulância ----------
    ajuda: function (t) {
      return svg(
        // sirene
        '<rect x="52" y="30" width="18" height="9" rx="4" fill="#E02020" stroke="#14213D" stroke-width="2.6"/>' +
        // carroceria
        '<path d="M14 44 h56 l22 16 h14 a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 H14 a4 4 0 0 1 -4 -4 V48 a4 4 0 0 1 4 -4 Z" ' +
        'fill="#FFFFFF" stroke="#14213D" stroke-width="3.4" stroke-linejoin="round"/>' +
        // janela da cabine
        '<path d="M74 48 h12 l14 12 h-26 Z" fill="#8FC4F0" stroke="#14213D" stroke-width="3" stroke-linejoin="round"/>' +
        // faixa
        '<rect x="10" y="72" width="100" height="9" fill="#E02020"/>' +
        // cruz
        '<path d="M32 52 h12 v9 h9 v12 h-9 v9 h-12 v-9 h-9 v-12 h9 Z" fill="#E02020" stroke="#14213D" stroke-width="2.6" stroke-linejoin="round"/>' +
        // rodas
        '<circle cx="34" cy="90" r="13" fill="#2E3A46" stroke="#14213D" stroke-width="3"/>' +
        '<circle cx="34" cy="90" r="5.5" fill="#CBD6E2"/>' +
        '<circle cx="88" cy="90" r="13" fill="#2E3A46" stroke="#14213D" stroke-width="3"/>' +
        '<circle cx="88" cy="90" r="5.5" fill="#CBD6E2"/>',
        t
      );
    },

    // ---------- QUEM CUIDA: mãos segurando um coração ----------
    cuidador: function (t) {
      return svg(
        '<path d="M60 34 c6-14 30-12 30 6 0 16-30 34-30 34 S30 56 30 40 c0-18 24-20 30-6 Z" ' +
        'fill="#E02020" stroke="#14213D" stroke-width="4" stroke-linejoin="round"/>' +
        // mão esquerda
        '<path d="M14 96 V74 a6 6 0 0 1 12 0 v10 l6 -4 a5 5 0 0 1 6 8 l-8 8 v10 Z" ' +
        'fill="#F2C49B" stroke="#14213D" stroke-width="3.6" stroke-linejoin="round"/>' +
        // mão direita
        '<path d="M106 96 V74 a6 6 0 0 0 -12 0 v10 l-6 -4 a5 5 0 0 0 -6 8 l8 8 v10 Z" ' +
        'fill="#F2C49B" stroke="#14213D" stroke-width="3.6" stroke-linejoin="round"/>',
        t
      );
    },

    // ---------- PESSOA CUIDADA: senhora de óculos ----------
    pessoa: function (t) {
      return svg(
        // ombros
        '<path d="M22 106 a38 38 0 0 1 76 0 Z" fill="#1565D8" stroke="#14213D" stroke-width="4" stroke-linejoin="round"/>' +
        // rosto
        '<circle cx="60" cy="46" r="28" fill="#F2C49B" stroke="#14213D" stroke-width="4"/>' +
        // cabelo grisalho
        '<path d="M32 42 a28 28 0 0 1 56 0 a44 44 0 0 0 -56 0 Z" fill="#DDE4EA" stroke="#14213D" stroke-width="3.6" stroke-linejoin="round"/>' +
        // óculos
        '<circle cx="49" cy="50" r="9" fill="#FFFFFF" stroke="#14213D" stroke-width="3.6"/>' +
        '<circle cx="71" cy="50" r="9" fill="#FFFFFF" stroke="#14213D" stroke-width="3.6"/>' +
        '<path d="M58 50 h4" stroke="#14213D" stroke-width="3.6"/>' +
        // sorriso
        '<path d="M52 63 a10 8 0 0 0 16 0" fill="none" stroke="#14213D" stroke-width="3.4" stroke-linecap="round"/>',
        t
      );
    },

    // ---------- telefone, para os botões de ligar ----------
    telefone: function (t) {
      return svg(
        '<path d="M32 20 h20 l10 26 -13 9 a52 52 0 0 0 26 26 l9 -13 26 10 v20 a10 10 0 0 1 -11 10 A78 78 0 0 1 22 31 a10 10 0 0 1 10 -11 Z" ' +
        'fill="#17A34A" stroke="#14213D" stroke-width="3.4" stroke-linejoin="round"/>',
        t
      );
    },

    /* O mostrador de relógio: veio dos desenhos do projeto.
       Quem não lê o número reconhece a posição do ponteiro. */
    relogio: function (hhmm, tamanho, cor) {
      var p = String(hhmm).split(":"), h = +p[0] || 0, m = +p[1] || 0;
      var ah = (((h % 12) + m / 60) * 30 - 90) * Math.PI / 180;
      var am = (m * 6 - 90) * Math.PI / 180;
      var s = tamanho || 78, c = s / 2, r = c - 5, marcas = "";
      for (var i = 0; i < 12; i++) {
        var a = (i * 30 - 90) * Math.PI / 180, grande = i % 3 === 0;
        marcas += '<line x1="' + (c + Math.cos(a) * (r - 4)).toFixed(1) + '" y1="' + (c + Math.sin(a) * (r - 4)).toFixed(1) +
          '" x2="' + (c + Math.cos(a) * (r - (grande ? 10 : 7.5))).toFixed(1) + '" y2="' + (c + Math.sin(a) * (r - (grande ? 10 : 7.5))).toFixed(1) +
          '" stroke="#14213D" stroke-width="' + (grande ? 3 : 1.6) + '" stroke-linecap="round" opacity="' + (grande ? 1 : .5) + '"/>';
      }
      return '<svg class="relogio" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" role="img" aria-label="' + hhmm + '">' +
        '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#FFFFFF" stroke="' + (cor || "#1565D8") + '" stroke-width="5"/>' + marcas +
        '<line x1="' + c + '" y1="' + c + '" x2="' + (c + Math.cos(ah) * r * .48).toFixed(1) + '" y2="' + (c + Math.sin(ah) * r * .48).toFixed(1) + '" stroke="#14213D" stroke-width="5" stroke-linecap="round"/>' +
        '<line x1="' + c + '" y1="' + c + '" x2="' + (c + Math.cos(am) * r * .74).toFixed(1) + '" y2="' + (c + Math.sin(am) * r * .74).toFixed(1) + '" stroke="#14213D" stroke-width="3.6" stroke-linecap="round"/>' +
        '<circle cx="' + c + '" cy="' + c + '" r="3.6" fill="' + (cor || "#1565D8") + '"/></svg>';
    }
  };
})();
