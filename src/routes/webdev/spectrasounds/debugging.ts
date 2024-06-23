export function quickNMtoHex(wl: number, amp2: number = 1.0){
    let r: number, g: number, b: number;
    wl >= 380 && wl < 440 ? (r=-(wl-440)/60,g=0,b=1):
    wl >= 440 && wl < 490 ? (r=0,g=(wl-440)/50,b=1):
    wl >= 490 && wl < 510 ? (r=0,g=1,b=-(wl-510)/20):
    wl >= 510 && wl < 580 ? (r=(wl-510)/70,g=1,b=0):
    wl >= 580 && wl < 645 ? (r=1,g=-(wl-645)/65,b=0):
    wl >= 645 && wl < 781 ? (r=1,g=0,b=0):
    (r=0,g=0,b=0);
    
    let amp: number = wl >= 380 && wl < 420 ? .3+.7*(wl-380)/40:
                    wl >= 420 && wl < 701 ? 1:
                    wl >= 701 && wl < 781 ?.3+.7*(780-wl)/80:0;

    amp *= amp2;

    const gamma = 1.0 / 2.2;
    const intensityMax = 255;
    r = r > 0 ? Math.round(intensityMax * Math.pow(r * amp, gamma)) : 0;
    g = g > 0 ? Math.round(intensityMax * Math.pow(g * amp, gamma)) : 0;
    b = b > 0 ? Math.round(intensityMax * Math.pow(b * amp, gamma)) : 0;

    return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

export function logColor(wl: number, amp: number = 1.0){
    console.log(`${wl} nm %c██`, `color: ${quickNMtoHex(wl, amp)}; font-weight: bold;`);
}