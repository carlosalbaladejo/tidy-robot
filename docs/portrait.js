export function drawMother(canvas, mood) {
    const c = canvas.getContext('2d');
    const happy = mood === 'happy';
    const late = mood === 'late';
    const ink = '#51382e';
    const skin = '#ce8865';
    const hair = '#6c4333';
    const blouse = '#51897c';
    c.clearRect(0, 0, 270, 270);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    function fill(color, path, outline = true) {
        c.beginPath();
        path(c);
        c.fillStyle = color;
        c.fill();
        if (outline) {
            c.lineWidth = 3.5;
            c.strokeStyle = ink;
            c.stroke();
        }
    }
    function ellipse(x, y, w, h, color, outline = true) {
        fill(color, p => p.ellipse(x, y, w, h, 0, 0, Math.PI * 2), outline);
    }
    function lines(color, width, path) {
        c.beginPath();
        path(c);
        c.strokeStyle = color;
        c.lineWidth = width;
        c.stroke();
    }
    ellipse(135, 136, 114, 114, happy ? '#f5cd78' : '#e9b37e', false);
    for (const [x, y] of [[46, 79], [220, 54], [221, 122], [68, 218], [210, 205]]) {
        lines('#ffe7ab', 3, p => {
            p.moveTo(x - 5, y); p.lineTo(x + 5, y);
            p.moveTo(x, y - 5); p.lineTo(x, y + 5);
        });
    }
    ellipse(108, 69, 35, 24, hair);
    ellipse(128, 116, 54, 63, hair);
    fill(blouse, p => {
        p.moveTo(120, 160);
        p.bezierCurveTo(84, 163, 70, 180, 58, 225);
        p.quadraticCurveTo(126, 262, 192, 228);
        p.quadraticCurveTo(182, 177, 154, 165);
        p.closePath();
    });
    fill(skin, p => {
        p.moveTo(113, 147); p.lineTo(111, 169);
        p.quadraticCurveTo(133, 189, 157, 166);
        p.lineTo(151, 146); p.closePath();
    });
    ellipse(89, 122, 10, 13, skin);
    ellipse(169, 122, 10, 13, skin);
    fill(skin, p => {
        p.moveTo(87, 107);
        p.bezierCurveTo(90, 74, 155, 72, 168, 106);
        p.bezierCurveTo(173, 144, 154, 166, 131, 165);
        p.bezierCurveTo(104, 164, 88, 143, 87, 107);
        p.closePath();
    });
    fill(hair, p => {
        p.moveTo(84, 112);
        p.bezierCurveTo(68, 61, 150, 49, 170, 83);
        p.quadraticCurveTo(183, 103, 170, 116);
        p.quadraticCurveTo(158, 107, 152, 88);
        p.quadraticCurveTo(122, 110, 84, 112);
        p.closePath();
    });
    lines('#98634b', 3, p => { p.moveTo(92, 91); p.quadraticCurveTo(109, 77, 135, 77); });
    for (const x of [107, 150]) {
        ellipse(x, 117, 3.4, 5, ink, false);
        ellipse(x + (x < 130 ? -4 : 5), 131, 8, 3, '#e79675', false);
    }
    lines(ink, 3, p => {
        p.moveTo(98, happy ? 108 : 105); p.quadraticCurveTo(105, happy ? 102 : 108, 114, 110);
        p.moveTo(144, 110); p.quadraticCurveTo(151, happy ? 102 : 108, 159, happy ? 108 : 104);
        p.moveTo(128, 118); p.quadraticCurveTo(120, 131, 131, 131);
    });
    if (happy) {
        fill(ink, p => { p.moveTo(116, 138); p.quadraticCurveTo(130, 145, 144, 137); p.quadraticCurveTo(131, 162, 116, 138); });
        lines('#f7d2aa', 3, p => { p.moveTo(123, 143); p.quadraticCurveTo(131, 146, 138, 142); });
    } else {
        lines(ink, 3.2, p => { p.moveTo(120, 145); p.quadraticCurveTo(130, 138, 141, 144); });
    }
    ellipse(91, 139, 4.6, 5.2, '#f4c46a');
    ellipse(167, 139, 4.6, 5.2, '#f4c46a');
    const arm = (a, b, d) => {
        const path = p => { p.moveTo(...a); p.quadraticCurveTo(...b, ...d); };
        lines(ink, 25, path);
        lines(skin, 18, path);
    };
    if (happy) {
        arm([79, 211], [65, 202], [54, 170]);
        arm([179, 207], [203, 203], [211, 171]);
        for (const x of [54, 211]) {
            ellipse(x, 166, 9, 12, skin);
            lines('#ffe8ae', 3, p => { p.moveTo(x - 8, 145); p.lineTo(x - 12, 136); p.moveTo(x + 6, 143); p.lineTo(x + 12, 135); });
        }
    } else if (late) {
        arm([183, 214], [209, 211], [218, 171]);
        arm([78, 215], [109, 223], [193, 194]);
        ellipse(216, 181, 16, 16, '#ffe8b3');
        lines(ink, 3, p => { p.moveTo(216, 171); p.lineTo(216, 182); p.lineTo(225, 185); });
        ellipse(202, 195, 10, 5, skin);
    } else {
        arm([181, 209], [208, 181], [232, 173]);
        ellipse(235, 172, 14, 6, skin);
        arm([79, 212], [69, 219], [90, 226]);
    }
}
