import spectra from "$lib/atomicspectra/spectra.json";
import type { SpectraLine, SpectraAtoms } from "$lib/atomicspectra/types";
import { browser } from "$app/environment";


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
                const osc = new OscillatorWithGainNode(context, 100000 / line.wl, line.a * 0.001);
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
