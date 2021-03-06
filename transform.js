var inp = document.getElementById("pony-input");
inp.onchange = render;
inp.onkeypress = render;
inp.focus();

if (inp.addEventListener) {
  inp.addEventListener('input', render, false);
} else if (area.attachEvent) {
  area.attachEvent('onpropertychange', render, false);
}

var last_text = "";

function render() {
    /* Don't re-render the text. */
    if(last_text === inp.value) return;
    last_text = inp.value;

    var out = document.getElementById("pony-output");
    var text = transform(inp.value);
    out.innerText = text;
    if(window.twint) twint.set_text(text);
}

window.pony_render = render;

function transform(si) {
    var so = "";
    var accum = "";
    var space_re = /^\s$/;

    for(let i = 0; i < si.length; i++) {
        let level = i / si.length;
        let c = si.charAt(i);
        if(space_re.test(c)) {
            so += transform_sequence(accum, {range: "wide", strength: level});
            so += c;
            accum = "";
            continue;
        }

        if(level < 0.5 && Math.random() < 0.1) {
            level = 0.7;
        }

        so += transform_sequence(accum + c, {range: "limited", strength: level});
        accum = "";
    }

    return so + transform_sequence(accum, {strength: 0});
}

function transform_sequence(seq, params) {
    if(seq === "") return "";
    return seq + diacritics(params);
}

function diacritics_width(code) {
    switch(code) {
    case 0x034D: return 2;
    case 0x035C: return 3;
    case 0x035D: return 3;
    case 0x035E: return 3;
    case 0x035F: return 3;
    case 0x0360: return 3;
    case 0x0361: return 3;
    case 0x0362: return 3;
    }
    return 1;
}

function random_combining_char(params) {
    // https://en.wikipedia.org/wiki/Combining_character
    const ranges = [
        [0x0300, 0x034e],
        [0x0350, 0x036f],
        [0x1dc0, 0x1dca],
        [0x1dcd, 0x1dcd],
        [0x1dfe, 0x1dff],
        [0x20d0, 0x20e1],
        [0xfe20, 0xfe23]
    ];

    let wsum = 0;
    for(let i in ranges) {
        let r = ranges[i];
        wsum += r[1] - r[0] + 1;
    }

    let rnd = Math.floor(Math.random() * wsum);
    let acc = 0;
    for(let i in ranges) {
        let r = ranges[i];
        let n = r[1] - r[0] + 1;
        if(rnd < acc + n) {
            return r[0] + rnd - acc;
        }
        acc += n;
    }

    return "";
}

function diacritics(params) {
    let x = params.strength;
    let iterations = 10 * x*x*x - 3 * x*x + 0.5 * x - 1;

    let c = "";
    for(let i = 0; i < iterations; i++) {
        let dia = random_combining_char(params);
        c += String.fromCharCode(dia);
    }
    return c;
}
