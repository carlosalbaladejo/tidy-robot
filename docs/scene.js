import * as T from './vendor/three.module.min.js';
import { symbols } from './rooms.js';

const INK = 0x45372d;
const material = new Map();
const cube = new T.BoxGeometry();
const sphere = new T.SphereGeometry(1, 16, 12);
const cylinder = new T.CylinderGeometry(1, 1, 1, 24);
const torus = new T.TorusGeometry(1, .13, 10, 28);
const textureCache = new Map();

function paint(color) {
    if (!material.has(color)) material.set(color, new T.MeshLambertMaterial({ color }));
    return material.get(color);
}
function shape(parent, geometry, x, y, z, w, h, d, color) {
    const mesh = new T.Mesh(geometry, paint(color));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
}
const box = (p, x, y, z, w, h, d, c) => shape(p, cube, x, y, z, w, h, d, c);
const ball = (p, x, y, z, w, h, d, c) => shape(p, sphere, x, y, z, w, h, d, c);
const tube = (p, x, y, z, w, h, d, c) => shape(p, cylinder, x, y, z, w, h, d, c);
function group(parent, x = 0, y = 0, z = 0) {
    const node = new T.Group();
    node.position.set(x, y, z);
    parent.add(node);
    return node;
}

function roundedBox(c, inset, size, radius) {
    const end = inset + size;
    c.beginPath();
    c.moveTo(inset + radius, inset);
    c.arcTo(end, inset, end, end, radius);
    c.arcTo(end, end, inset, end, radius);
    c.arcTo(inset, end, inset, inset, radius);
    c.arcTo(inset, inset, end, inset, radius);
    c.closePath();
}

function labelTexture(icon) {
    if (textureCache.has(icon)) return textureCache.get(icon);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const c = canvas.getContext('2d');
    c.fillStyle = '#4a4436';
    roundedBox(c, 3, 122, 29);
    c.fill();
    c.fillStyle = '#ffedbd';
    roundedBox(c, 9, 110, 24);
    c.fill();
    c.font = '72px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(icon, 64, 68);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    textureCache.set(icon, texture);
    return texture;
}
function badge(parent, icon, x, y, z, size) {
    const mesh = new T.Mesh(cube, new T.MeshBasicMaterial({ map: labelTexture(icon) }));
    mesh.position.set(x, y, z);
    mesh.scale.set(size, size, .025);
    parent.add(mesh);
}
function shadow(parent, x, y, z, width, depth, color = 0x857956) {
    return tube(parent, x, y, z, width, .012, depth, color);
}

function toy(parent, item) {
    const { kind, color } = item;
    const p = group(parent);
    switch (kind) {
        case 'bear':
            ball(p, 0, .24, 0, .27, .28, .22, color);
            ball(p, 0, .54, 0, .265, .235, .21, color);
            for (const side of [-1, 1]) {
                ball(p, side * .20, .71, 0, .105, .11, .087, color);
                ball(p, side * .20, .71, .065, .058, .065, .033, 0xe6a985);
                ball(p, side * .095, .58, .185, .035, .038, .028, INK);
                ball(p, side * .25, .27, 0, .105, .14, .1, color);
                ball(p, side * .14, .095, .095, .12, .1, .15, color);
            }
            ball(p, 0, .48, .18, .123, .085, .065, 0xf1c28a);
            ball(p, 0, .52, .233, .046, .034, .027, INK);
            break;
        case 'blocks':
            box(p, 0, .21, 0, .43, .42, .43, color);
            box(p, 0, .218, .22, .28, .26, .024, 0xf5d799);
            box(p, 0, .218, .236, .125, .125, .025, color).rotation.z = Math.PI / 4;
            for (const x of [-.115, .115]) for (const z of [-.115, .115]) tube(p, x, .451, z, .064, .063, .064, color);
            break;
        case 'fruit':
            ball(p, 0, .23, 0, .236, .22, .218, color);
            ball(p, -.105, .27, .075, .075, .11, .07, color === 0xdb5850 ? 0xf78767 : 0xf8d378);
            box(p, 0, .446, 0, .041, .115, .038, INK).rotation.z = -.21;
            ball(p, .091, .483, 0, .113, .035, .056, 0x608355).rotation.z = .31;
            break;
        case 'cups': {
            tube(p, 0, .168, 0, .178, .32, .178, color);
            const lip = shape(p, torus, 0, .326, 0, .157, .157, .145, 0xf6e5c2);
            lip.rotation.x = Math.PI / 2;
            tube(p, 0, .339, 0, .137, .009, .137, INK);
            shape(p, torus, .186, .185, 0, .103, .115, .1, color);
            break;
        }
        case 'ducks':
            ball(p, 0, .155, 0, .29, .15, .205, color);
            ball(p, .125, .329, 0, .161, .15, .142, color);
            ball(p, .252, .295, 0, .116, .044, .095, 0xdc8045);
            for (const z of [-.115, .115]) ball(p, .168, .363, z, .027, .035, .024, INK);
            break;
        case 'towels':
            box(p, 0, .116, 0, .54, .23, .37, color);
            box(p, 0, .238, 0, .53, .035, .36, color);
            for (const x of [-.14, .14]) box(p, x, .135, .195, .055, .24, .024, 0xf1dfbb);
            break;
        case 'balls':
            ball(p, 0, .266, 0, .26, .26, .26, color);
            for (const [x, y, z] of [[0, .44, .161],[-.195,.235,.125],[.197,.234,.123],[.015,.151,-.215]]) {
                ball(p, x, y, z, .083, .083, .065, INK);
            }
            break;
        case 'sand':
            tube(p, 0, .169, 0, .224, .33, .224, color);
            tube(p, 0, .323, 0, .242, .045, .242, 0xf8db8c);
            tube(p, 0, .349, 0, .182, .012, .182, INK);
            shape(p, torus, 0, .345, 0, .223, .177, .12, 0xf0b160);
            break;
    }
    return p;
}

function mascot(parent) {
    const p = group(parent);
    const body = group(p);
    const legs = [];
    const arms = [];
    for (const side of [-1, 1]) {
        const leg = group(body, side * .23, .36, 0);
        box(leg, 0, -.12, 0, .18, .25, .17, 0x47696a);
        box(leg, 0, -.29, -.08, .28, .14, .42, INK);
        box(leg, 0, -.24, -.11, .26, .11, .39, 0xe3a94d);
        legs.push(leg);
    }
    box(body, 0, .66, 0, .76, .6, .52, INK);
    box(body, 0, .68, 0, .72, .57, .54, 0x367f7b);
    box(body, 0, .7, .287, .52, .39, .06, 0x66b3a3);
    box(body, 0, .7, .328, .32, .15, .023, 0x325a5b);
    for (let i = -1; i <= 1; i++) ball(body, i * .087, .72, .346, .025, .025, .02, 0xffce64);
    for (const side of [-1, 1]) {
        const arm = group(body, side * .415, .77, 0);
        ball(arm, 0, 0, 0, .131, .127, .126, 0xf8bc59);
        box(arm, 0, -.172, 0, .145, .25, .151, 0x4b7270);
        ball(arm, 0, -.307, 0, .108, .098, .106, 0xf6c364);
        arms.push(arm);
    }
    box(body, 0, 1.147, 0, .8, .39, .55, INK);
    box(body, 0, 1.16, 0, .75, .372, .56, 0xe6a451);
    box(body, 0, 1.158, -.288, .63, .265, .035, 0x253e3b);
    for (const side of [-1, 1]) {
        ball(body, side * .145, 1.18, -.318, .055, .062, .021, 0xffeeae);
        tube(body, side * .394, 1.16, 0, .115, .093, .115, 0x526a64).rotation.z = Math.PI / 2;
    }
    box(body, 0, 1.09, -.315, .105, .027, .025, 0xd9ba88);
    box(body, -.16, 1.46, 0, .042, .234, .043, INK).rotation.z = .16;
    const light = ball(body, -.178, 1.584, 0, .081, .081, .081, 0xec755c);
    return { p, body, legs, arms, light };
}

function furniture(parent, { kind, x, z, w, d }) {
    const p = group(parent, x, 0, z);
    const wood = 0x9c694f;
    shadow(p, 0, .022, 0, w * .54, d * .53);
    switch (kind) {
        case 'bed':
            box(p, 0, .28, 0, w, .46, d, wood);
            box(p, 0, .546, 0, w * .94, .19, d * .955, 0xf8e2be);
            box(p, 0, .641, .41, w * .945, .089, d * .67, 0xae7d95);
            box(p, 0, .695, -.51, w * .94, .055, .16, 0xe3a7aa);
            box(p, 0, .65, -d * .48, w, 1.2, .16, wood);
            for (const side of [-1, 1]) box(p, side * .45, .702, -1.03, .69, .16, .58, 0xf6d4af);
            break;
        case 'shelf':
            box(p, 0, .44, 0, w, .84, d, 0x856e59);
            box(p, 0, .888, 0, w * 1.02, .1, d * 1.02, 0xcd9366);
            for (let i = 0; i < 6; i++) box(p, -.31, .99 + (i % 2) * .024, -.86 + i * .23, .41, .2, .145, [0x93aca0, 0xd4a15a, 0xce8172][i % 3]);
            ball(p, .25, 1.08, .74, .24, .23, .22, 0xb77e68);
            for (let i = 0; i < 5; i++) ball(p, .25 + Math.sin(i * 3) * .21, 1.35 + (i % 3) * .035, .74 + Math.cos(i * 3) * .2, .12, .24, .1, 0x608b69);
            break;
        case 'counter':
            box(p, 0, .49, 0, w, .95, d, 0x87ac95);
            box(p, 0, .99, 0, w * 1.04, .13, d, 0xf6e6c1);
            for (let i = -1; i <= 1; i++) {
                box(p, w * .513, .53, i * 1.25, .05, .48, .98, 0x688b78);
                box(p, w * .552, .662, i * 1.25, .08, .05, .22, INK);
            }
            box(p, 0, 1.08, -.87, 1.05, .045, 1.27, 0x625751);
            for (const dz of [-.24, .24]) tube(p, 0, 1.116, -.87 + dz, .18, .025, .18, 0xb98d6e);
            break;
        case 'fridge':
            box(p, 0, .83, 0, w, 1.65, d, 0x97b6a5);
            box(p, -.04, 1.03, d * .51, w * .96, 1.03, .09, 0xc9dacc);
            box(p, -.04, .26, d * .51, w * .96, .43, .09, 0xbdccbd);
            box(p, -.54, .89, d * .56, .09, .29, .06, INK);
            badge(p, '🌈', .27, 1.25, d * .55, .28);
            break;
        case 'table':
            for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(p, sx * .73, .4, sz * .81, .18, .76, .18, wood);
            box(p, 0, .81, 0, w, .17, d, 0x9d6f4b);
            box(p, 0, .92, 0, w * .99, .095, d, 0xd9a574);
            box(p, 0, .973, 0, .58, .025, d * .99, 0xe1ad79);
            tube(p, 0, 1.002, 0, .28, .07, .28, 0x86a394);
            break;
        case 'tub':
            box(p, 0, .37, 0, w, .69, d, 0xa4b9bb);
            box(p, 0, .71, 0, w, .12, d, 0xefe6cc);
            box(p, 0, .785, 0, w * .73, .035, d * .82, 0x81bcc6);
            tube(p, 0, .9, -d * .43, .06, .31, .06, 0x647f7b);
            box(p, 0, 1.02, -d * .38, .12, .092, .34, 0x647f7b);
            break;
        case 'sink':
            box(p, 0, .48, 0, w * .91, .91, d * .87, 0x7f9f9e);
            box(p, 0, 1.02, 0, w, .19, d, 0xf1edd4);
            ball(p, 0, 1.119, 0, .52, .031, .37, 0xb6d0d1);
            tube(p, 0, 1.245, -.47, .06, .27, .06, 0x5c7f80);
            break;
        case 'planter':
            box(p, 0, .24, 0, w, .46, d, 0xb27e61);
            box(p, 0, .48, 0, w * .92, .05, d * .96, 0x74523b);
            for (let i = 0; i < 6; i++) {
                const fx = i % 2 === 0 ? -.32 : .29;
                const fz = (i / 5 - .5) * d * .83;
                const height = .34 + .12 * (i % 3);
                ball(p, fx, .52 + height * .43, fz, .32, height * .7, .3, i % 2 ? 0x769a55 : 0x568357);
                ball(p, fx, .56 + height, fz, .175, .156, .17, [0xeabb62, 0xdc8372, 0xdca954][i % 3]);
                ball(p, fx + .025, .64 + height, fz + .04, .077, .081, .076, 0xf5d88f);
            }
            break;
    }
}

function storage(parent, bin) {
    const p = group(parent, bin.x, 0, bin.z);
    const dark = new T.Color(bin.color).multiplyScalar(.60).getHex();
    shadow(p, 0, .019, 0, .96, .68);
    box(p, 0, .12, 0, 1.45, .22, .98, dark);
    box(p, 0, .284, 0, 1.34, .123, .85, dark);
    box(p, 0, .58, -.47, 1.51, .9, .15, bin.color);
    for (const side of [-1, 1]) {
        box(p, .7 * side, .41, 0, .16, .56, .99, bin.color);
        box(p, .7 * side, .706, 0, .195, .055, 1.01, dark);
    }
    box(p, 0, .36, .46, 1.53, .42, .16, bin.color);
    box(p, 0, .585, .47, 1.56, .065, .187, dark);
    badge(p, symbols[bin.kind][0], 0, .91, -.38, .64);
    return p;
}

function wall(parent, side, color, garden) {
    const p = group(parent, side.x, 0, side.z);
    p.rotation.y = side.angle;
    const tall = group(p);
    const h = garden ? 1.58 : 2.85;
    if (garden) {
        for (let x = -side.length / 2 + .24; x < side.length / 2; x += .46) {
            box(tall, x, .83, 0, .365, 1.6 + Math.sin(x * 21) * .075, .155, color);
        }
        for (const y of [.45, 1.16]) box(tall, 0, y, .06, side.length, .117, .12, 0x967152);
    } else {
        box(tall, 0, h / 2, 0, side.length, h, .16, color);
        box(tall, 0, h - .08, .05, side.length, .16, .16, 0xfcdfac);
        box(tall, 0, .83, .08, side.length, .055, .075, 0xf1d5aa);
        for (const x of [-side.length / 3, side.length / 3]) {
            box(tall, x, 1.83, .096, .92, .86, .06, 0xae8163);
            box(tall, x, 1.83, .132, .81, .74, .03, 0xebe0aa);
            badge(tall, x < 0 ? '🌤️' : '🌿', x, 1.83, .16, .53);
        }
    }
    box(p, 0, .09, 0, side.length, .18, .23, garden ? 0x967152 : 0xb98568);
    return { p, tall, ...side };
}
const sides = [
    { x: 0, z: -5, angle: 0, length: 10, component: 'z', sign: -1 },
    { x: -5, z: 0, angle: Math.PI / 2, length: 10, component: 'x', sign: -1 },
    { x: 5, z: 0, angle: -Math.PI / 2, length: 10, component: 'x', sign: 1 },
    { x: 0, z: 5, angle: Math.PI, length: 10, component: 'z', sign: 1 },
];

export function createScene(canvas) {
    const renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    scene.background = new T.Color(0x3f5951);
    scene.add(new T.HemisphereLight(0xffefd3, 0xb19b8a, 2.15));
    const sun = new T.DirectionalLight(0xffe7c4, 1.65);
    sun.position.set(-5, 10, 7);
    scene.add(sun);
    const camera = new T.PerspectiveCamera(53, 1, .12, 70);
    const aim = new T.Vector3();
    const desired = new T.Vector3();
    const markerPos = new T.Vector3();
    let room, walls, player, shadowMesh, pad, items, flights, itemShadows, waves, confetti;
    let rigReady = false;
    let frameWidth = 0, frameHeight = 0;

    function load(layout, state) {
        if (room) {
            room.traverse(node => {
                if (node.material && ![...material.values()].includes(node.material)) node.material.dispose();
            });
            scene.remove(room);
        }
        room = group(scene);
        rigReady = false;
        box(room, 0, -.26, 0, 10.4, .46, 10.4, 0x7f644b);
        for (let x = -4.5; x <= 4.5; x++) for (let z = -4.5; z <= 4.5; z++) {
            box(room, x, -.033, z, .991, .079, .991, layout.floor[(x + z + 9) % 2]);
        }
        walls = sides.map(side => wall(room, side, layout.wall, layout.name === 'Jardín'));
        const [rx, rz, rw, rd, color] = layout.rug;
        box(room, rx, .026, rz, rw, .04, rd, color);
        for (const side of [-1, 1]) {
            box(room, rx + side * rw * .437, .048, rz, .04, .007, rd * .94, 0xf4d4a9);
            box(room, rx, .048, rz + side * rd * .44, rw * .89, .007, .04, 0xf4d4a9);
        }
        layout.areas.forEach(area => furniture(room, area));
        waves = null;
        if (layout.puddle) {
            const [x, z, r] = layout.puddle;
            shadow(room, x, .058, z, r, r * .72, 0x75aeb9);
            shadow(room, x - r * .25, .068, z + r * .08, r * .62, r * .42, 0x99c4c3);
            waves = shape(room, torus, x, .097, z, 1, 1, .18, 0xceebd7);
            waves.rotation.x = -Math.PI / 2;
            waves.visible = false;
        }
        state.bins.forEach(bin => storage(room, bin));
        items = state.items.map(item => toy(room, item));
        flights = items.map(() => ({ state: null, from: new T.Vector3(), age: 1 }));
        itemShadows = state.items.map(() => shadow(room, 0, .063, 0, .29, .24));
        shadowMesh = shadow(room, 0, .064, 0, .54, .42, 0x728276);
        player = mascot(room);
        pad = shape(room, torus, 0, .085, 0, 1, 1, .15, 0xffe085);
        pad.rotation.x = -Math.PI / 2;
        box(room, 0, -.66, 0, 400, .4, 400, 0x586d61);
        confetti = Array.from({ length: 30 }, (_, i) =>
            box(room, 0, 0, 0, .08 + i % 3 * .035, .065, .1, [0xf6cd6e,0xde806e,0x7ab8a7,0xf6e0b6][i % 4]));
    }

    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h || (w === frameWidth && h === frameHeight)) return;
        frameWidth = w;
        frameHeight = h;
        const maxPixels = 960 * 540;
        renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1, Math.sqrt(maxPixels / (w * h))));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = camera.aspect < .9 ? 62 : 53;
        camera.updateProjectionMatrix();
    }

    function draw(state, shownTarget, animation, dt, overview = false, focusBin = null) {
        resize();
        const { x, z, heading, stride, carried, splash, items: list } = state;
        const fx = Math.sin(heading);
        const fz = -Math.cos(heading);
        const sceneTime = animation.time;
        const bob = Math.abs(Math.sin(stride)) * animation.walk * .06;
        player.p.position.set(x, 0, z);
        player.p.rotation.y = -heading;
        player.body.position.y = bob;
        shadowMesh.position.set(x, .064, z);
        player.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(stride + Math.PI * i) * animation.walk * .64; });
        player.arms.forEach((arm, i) => {
            arm.rotation.x = carried ? -.98 : Math.sin(stride + Math.PI * (i + 1)) * animation.walk * .51;
        });
        player.light.scale.setScalar(.081 * (1 + .12 * Math.sin(sceneTime * 3)));
        list.forEach((item, i) => {
            const mesh = items[i];
            const flight = flights[i];
            const s = itemShadows[i];
            if (flight.state !== item.state) {
                flight.from.copy(mesh.position);
                flight.age = flight.state === null ? 1 : 0;
                flight.state = item.state;
            }
            s.visible = item.state === 'floor';
            if (item.state === 'carried') {
                mesh.position.set(x + fx * .53, .63 + bob, z + fz * .53);
                mesh.rotation.y = Math.PI - heading;
            } else if (item.state === 'stored') {
                const rank = list.filter(other => other.index < i && other.bin === item.bin && other.state === 'stored').length;
                const bin = state.bins[item.bin];
                mesh.position.set(bin.x + (rank % 3 - 1) * .4, .36 + Math.floor(rank / 3) * .28, bin.z + .03);
                mesh.rotation.y = .1;
            } else {
                mesh.position.set(item.x, .072, item.z);
                mesh.rotation.y = .18 + i * .28;
                s.position.set(item.x, .063, item.z);
            }
            if (flight.age < .24) {
                flight.age += dt;
                const progress = Math.min(1, flight.age / .24);
                mesh.position.lerp(flight.from, (1 - progress) ** 2);
                if (item.state !== 'carried') mesh.position.y += Math.sin(progress * Math.PI) * .43;
            }
        });

        if (waves) {
            waves.visible = splash > 0;
            waves.scale.setScalar(.35 + (1 - splash) * 1.1);
            waves.scale.z *= .11;
        }
        const effect = animation.celebrate;
        confetti.forEach((piece, i) => {
            piece.visible = effect > 0 && effect < 2.05;
            if (!piece.visible) return;
            const angle = i * 2.399;
            const r = (1 + (i % 4) * .31) * effect;
            piece.position.set(x + Math.cos(angle) * r, Math.max(.06, .78 + (2.2 + i % 5 * .23) * effect - effect * effect * 1.39), z + Math.sin(angle) * r);
            piece.rotation.set(effect * (3 + i % 4), angle, effect * 5);
        });

        const useTarget = focusBin || shownTarget;
        pad.visible = Boolean(useTarget);
        if (useTarget) {
            const pulse = .9 + .08 * Math.sin(sceneTime * 6);
            pad.position.set(useTarget.x, .087, useTarget.z);
            const size = (useTarget.kind === 'bin' ? .94 : .45) * pulse;
            pad.scale.set(size, size, size * .22);
        }

        if (overview) {
            desired.set(7.4, 8.5, 10.6);
            aim.set(-.55, .15, 0);
        } else if (focusBin) {
            desired.set(focusBin.x + .9, 3.8, focusBin.z + 4.1);
            aim.set(focusBin.x + (camera.aspect > 1.2 ? 1.25 : 0), .36, focusBin.z);
        } else {
            const distance = camera.aspect < .9 ? 4.4 : 3.65;
            desired.set(x - fx * distance, 3.32, z - fz * distance);
            aim.set(x + fx * .92, .55, z + fz * .92);
        }
        if (rigReady) camera.position.lerp(desired, 1 - Math.exp(-dt * 13));
        else { camera.position.copy(desired); rigReady = true; }
        camera.lookAt(aim);
        camera.updateMatrixWorld();
        for (const side of walls) {
            const towardCamera = (camera.position[side.component] - side[side.component]) * side.sign;
            side.tall.visible = towardCamera < -.64 && !(overview && side.sign > 0);
        }
        renderer.render(scene, camera);

        if (!shownTarget || !frameWidth) return null;
        markerPos.set(shownTarget.x, shownTarget.kind === 'bin' ? 1.55 : .86, shownTarget.z).project(camera);
        if (markerPos.z >= 1 || Math.abs(markerPos.x) > 1 || Math.abs(markerPos.y) > 1) return null;
        return [(markerPos.x + 1) * .5 * frameWidth, (1 - markerPos.y) * .5 * frameHeight];
    }

    return { load, draw };
}
