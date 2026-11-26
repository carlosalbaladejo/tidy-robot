import { rooms, symbols } from './rooms.js';
import { makeRound, step, targetFor, pick, drop, result } from './round.js';
import { createScene } from './scene.js';
import { drawMother } from './portrait.js';
import { makeSound } from './sound.js';

const byId = id => document.getElementById(id);
const ui = Object.fromEntries(['game', 'world', 'hud', 'room-name', 'progress', 'clock', 'target', 'target-button',
    'target-icon', 'carrying', 'notice', 'sound', 'settings', 'panel', 'touch'].map(id => [id, byId(id)]));
const sound = makeSound();
const keymap = new Map([
    ['ArrowUp', 'forward'], ['ArrowDown', 'back'], ['ArrowLeft', 'left'], ['ArrowRight', 'right'],
    ['KeyW', 'forward'], ['KeyS', 'back'], ['KeyA', 'left'], ['KeyD', 'right'],
    ['KeyX', 'pick'], ['Enter', 'pick'], ['NumpadEnter', 'pick'], ['Space', 'pick'], ['KeyZ', 'drop'], ['KeyC', 'drop'],
    ['KeyV', 'menu'], ['ShiftRight', 'menu'], ['Escape', 'pause'], ['KeyP', 'pause'],
]);
const padMap = new Map([[0, 'pick'], [2, 'drop'], [8, 'menu'], [9, 'pause'], [12, 'forward'],
    [13, 'back'], [14, 'left'], [15, 'right']]);
const validActions = new Set(padMap.values());
const keys = new Set();
const pointers = new Map();
let host = null;
let gamepad = new Set();
let actions = new Set();
let scene;
let mode = 'rooms';
let previousMode = 'rooms';
let selected = 0;
let roomIndex = 0;
let timed = false;
try { timed = localStorage.getItem('robot-errands.timed') === 'yes'; } catch {}
let round = makeRound(roomIndex);
let outcome = null;
let displayAfter = 0;
let noticeUntil = 0;
let correctedAt = null;
let lastFrame = 0;
let stateAge = 0;
let animation = { time: 0, walk: 0, celebrate: 0 };
let refreshFrame = true;
let pendingCue = '';
let resultCuePending = false;

function unlockSound() {
    if (sound.active) return;
    sound.unlock().then(active => {
        if (!active) return;
        ui.sound.hidden = true;
        if (pendingCue && mode === 'result') sound.play(pendingCue);
        pendingCue = '';
    });
}
function playCue(name) {
    if (!sound.play(name) && ['wrong', 'late', 'happy'].includes(name)) pendingCue = name;
}
function select(index) {
    const choices = Array.from(ui.panel.querySelectorAll('button[data-choice]'));
    if (!choices.length) return;
    selected = (index + choices.length) % choices.length;
    choices.forEach((button, i) => button.classList.toggle('selected', i === selected));
    const focused = document.activeElement;
    if (focused && choices.includes(focused)) choices[selected].focus({ preventScroll: true });
}

function setMode(next) {
    mode = next;
    stateAge = 0;
    selected = 0;
    ui.game.dataset.screen = mode;
    ui.hud.hidden = mode === 'rooms';
    ui.touch.hidden = mode !== 'play' || host !== null;
    ui.settings.hidden = host !== null || !['rooms', 'play', 'result'].includes(mode);
    ui.target.hidden = true;
    ui.carrying.hidden = true;
    ui.notice.textContent = '';
    refreshFrame = true;
    renderPanel();
}
function start(index) {
    roomIndex = index;
    round = makeRound(index);
    outcome = null;
    correctedAt = null;
    pendingCue = '';
    animation = { time: 0, walk: 0, celebrate: 0 };
    scene.load(rooms[index], round);
    setMode('play');
    playCue('confirm');
    showNotice('Guarda cada cosa en su sitio', 2.65);
}
function showRooms() {
    round = makeRound(roomIndex);
    scene.load(rooms[roomIndex], round);
    setMode('rooms');
    select(roomIndex);
}
function showNotice(message, seconds = 1.35) {
    ui.notice.textContent = message;
    noticeUntil = animation.time + seconds;
}
function renderPanel() {
    let markup = '';
    if (mode === 'rooms') {
        markup = `<div class="card start"><h1>Tidy Robot</h1>
            <p>¡Cada juguete a su sitio!</p>
            <div class="rooms">${rooms.map((room, i) => `<button data-choice="room:${i}"><span>${room.icon}</span>${room.name}</button>`).join('')}</div>
            <p class="hints">Cruceta · <kbd>×</kbd> Coger · <kbd>□</kbd> Soltar · Select: reloj</p></div>`;
    } else if (mode === 'settings') {
        markup = `<div class="card"><h2>⌛ Contrarreloj</h2>
            <div class="action-list"><button data-choice="timed">Contrarreloj: ${timed ? 'Sí' : 'No'}</button>
            <button data-choice="close">Volver</button></div></div>`;
    } else if (mode === 'pause') {
        markup = `<div class="card"><h2>Pausa</h2><div class="action-list">
            <button data-choice="close">Seguir</button><button data-choice="retry">Repetir</button>
            <button data-choice="rooms">Habitaciones</button></div></div>`;
    } else if (mode === 'result' && displayAfter <= 0) {
        const wrong = outcome.type === 'wrong';
        const happy = outcome.type === 'happy';
        const final = roomIndex === rooms.length - 1;
        const title = wrong ? '¡Eso va en otro sitio!' : happy ? '¡Todo en su sitio!' : '¡Se acabó el tiempo!';
        const icon = wrong ? symbols[outcome.item.kind][0] : '⌛';
        const text = wrong ? `${icon} Mira dónde quedó y cámbialo de sitio.`
            : happy ? '¡Mamá está contenta!' : 'Todo bien guardado, pero un poquito tarde.';
        const primary = wrong ? 'Arreglar' : final ? 'Habitaciones' : 'Siguiente';
        markup = `<div class="card result ${outcome.type}">
            <canvas id="mother" role="img" aria-label="${wrong ? 'Mamá señalando el objeto' : happy ? 'Mamá contenta' : 'Mamá señalando el reloj'}" width="270" height="270"></canvas>
            <div><h2>${title}</h2><p>${text}</p>
            <div class="action-list"><button data-choice="${wrong ? 'fix' : final ? 'rooms' : 'next'}"><kbd>×</kbd> ${primary}</button>
            ${wrong ? '' : '<button data-choice="retry"><kbd>□</kbd> Repetir</button>'}</div></div></div>`;
    }
    ui.panel.innerHTML = markup;
    const portrait = byId('mother');
    if (portrait) drawMother(portrait, outcome.type);
    if (markup) select(selected);
}
function openMenu(next) {
    previousMode = mode;
    setMode(next);
}
function closeMenu() {
    if (mode === 'settings' || mode === 'pause') setMode(previousMode);
}
function choose(choice) {
    if (choice.startsWith('room:')) start(Number(choice.slice(5)));
    else if (choice === 'close') closeMenu();
    else if (choice === 'rooms') showRooms();
    else if (choice === 'retry') start(roomIndex);
    else if (choice === 'next') start(roomIndex + 1);
    else if (choice === 'timed') {
        timed = !timed;
        try { localStorage.setItem('robot-errands.timed', timed ? 'yes' : 'no'); } catch {}
        playCue('confirm');
        renderPanel();
    } else if (choice === 'fix') {
        correctedAt = outcome.bin.index;
        outcome = null;
        pendingCue = '';
        setMode('play');
        showNotice('Coge el juguete equivocado', 2.5);
    }
}
function finishIfReady() {
    outcome = result(round, timed);
    if (!outcome) return;
    round.speed = round.turn = 0;
    animation.celebrate = outcome.type === 'happy' ? .001 : 0;
    displayAfter = .48;
    resultCuePending = true;
    setMode('result');
}
function press(action) {
    if (action === 'menu') {
        if (mode === 'settings') closeMenu();
        else if (['rooms', 'play', 'result'].includes(mode) && displayAfter <= 0) openMenu('settings');
        return;
    }
    if (action === 'pause') {
        if (mode === 'pause' || mode === 'settings') closeMenu();
        else if (mode === 'play') openMenu('pause');
        return;
    }
    if (mode !== 'play') {
        if (mode === 'result' && displayAfter > 0) return;
        if (action === 'left' || action === 'forward') select(selected - 1);
        if (action === 'right' || action === 'back') select(selected + 1);
        if (action === 'pick') {
            const button = ui.panel.querySelector('button.selected');
            if (button) choose(button.dataset.choice);
        }
        if (action === 'drop') {
            if (mode === 'settings' || mode === 'pause') closeMenu();
            else if (mode === 'result' && outcome.type !== 'wrong') choose('retry');
        }
        return;
    }
    if (action === 'pick') {
        const taken = pick(round);
        if (taken) {
            correctedAt = null;
            playCue('pick');
        } else if (!round.carried) playCue('empty');
    } else if (action === 'drop') {
        const placed = drop(round);
        if (placed) {
            playCue(placed.bin ? 'place' : 'drop');
            finishIfReady();
        }
    }
}
function syncInput() {
    const next = new Set([...keys, ...pointers.values(), ...(host ?? gamepad)]);
    const previous = actions;
    actions = next;
    for (const action of next) if (!previous.has(action)) press(action);
}
function clearInput() {
    keys.clear();
    pointers.clear();
    gamepad.clear();
    host?.clear();
    actions.clear();
    round.speed = round.turn = 0;
}
function readGamepad() {
    if (host !== null || !document.hasFocus()) return;
    const pad = Array.from(navigator.getGamepads?.() || []).find(candidate => candidate?.mapping === 'standard');
    const next = new Set();
    if (pad) for (const [index, action] of padMap) if (pad.buttons[index]?.pressed) next.add(action);
    if (next.size === gamepad.size && [...next].every(action => gamepad.has(action))) return;
    gamepad = next;
    if (next.size) unlockSound();
    syncInput();
}
window.addEventListener('message', ({ data, source }) => {
    if (source && source !== window && source !== window.parent) return;
    if (typeof data !== 'string') return;
    let message;
    try { message = JSON.parse(data); } catch { return; }
    if (message?.type !== 'tv-game-input' || message.version !== 1 || !Array.isArray(message.pressed)) return;
    if (host === null) {
        keys.clear();
        ui.game.classList.add('hosted');
        pointers.clear();
        gamepad.clear();
        ui.touch.hidden = true;
        ui.settings.hidden = true;
    }
    host = new Set(message.pressed.filter(action => validActions.has(action)));
    if (host.size) unlockSound();
    syncInput();
});
window.addEventListener('keydown', event => {
    const action = keymap.get(event.code);
    if (!action || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    if (event.repeat || host !== null) return;
    unlockSound();
    keys.add(action);
    syncInput();
});
window.addEventListener('keyup', event => {
    const action = keymap.get(event.code);
    if (!action) return;
    keys.delete(action);
    syncInput();
});
window.addEventListener('blur', clearInput);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    clearInput();
    lastFrame = 0;
    if (mode === 'play') openMenu('pause');
});
for (const button of ui.touch.querySelectorAll('button')) {
    button.addEventListener('pointerdown', event => {
        if (event.button !== 0 || host !== null) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        unlockSound();
        pointers.set(event.pointerId, button.dataset.action);
        syncInput();
    });
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        button.addEventListener(eventName, event => {
            pointers.delete(event.pointerId);
            syncInput();
        });
    }
}
ui.panel.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]')?.dataset.choice;
    if (!choice) return;
    unlockSound();
    choose(choice);
});
ui.settings.addEventListener('click', () => { unlockSound(); press('menu'); });
ui.sound.addEventListener('click', () => {
    unlockSound();
    sound.unlock().then(ready => { if (ready && !pendingCue) playCue('confirm'); });
});

ui.clock.innerHTML = '<span></span><div class="clock-bar"><i></i></div>';
const timeText = ui.clock.querySelector('span');
const timeBar = ui.clock.querySelector('i');
function show(element, visible) {
    if (element.hidden === visible) element.hidden = !visible;
}
function renderHud() {
    const layout = rooms[roomIndex];
    const stored = round.items.filter(item => item.state === 'stored').length;
    const name = `${layout.icon} ${layout.name}`;
    const counter = `${stored}/${round.items.length}`;
    if (ui['room-name'].textContent !== name) ui['room-name'].textContent = name;
    if (ui.progress.textContent !== counter) ui.progress.textContent = counter;
    show(ui.clock, timed);
    if (timed) {
        const remaining = Math.max(0, layout.limit - round.elapsed);
        const seconds = Math.ceil(remaining);
        const stamp = `⌛ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        if (timeText.textContent !== stamp || timeBar.dataset.room !== String(roomIndex)) {
            timeText.textContent = stamp;
            timeBar.style.width = `${100 * seconds / layout.limit}%`;
            timeBar.dataset.room = roomIndex;
        }
        ui.clock.classList.toggle('warn', remaining <= 15);
        ui.clock.classList.toggle('over', round.elapsed > layout.limit);
    }
    show(ui.carrying, mode === 'play' && Boolean(round.carried));
    if (!ui.carrying.hidden) {
        const carry = `${symbols[round.carried.kind][0]} □`;
        if (ui.carrying.textContent !== carry) ui.carrying.textContent = carry;
    }
}
function renderMarker(target, position) {
    show(ui.target, Boolean(position));
    if (!position) return;
    const left = `${Math.round(position[0])}px`;
    const top = `${Math.round(position[1])}px`;
    const button = target.action === 'pick' ? '×' : '□';
    const icon = symbols[target.symbol][0];
    if (ui.target.style.left !== left) ui.target.style.left = left;
    if (ui.target.style.top !== top) ui.target.style.top = top;
    if (ui['target-button'].textContent !== button) ui['target-button'].textContent = button;
    if (ui['target-icon'].textContent !== icon) ui['target-icon'].textContent = icon;
}
function frame(stamp) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    readGamepad();
    const realDt = lastFrame ? Math.max(0, (stamp - lastFrame) / 1000) : 0;
    const dt = Math.min(realDt, .05);
    lastFrame = stamp;
    stateAge += dt;
    if (mode === 'play') {
        const started = round.started;
        const { travel, splashed } = step(round, actions, dt);
        if (started && realDt > dt) round.elapsed += realDt - dt;
        if (splashed) playCue('splash');
        animation.time += dt;
        animation.walk += (Math.min(1, travel / Math.max(dt * 1.3, .001)) - animation.walk) * Math.min(1, dt * 14);
        if (noticeUntil <= animation.time && ui.notice.textContent) ui.notice.textContent = '';
    } else if (mode === 'result') {
        animation.time += dt;
        if (animation.celebrate) animation.celebrate += dt;
        if (displayAfter > 0) {
            displayAfter -= dt;
            if (resultCuePending && displayAfter <= .30) {
                playCue(outcome.type);
                resultCuePending = false;
            }
            if (displayAfter <= 0) renderPanel();
        }
    }
    const idlePanel = mode === 'settings' || mode === 'pause' ||
        (mode === 'rooms' && stateAge > .65) || (mode === 'result' && stateAge > 2.35);
    if (!idlePanel || refreshFrame) {
        const target = mode === 'play' ? targetFor(round) : null;
        const focus = mode === 'result' && outcome?.type === 'wrong' ? outcome.bin : null;
        const ring = focus || (correctedAt !== null ? round.bins[correctedAt] : null);
        const position = scene.draw(round, target || (ring && { ...ring, kind: 'bin' }), animation, dt,
            mode === 'rooms' || (mode === 'settings' && previousMode === 'rooms'), focus && { ...focus, kind: 'bin' });
        renderMarker(target, target && position);
        renderHud();
        refreshFrame = false;
    }
}

try {
    scene = createScene(ui.world);
    ui.sound.hidden = false;
    showRooms();
    ui.game.dataset.ready = 'true';
    window.addEventListener('resize', () => { refreshFrame = true; });
    requestAnimationFrame(frame);
} catch (error) {
    console.error(error);
    ui.panel.innerHTML = '<div class="card"><h1>Tidy Robot</h1><p>Esta pantalla no ha podido iniciar los gráficos 3D. Prueba a abrir el juego en Link Arcade o en otro navegador.</p></div>';
}
