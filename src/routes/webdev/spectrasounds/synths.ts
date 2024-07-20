import type { Element } from "$lib/atomicspectra/types/native";
import { logColor, quickNMtoHex } from "./debugging";

// https://www.desmos.com/calculator/oideopwllh

const LOG2_20 = Math.log2(20);

const MIN_VIS_FQ = 1 / 780; // red
const MAX_VIS_FQ = 1 / 380; // violet

const MIN_AUDIBLE_FQ = 20;
export const MAX_AUDIBLE_FQ = 16000;

function baseMap( wl: number ){
    const fq   = 10 / wl;
    return ( fq - MIN_VIS_FQ ) / ( MAX_VIS_FQ - MIN_VIS_FQ );
}

function scientificMap( wl: number ){
    return baseMap(wl) * (MAX_AUDIBLE_FQ - MIN_AUDIBLE_FQ) + MIN_AUDIBLE_FQ;
}

function musicalMap( wl: number ){
    const midi = 115 * baseMap(wl) / 12 + LOG2_20
    return Math.pow(2, midi);
}

function ampToDB( amp: number ){
    return 20 * Math.log10(amp);
}

export type MapFn = (x: number) => number;

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


        constructor(context: AudioContext, public element: Element, mode: "musical" | "scientific") {

            super(context);
            const lines = element.spectra
            this._amp = new GainNode(context);

            if( lines.length === 0 ) return;

            let ampSum = 0;

            // this.debugFullRange(context); // comment out loop below to use this

            for( let line of lines ){

                let fq:  number;
                let amp: number;

                if( mode === "musical" ){
                    fq  = musicalMap(line.wl);
                    amp = line.a; // todo: see below, but we also need to apply loudness curves here for the human
                }
                else if( mode === "scientific" ){
                    fq  = scientificMap(line.wl);
                    amp = line.a; // todo: what units is this in?  do we need to map it to something else? (eg. linear)
                }
                else {
                    throw "invalid mode";
                }

                if( fq < MIN_AUDIBLE_FQ || fq > MAX_AUDIBLE_FQ ) continue;
                const osc = new OscillatorWithGainNode(context, fq, line.wl, amp);
                ampSum += amp;
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
                const fq = line * MAX_AUDIBLE_FQ;
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

        private         _voices:  {[symbol: string]: PlayingAtomicSpectra} = {};

        constructor(public readonly context: AudioContext, public readonly analyzer?: AnalyserNode) {}

        public get(element: Element): PlayingAtomicSpectra {
            const name = element.symbol;
            if( this._voices[name] ) return this._voices[name];

            const voice: PlayingAtomicSpectra = this._voices[name] = new AtomicSpectraNode(this.context, element, this.analyzer ? "scientific" : "musical");
            voice.start();
            voice.gain.setValueAtTime(0, this.context.currentTime);
            return voice;
        }

        public start(element: Element){
            const voice = this.get(element);
            voice.gain.setTargetAtTime(1, this.context.currentTime, 0.2);
            this.analyzer ? voice.connect(this.analyzer) : voice.connect(this.context.destination);
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
