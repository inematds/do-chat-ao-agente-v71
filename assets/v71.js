/* INEMA Learning v7.1 — interações (sem dependências). Nenhum texto visível fica aqui: tudo vem do HTML. */
(function () {
  "use strict";
  var CURSO = document.body.getAttribute("data-curso") || "curso";
  var AULA = document.body.getAttribute("data-aula") || "";
  var TOTAL = parseInt(document.body.getAttribute("data-total") || "0", 10);

  function ler(k, padrao) { try { var v = localStorage.getItem(CURSO + ":" + k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(CURSO + ":" + k, JSON.stringify(v)); } catch (e) {} }

  /* progresso */
  function pintarProgresso() {
    var feitas = ler("feitas", {});
    var n = 0;
    document.querySelectorAll(".lista-aulas a[data-slug]").forEach(function (a) {
      var ok = !!feitas[a.getAttribute("data-slug")];
      a.classList.toggle("feita", ok);
      if (ok) n++;
    });
    var pct = TOTAL ? Math.round((n / TOTAL) * 100) : 0;
    document.querySelectorAll(".prog i").forEach(function (i) { i.style.width = pct + "%"; });
    document.querySelectorAll("[data-pct]").forEach(function (el) { el.textContent = pct; });
    var b = document.querySelector(".concluir");
    if (b && AULA) b.setAttribute("aria-pressed", feitas[AULA] ? "true" : "false");
  }
  function marcar(valor) {
    if (!AULA) return;
    var feitas = ler("feitas", {});
    if (valor) feitas[AULA] = 1; else delete feitas[AULA];
    gravar("feitas", feitas);
    pintarProgresso();
  }
  var bc = document.querySelector(".concluir");
  if (bc) bc.addEventListener("click", function () { marcar(bc.getAttribute("aria-pressed") !== "true"); });
  pintarProgresso();

  /* menu lateral no celular */
  var mb = document.querySelector(".menu-btn");
  if (mb) mb.addEventListener("click", function () {
    var aberto = document.body.classList.toggle("lado-aberto");
    mb.setAttribute("aria-expanded", aberto ? "true" : "false");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.classList.remove("lado-aberto"); });

  /* diagrama: clicar num nó mostra o detalhe */
  document.querySelectorAll(".dg-bloco").forEach(function (bloco) {
    var det = bloco.querySelector(".dg-detalhe");
    var nos = bloco.querySelectorAll(".dg-no");
    nos.forEach(function (no) {
      no.addEventListener("click", function () {
        nos.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        no.setAttribute("aria-pressed", "true");
        var t = no.querySelector("template");
        if (det && t) det.innerHTML = t.innerHTML;
      });
    });
  });

  /* abas genéricas: passos e saída */
  function abas(grupoSel, tabSel, painelAttr) {
    document.querySelectorAll(grupoSel).forEach(function (g) {
      var tabs = g.querySelectorAll(tabSel);
      tabs.forEach(function (t) {
        t.addEventListener("click", function () {
          tabs.forEach(function (o) { o.setAttribute("aria-selected", "false"); });
          t.setAttribute("aria-selected", "true");
          g.querySelectorAll("[" + painelAttr + "]").forEach(function (p) {
            p.hidden = p.getAttribute(painelAttr) !== t.getAttribute("data-alvo");
          });
        });
      });
    });
  }
  abas(".passos", ".ptab", "data-painel");
  abas(".saida", ".saida-tabs button", "data-painel");

  /* copiar */
  document.querySelectorAll(".copiar").forEach(function (b) {
    b.addEventListener("click", function () {
      var pre = b.closest(".cod").querySelector("pre");
      var txt = pre ? pre.innerText : "";
      var feito = function () {
        var orig = b.getAttribute("data-rot");
        b.classList.add("ok"); b.lastChild.textContent = b.getAttribute("data-ok");
        setTimeout(function () { b.classList.remove("ok"); b.lastChild.textContent = orig; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(feito, feito);
      else { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand("copy"); } catch (e) {} feito(); }
    });
  });

  /* exercícios: marcar feito */
  document.querySelectorAll(".exc input[type=checkbox]").forEach(function (c) {
    var k = "ex:" + c.getAttribute("data-id");
    c.checked = !!ler(k, false);
    c.addEventListener("change", function () { gravar(k, c.checked); });
  });

  /* quiz: resposta só aparece depois da tentativa */
  document.querySelectorAll(".quiz").forEach(function (qz) {
    var perguntas = qz.querySelectorAll(".q-item");
    var fb = qz.querySelector(".q-fb");
    var prox = qz.querySelector(".q-prox");
    var i = 0, acertos = 0;
    function mostrar(n) {
      perguntas.forEach(function (p, k) { p.hidden = k !== n; });
      fb.innerHTML = qz.querySelector(".q-aguarda").innerHTML;
      if (prox) prox.hidden = true;
    }
    perguntas.forEach(function (p) {
      p.querySelectorAll(".q-op").forEach(function (op) {
        op.addEventListener("click", function () {
          var certa = op.getAttribute("data-certa") === "1";
          p.querySelectorAll(".q-op").forEach(function (o) {
            o.disabled = true;
            if (o.getAttribute("data-certa") === "1") o.classList.add("certa");
          });
          if (!certa) op.classList.add("errada"); else acertos++;
          var t = p.querySelector(certa ? "template.ok" : "template.no");
          fb.innerHTML = t ? t.innerHTML : "";
          if (prox) {
            prox.hidden = false;
            if (i === perguntas.length - 1) prox.textContent = prox.getAttribute("data-fim");
          }
        });
      });
    });
    if (prox) prox.addEventListener("click", function () {
      if (i < perguntas.length - 1) { i++; mostrar(i); }
      else {
        var tot = qz.querySelector("template.total");
        fb.innerHTML = tot ? tot.innerHTML.replace("{a}", acertos).replace("{n}", perguntas.length) : "";
        prox.hidden = true;
        if (acertos === perguntas.length) marcar(true);
      }
    });
    mostrar(0);
  });

  /* simulação da fila caseira: entrada → rodando → feito / falhou; Ctrl+C deixa a tarefa em "rodando" e a próxima rodada a devolve para a entrada */
  document.querySelectorAll(".simfila").forEach(function (sim) {
    var col = function (n) { return sim.querySelector('[data-col="' + n + '"] .itens'); };
    var cols = { entrada: col("entrada"), rodando: col("rodando"), feito: col("feito"), falhou: col("falhou") };
    var log = sim.querySelector(".sim-log");
    var tarefas = JSON.parse(sim.getAttribute("data-tarefas"));
    var falha = parseInt(sim.getAttribute("data-falha"), 10);
    var msg = JSON.parse(sim.getAttribute("data-msg"));
    var ativo = false, pendente = null, rodadas = 0, jaFalhou = false;
    function chip(t, k) { var d = document.createElement("div"); d.className = "chip"; d.textContent = t; d.setAttribute("data-k", k); return d; }
    function reiniciar() {
      ativo = false; clearTimeout(pendente); rodadas = 0; jaFalhou = false;
      Object.keys(cols).forEach(function (c) { cols[c].innerHTML = ""; });
      tarefas.forEach(function (t, k) { cols.entrada.appendChild(chip(t, k)); });
      log.textContent = msg.inicio;
    }
    function passo() {
      if (!ativo) return;
      var prox = cols.entrada.querySelector(".chip");
      if (!prox) { ativo = false; log.textContent = cols.falhou.children.length ? msg.fimfalha : msg.fim; return; }
      cols.rodando.appendChild(prox); prox.classList.add("rodando");
      pendente = setTimeout(function () {
        if (!ativo) return;
        prox.classList.remove("rodando");
        var k = parseInt(prox.getAttribute("data-k"), 10);
        var falhar = k === falha && !jaFalhou; if (falhar) jaFalhou = true;
        (falhar ? cols.falhou : cols.feito).appendChild(prox);
        pendente = setTimeout(passo, 450);
      }, 1100);
    }
    sim.querySelector('[data-acao="rodar"]').addEventListener("click", function () {
      if (ativo) return; rodadas++;
      var voltou = 0;
      Array.prototype.slice.call(cols.rodando.children).forEach(function (c) { c.classList.remove("rodando"); cols.entrada.insertBefore(c, cols.entrada.firstChild); voltou++; });
      log.textContent = voltou ? msg.retoma : msg.rodando;
      ativo = true; passo();
    });
    sim.querySelector('[data-acao="parar"]').addEventListener("click", function () {
      if (!ativo) return; ativo = false; clearTimeout(pendente);
      sim.querySelectorAll(".chip.rodando").forEach(function (c) { c.classList.remove("rodando"); c.classList.add("parada"); });
      log.textContent = msg.parou;
    });
    sim.querySelector('[data-acao="zerar"]').addEventListener("click", reiniciar);
    reiniciar();
  });
})();
