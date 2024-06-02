import type { Element } from "$lib/atomicspectra/types/native";

// https://www.desmos.com/calculator/oideopwllh

const LOG2_20 = Math.log2(20);

const MIN_VIS_FQ = 1 / 750; // red
const MAX_VIS_FQ = 1 / 380; // violet

const MIN_AUDIBLE_FQ = 20;
const MAX_AUDIBLE_FQ = 20000;

function audibleMap( wl: number ){

    const fq   = 10 / wl;
    const map  = ( fq - MIN_VIS_FQ ) / ( MAX_VIS_FQ - MIN_VIS_FQ );

    const midi = 115 * map / 12 + LOG2_20
    // return Math.pow(2, midi);
    return map * (MAX_AUDIBLE_FQ - MIN_AUDIBLE_FQ) + MIN_AUDIBLE_FQ;

}

// Have to do this stupid crap so SSR doesn't witness the GainNode, otherwise it breaks
export function load() {

    class OscillatorWithGainNode extends GainNode {
        private _osc: OscillatorNode;
    
        constructor(context: AudioContext, frequency: number, gain: number) {
            super(context, { gain: gain });
            this._osc = new OscillatorNode(context, { frequency: frequency, type: "sine" });
            this._osc.connect(this);
        }
    
        public start() {
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
            let ampSum = 0;

            for( let line of lines ){
                const fq = audibleMap(line.wl);
                const a  = line.a * 0.001;
                if( fq < MIN_AUDIBLE_FQ || fq > MAX_AUDIBLE_FQ ) continue;

                const osc = new OscillatorWithGainNode(context, fq, a);
                ampSum += line.a;
                osc.connect(this._amp);
                this._oscs.push(osc);
            }
            if(ampSum == 0){ return; } // don't error if all frequencies are out of range
            this._amp.gain.value = 500 / ampSum;
            this._amp.connect(this);
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
            }, 1000)
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
