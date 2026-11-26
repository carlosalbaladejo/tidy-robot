// Coordinates are measured from the centre of the room, with +z toward its entrance.
export const symbols = {
    bear: ['🧸', 'peluche'], blocks: ['🧱', 'bloque'], fruit: ['🍎', 'fruta'],
    cups: ['☕', 'tacita'], ducks: ['🐤', 'patito'], towels: ['🧺', 'toalla'],
    balls: ['⚽', 'pelota'], sand: ['🪣', 'juguete de arena'],
};
export const rooms = [
    {
        name: 'Dormitorio', icon: '🛏️', limit: 70, wall: 0xeeb2a3, floor: [0xecc392, 0xe8bb88],
        areas: [
            { kind: 'bed', x: -3.75, z: -.45, w: 2.05, d: 3.25 },
            { kind: 'shelf', x: 3.85, z: -.75, w: 1.65, d: 2.65 },
        ],
        rug: [-.1, -.1, 5.25, 5.9, 0x8dc8ba],
        bins: [['bear', -2.65, -3.45, 0xe49b85], ['blocks', 2.1, -3.45, 0xeabb62]],
        items: [['bear', .68, 1.60, 0xb46d43], ['blocks', -1.65, -.35, 0xc66255], ['blocks', 1.55, .15, 0x677da8]],
    },
    {
        name: 'Cocina', icon: '🍎', limit: 90, wall: 0xf5d395, floor: [0xf4dfb7, 0xe5c59f],
        areas: [
            { kind: 'counter', x: -3.8, z: -1, w: 1.65, d: 3.9 },
            { kind: 'fridge', x: 3.85, z: -2.2, w: 1.65, d: 1.55 },
            { kind: 'table', x: 3.35, z: 1.5, w: 1.95, d: 2.1 },
        ],
        rug: [0, 1.55, 2.4, 1.1, 0xbe755c],
        bins: [['fruit', -1.9, -3.5, 0xc58463], ['cups', 1.45, -3.5, 0x81b2a2]],
        items: [['fruit', .2, 2.35, 0xdb5850], ['cups', -.85, .45, 0x5496ab], ['fruit', 1.75, -.5, 0xe3ac45], ['cups', -.9, -1.55, 0xc86579]],
    },
    {
        name: 'Baño', icon: '🛁', limit: 100, wall: 0xa5d9db, floor: [0xaac9cc, 0xc2ddd7],
        areas: [
            { kind: 'tub', x: -3.8, z: -.75, w: 1.65, d: 3.55 },
            { kind: 'sink', x: 3.8, z: -1.6, w: 1.65, d: 1.35 },
        ],
        rug: [2.8, 1.35, 2, 1.3, 0xe8a77e],
        puddle: [0, -.55, 1.2],
        bins: [['ducks', -2.15, -3.55, 0x6d9ab5], ['towels', 1.95, -3.55, 0xd8a57f]],
        items: [['ducks', -.72, 1.95, 0xeabb52], ['towels', 2.25, 1, 0xe49580], ['ducks', -1.72, -.45, 0xebc768], ['towels', .8, -1.6, 0x738fb2]],
    },
    {
        name: 'Jardín', icon: '🌻', limit: 125, wall: 0xc9a57b, floor: [0xc0cc8d, 0xb6c786],
        areas: [
            { kind: 'planter', x: -3.95, z: -.7, w: 1.4, d: 3.2 },
            { kind: 'planter', x: 3.9, z: -1.8, w: 1.45, d: 2.4 },
        ],
        rug: [.15, .8, 2.5, 4.2, 0xd6bd8e],
        puddle: [2.25, .9, .95],
        bins: [['balls', -2.05, -3.55, 0x9ba986], ['sand', 1.95, -3.55, 0xdeaf69]],
        items: [['balls', -.05, 2.05, 0xe0e8cd], ['sand', -2.25, 1.4, 0x6fa5b3], ['balls', 2.55, .05, 0xe48765], ['sand', -1.05, -1.28, 0xdebf55], ['balls', .88, -1.72, 0x718db5]],
    },
];
