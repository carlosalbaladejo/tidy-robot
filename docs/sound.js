const score = {
    confirm: [[440, 0, .09], [587, .075, .14]],
    pick: [[420, 0, .085], [700, .065, .13]],
    place: [[290, 0, .09], [490, .07, .12]],
    drop: [[170, 0, .11]],
    empty: [[240, 0, .06], [180, .065, .09]],
    splash: [[660, 0, .065], [440, .05, .08], [990, .11, .1]],
    wrong: [[392, 0, .16], [329, .17, .15], [349, .34, .26]],
    late: [[470, 0, .045], [312, .20, .045], [470, .4, .045], [262, .59, .26]],
    happy: [[523, 0, .15], [659, .11, .16], [784, .23, .17], [1046, .36, .4], [659, .36, .30]],
};

export function makeSound() {
    let context;
    let lastCue;
    function unlock() {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return Promise.resolve(false);
        try {
            if (!context) context = new Audio();
            if (context.state === 'running') return Promise.resolve(true);
            return context.resume().then(() => context.state === 'running', () => false);
        } catch {
            return Promise.resolve(false);
        }
    }
    function play(name) {
        if (context?.state !== 'running') return false;
        const start = context.currentTime;
        lastCue = name;
        for (const [frequency, delay, length] of score[name]) {
            const tap = context.createOscillator();
            const volume = context.createGain();
            const t = start + delay;
            tap.type = name === 'wrong' || name === 'late' ? 'sine' : 'triangle';
            tap.frequency.setValueAtTime(frequency, t);
            if (name === 'splash' || name === 'drop') tap.frequency.exponentialRampToValueAtTime(frequency * .55, t + length);
            volume.gain.setValueAtTime(.0001, t);
            volume.gain.exponentialRampToValueAtTime(.13, t + .018);
            volume.gain.exponentialRampToValueAtTime(.0001, t + length);
            tap.connect(volume).connect(context.destination);
            tap.start(t);
            tap.stop(t + length + .01);
            tap.addEventListener('ended', () => { tap.disconnect(); volume.disconnect(); }, { once: true });
        }
        return true;
    }
    return { unlock, play, get active() { return context?.state === 'running'; }, get lastCue() { return lastCue; } };
}
