const $ = s => document.querySelector(s);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const DEF = { size: 100, dys: false, contrast: false, motion: false, lite: false };
let prefs = { ...DEF, ...load('prefs', {}) }, prog = load('prog', {}), lecciones = [];

function aplicar() {
    const r = document.documentElement;
    r.style.setProperty('--scale', prefs.size / 100);
    r.dataset.font = prefs.dys ? 'dys' : '';
    r.dataset.contrast = prefs.contrast ? 'on' : '';
    r.dataset.motion = prefs.motion ? 'off' : '';
    $('#size').value = prefs.size;
    ['dys', 'contrast', 'motion', 'lite'].forEach(k => $('#' + k).checked = prefs[k]);
    save('prefs', prefs);
}
$('#btnAjustes').onclick = e => {
    const p = $('#ajustes'); p.hidden = !p.hidden;
    e.target.setAttribute('aria-expanded', String(!p.hidden));
};
$('#size').oninput = e => { prefs.size = +e.target.value; aplicar(); };
['dys', 'contrast', 'motion', 'lite'].forEach(k => $('#' + k).onchange = e => { prefs[k] = e.target.checked; aplicar(); });
$('#reset').onclick = () => { prefs = { ...DEF }; aplicar(); };

function el(tag, props = {}, ...kids) {
    const n = Object.assign(document.createElement(tag), props);
    kids.forEach(k => n.append(k));
    return n;
}

function listar() {
    const hechas = lecciones.filter(l => prog[l.id] != null).length;
    const pct = lecciones.length ? Math.round(hechas / lecciones.length * 100) : 0;
    const bar = el('div', { className: 'bar' }, el('i'));
    bar.firstChild.style.width = pct + '%';
    $('#progreso').replaceChildren(`Tu progreso: ${hechas} de ${lecciones.length} lecciones (${pct}%)`, bar);
    const ul = $('#lista'); ul.replaceChildren();
    lecciones.forEach(l => {
        const estado = prog[l.id] != null ? el('span', { className: 'done', textContent: `Completada · ${prog[l.id]}/${l.quiz.length}` }) : el('span', { textContent: `${l.minutos} min` });
        const b = el('button', {}, el('span', { textContent: l.titulo }), estado);
        b.onclick = () => abrir(l);
        ul.append(el('li', {}, b));
    });
    $('#lista').hidden = false; $('#progreso').hidden = false; $('#leccion').hidden = true;
}

function leer(parrafos, nodos) {
    if (!('speechSynthesis' in window)) { alert('Tu navegador no soporta lectura en voz alta.'); return; }
    speechSynthesis.cancel();
    parrafos.forEach((t, i) => {
        const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = .9;
        u.onstart = () => nodos[i].classList.add('leyendo');
        u.onend = () => nodos[i].classList.remove('leyendo');
        speechSynthesis.speak(u);
    });
}

function abrir(l) {
    $('#lista').hidden = true; $('#progreso').hidden = true;
    const sec = $('#leccion'); sec.hidden = false; sec.replaceChildren();
    const ps = l.texto.map(t => el('p', { textContent: t }));
    const volver = el('button', { className: 'btn ghost', textContent: 'Volver a las lecciones' });
    volver.onclick = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); listar(); $('#main').focus(); };
    const play = el('button', { className: 'btn', textContent: 'Escuchar lección' });
    play.onclick = () => leer(l.texto, ps);
    const stop = el('button', { className: 'btn ghost', textContent: 'Detener voz' });
    stop.onclick = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };

    const form = el('form');
    l.quiz.forEach((q, i) => {
        const fs = el('fieldset', {}, el('legend', { textContent: q.p }));
        q.o.forEach((o, j) => fs.append(el('label', {}, el('input', { type: 'radio', name: 'q' + i, value: j }), ' ' + o)));
        form.append(fs);
    });
    const res = el('p', { className: 'res', role: 'status' });
    form.append(el('button', { className: 'btn', type: 'submit', textContent: 'Comprobar respuestas' }), res);
    form.onsubmit = e => {
        e.preventDefault();
        const d = new FormData(form);
        const ok = l.quiz.filter((q, i) => d.get('q' + i) !== null && +d.get('q' + i) === q.c).length;
        prog[l.id] = Math.max(ok, prog[l.id] ?? 0); save('prog', prog);
        res.textContent = ok === l.quiz.length ? `¡Perfecto! ${ok} de ${l.quiz.length} correctas.` : `Acertaste ${ok} de ${l.quiz.length}. Relee la lección e inténtalo de nuevo.`;
    };
    sec.append(el('h2', { textContent: l.titulo, tabIndex: -1, id: 'titulo' }), el('div', { className: 'row' }, play, stop), ...ps, el('h3', { textContent: 'Comprueba lo aprendido' }), form, volver);
    $('#titulo').focus();
}

aplicar();
fetch('data/lecciones.json').then(r => r.json()).then(d => { lecciones = d; listar(); })
    .catch(() => $('#progreso').textContent = 'No se pudieron cargar las lecciones. Abre el sitio con un servidor local (Live Server) o GitHub Pages.');
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });