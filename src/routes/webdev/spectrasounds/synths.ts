import type { Element } from "$lib/atomicspectra/types/native";
import { logColor, quickNMtoHex } from "./debugging";

// https://www.desmos.com/calculator/oideopwllh

const LOG2_20 = Math.log2(20);

const MIN_VIS_FQ = 1 / 780; // red
const MAX_VIS_FQ = 1 / 380; // violet

const MIN_AUDIBLE_FQ = 20;
const MAX_AUDIBLE_FQ = 16000;

/*
    TODO: while this technically works, feeding the fft of this to the gpu and then unmapping it kills the resolution on the lower frequencies
    (which my dumbass could have predicted if I thought about it for more than 2 seconds)

    We might need to have two audio pipelines, one for FFT and one for listening to.
*/

function audibleMap( wl: number ){
    const fq   = 10 / wl;
    const map  = ( fq - MIN_VIS_FQ ) / ( MAX_VIS_FQ - MIN_VIS_FQ ); // 0 to 1 light frequencies

    const midi = 115 * map / 12 + LOG2_20
    return Math.pow(2, midi);
    // return map * (MAX_AUDIBLE_FQ - MIN_AUDIBLE_FQ) + MIN_AUDIBLE_FQ;
}

function ampToDB( amp: number ){
    return 20 * Math.log10(amp);
}

// Have to do this stupid crap so SSR doesn't witness the GainNode, otherwise it breaks
export function load() {

    class OscillatorWithGainNode extends GainNode {
        private _osc: OscillatorNode;
    
        constructor(context: AudioContext, frequency: number, private wavelength: number, gain: number) {
            super(context, { gain: gain });
            this._osc = new OscillatorNode(context, { frequency: frequency, type: "sine" });
            this._osc.connect(this);
        }
    
        public start() {
            // logColor(this.wavelength / 10, this.gain.value);
            this._osc.start();
        }
    
        public stop(when?: number) {
            this._osc.stop(when);
        }
    }

    class AtomicSpectraNode extends GainNode {

        private _oscs: OscillatorWithGainNode[] = [];
        private _amp:  GainNode;

        public element: Element;

        constructor(context: AudioContext, atom: Element) {

            super(context);
            this.element = atom;
            const lines = atom.spectra
            this._amp = new GainNode(context);

            if( lines.length === 0 ) return;

            let ampSum = 0;
            for( let line of lines ){
                const fq = audibleMap(line.wl);
                if( fq < MIN_AUDIBLE_FQ || fq > MAX_AUDIBLE_FQ ) continue;
                const osc = new OscillatorWithGainNode(context, fq, line.wl, line.a);
                ampSum += line.a;
                osc.connect(this._amp);
                this._oscs.push(osc);
            }

            this._amp.gain.value = 0.5 / Math.max(1,ampSum);
            this._amp.connect(this);

        }

        private debugFullRange(context: AudioContext): number {
            const count = 40;
            const lines = Array.from({length: count}, (_, i) => (i+1) / (count)); // for testing full frequency range
            for( let line of lines ){
                const fq = line * 20000;
                const a  = 1;
                const osc = new OscillatorWithGainNode(context, fq, line, a);
                osc.connect(this._amp);
                this._oscs.push(osc);
            }
            return lines.length;
        }

        public start(){
            for( let osc of this._oscs ){
                osc.start();
            }
        }

        public stop(when?: number){
            const t = (when || this.context.currentTime);
            for( let osc of this._oscs ){
                osc.stop(t);
            }
        }

    }

    interface PlayingAtomicSpectra extends AtomicSpectraNode {
        timeout?: number;
    }

    class VoiceManager {

        public readonly context:  AudioContext;
        public readonly analyzer: AnalyserNode;
        private         _voices:  {[symbol: string]: PlayingAtomicSpectra} = {};

        constructor(context: AudioContext, analyzer: AnalyserNode) {
            this.context  = context;
            this.analyzer = analyzer;
        }

        public get(element: Element): PlayingAtomicSpectra {
            const name = element.symbol;
            if( this._voices[name] ) return this._voices[name];

            const voice: PlayingAtomicSpectra = this._voices[name] = new AtomicSpectraNode(this.context, element);
            voice.start();
            voice.gain.setValueAtTime(0, this.context.currentTime);
            return voice;
        }

        public start(element: Element){
            const voice = this.get(element);
            voice.gain.setTargetAtTime(1, this.context.currentTime, 0.2);
            voice.connect(this.analyzer);
            if( voice.timeout ) clearTimeout(voice.timeout);
        }

        public stop(element: Element){
            const voice = this.get(element);
            voice.gain.setTargetAtTime(0, this.context.currentTime, 0.2);
            if( voice.timeout ) clearTimeout(voice.timeout);
            voice.timeout = window.setTimeout(() => {
                voice.disconnect();
            }, 4000)
        }

        public stopAll(){
            for( let voice of Object.values(this._voices) ){
                this.stop(voice.element);
            }
        }

    }

    return {
        OscillatorWithGainNode: OscillatorWithGainNode,
        AtomicSpectraNode:      AtomicSpectraNode,
        VoiceManager:           VoiceManager
    }
}
