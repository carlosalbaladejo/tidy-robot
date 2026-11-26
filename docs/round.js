import { rooms } from './rooms.js';

const radius = .36;
const reach = 1.48;

export function makeRound(index) {
    const layout = rooms[index];
    const bins = layout.bins.map(([kind, x, z, color], index) => ({ kind, x, z, color, index }));
    const items = layout.items.map(([kind, x, z, color], index) =>
        ({ kind, x, z, color, index, state: 'floor', bin: null }));
    const obstacles = [...layout.areas, ...bins.map(bin => ({ ...bin, w: 1.55, d: 1.05 }))];
    return {
        index, bins, items, obstacles, x: 0, z: 3.16, heading: 0, speed: 0, turn: 0,
        stride: 0, carried: null, elapsed: 0, started: false, splash: 0, inWater: false,
    };
}

function collides(state, x, z) {
    if (Math.abs(x) > 4.88 - radius || Math.abs(z) > 4.88 - radius) return true;
    return state.obstacles.some(obstacle => {
        const dx = Math.max(0, Math.abs(x - obstacle.x) - obstacle.w / 2);
        const dz = Math.max(0, Math.abs(z - obstacle.z) - obstacle.d / 2);
        return dx * dx + dz * dz < radius * radius;
    });
}

function approachable(state, target) {
    // Keep reach from crossing the side of a table or other solid furniture.
    return !rooms[state.index].areas.some(area => {
        for (const fraction of [.25, .5, .75]) {
            const x = state.x + (target.x - state.x) * fraction;
            const z = state.z + (target.z - state.z) * fraction;
            if (Math.abs(x - area.x) < area.w / 2 && Math.abs(z - area.z) < area.d / 2) return true;
        }
        return false;
    });
}

export function nearestBin(state) {
    return state.bins.filter(bin => {
        const dx = Math.max(0, Math.abs(bin.x - state.x) - .44);
        const dz = Math.max(0, Math.abs(bin.z - state.z) - .16);
        return Math.hypot(dx, dz) < reach && approachable(state, bin);
    }).sort((a, b) => distance(state, a) - distance(state, b))[0] || null;
}

function distance(state, target) {
    return Math.hypot(target.x - state.x, target.z - state.z);
}

export function targetFor(state) {
    const bin = nearestBin(state);
    if (state.carried) {
        return bin ? { ...bin, kind: 'bin', symbol: bin.kind, action: 'drop' } : null;
    }
    const item = state.items.filter(item => item.state === 'floor' &&
        distance(state, item) < reach && approachable(state, item))
        .sort((a, b) => distance(state, a) - distance(state, b))[0];
    if (item) return { ...item, symbol: item.kind, action: 'pick' };
    if (!bin) return null;
    const stored = state.items.filter(item => item.bin === bin.index);
    const selected = stored.find(item => item.kind !== bin.kind) || stored[stored.length - 1];
    return selected ? { ...bin, kind: 'bin', symbol: selected.kind, item: selected.index, action: 'pick' } : null;
}

export function pick(state) {
    if (state.carried) return null;
    const target = targetFor(state);
    if (!target) return null;
    const item = state.items[target.item ?? target.index];
    item.state = 'carried';
    item.bin = null;
    state.carried = item;
    state.started = true;
    return item;
}

export function drop(state) {
    if (!state.carried) return null;
    const item = state.carried;
    const bin = nearestBin(state);
    item.x = state.x;
    item.z = state.z;
    item.state = bin ? 'stored' : 'floor';
    item.bin = bin?.index ?? null;
    state.carried = null;
    return { item, bin };
}

export function result(state, timed) {
    if (state.items.some(item => item.state !== 'stored')) return null;
    const wrong = state.items.find(item => item.kind !== state.bins[item.bin].kind);
    if (wrong) return { type: 'wrong', item: wrong, bin: state.bins[wrong.bin] };
    return { type: timed && state.elapsed > rooms[state.index].limit ? 'late' : 'happy' };
}

export function step(state, actions, dt) {
    const walking = Number(actions.has('forward')) - Number(actions.has('back'));
    const turning = Number(actions.has('right')) - Number(actions.has('left'));
    if (walking || turning) state.started = true;
    if (state.started) state.elapsed += dt;

    state.speed += (walking * (walking < 0 ? 1.6 : 2.25) - state.speed) * (1 - Math.exp(-dt * 16));
    state.turn += (turning * 2.15 - state.turn) * (1 - Math.exp(-dt * 18));
    state.heading += state.turn * dt;
    const oldX = state.x, oldZ = state.z;
    const x = oldX + Math.sin(state.heading) * state.speed * dt;
    const z = oldZ - Math.cos(state.heading) * state.speed * dt;
    if (!collides(state, x, oldZ)) state.x = x;
    if (!collides(state, state.x, z)) state.z = z;
    const travel = Math.hypot(state.x - oldX, state.z - oldZ);
    state.stride += travel * 10;
    state.splash = Math.max(0, state.splash - dt * 1.45);
    const puddle = rooms[state.index].puddle;
    const inWater = Boolean(puddle && Math.hypot(state.x - puddle[0], (state.z - puddle[1]) / .72) < puddle[2]);
    const splashed = inWater && !state.inWater && travel > 0;
    if (splashed) state.splash = 1;
    state.inWater = inWater;
    return { travel, splashed };
}
