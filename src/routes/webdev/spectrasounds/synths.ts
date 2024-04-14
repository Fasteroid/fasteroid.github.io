import spectra from "$lib/atomicspectra/spectra.json";
import type { SpectraLine, SpectraAtoms } from "$lib/atomicspectra/types";
import { browser } from "$app/environment";

// https://www.desmos.com/calculator/oideopwllh

const LOG2_20 = Math.log2(20);
const MIN_VIS_FQ = 1 / 750; // violet
const MAX_VIS_FQ = 1 / 380; // red

function audibleMap( wl: number ){

    const fq   = 1 / wl;
    const map  = ( fq - MIN_VIS_FQ ) / ( MIN_VIS_FQ - MAX_VIS_FQ );
    const midi = 115 * map / 12 + LOG2_20
    return Math.pow(2, midi);

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
        private _mul:  number = 0;

        constructor(context: AudioContext, atom: number) {
            super(context);
            const lines = (spectra as SpectraAtoms)[atom];
            this._mul = 1 / lines.length;
            for( let line of lines ){
                const osc = new OscillatorWithGainNode(context, audibleMap(line.wl), line.a * 0.001);
                osc.connect(this);
                this._oscs.push(osc);
            }
        }

        public start(){
            const t = this.context.currentTime + 0.1;
            this.gain.setValueAtTime(0, this.context.currentTime);
            this.gain.linearRampToValueAtTime(this._mul, t);
            for( let osc of this._oscs ){
                osc.start();
            }
        }

        public stop(when?: number){
            const t = (when || this.context.currentTime) + 0.1;
            this.gain.linearRampToValueAtTime(0, t);
            for( let osc of this._oscs ){
                osc.stop(t);
            }
        }

    }


    return {
        OscillatorWithGainNode: OscillatorWithGainNode,
        AtomicSpectraNode:      AtomicSpectraNode
    }
}
