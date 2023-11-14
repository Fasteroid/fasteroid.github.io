import { assertExists, assertQueryExists } from "$lib/uniqueid";
import type { PrefixedIntStr } from "$lib/uniqueid";
import type { CarouselImageData } from "../carousel-common";

export class CarouselCaptionController {

    base:  HTMLElement;
    title: HTMLElement;
    capt1: HTMLElement;
    capt2: HTMLElement;

    constructor(id: PrefixedIntStr){
        this.base  = assertExists( id );
        this.title = assertQueryExists( this.base, ".title" );
        this.capt1 = assertQueryExists( this.base, ".capt1" );
        this.capt2 = assertQueryExists( this.base, ".capt2" );
    }

    setData(data: CarouselImageData){
        this.title.innerText = data.title
        this.capt1.innerText = data.capt1
        this.capt2.innerText = data.capt2
    }

    setVisible(vis: boolean){
        this.base.classList.toggle("hidden", !vis)
    }

    fade(opacity: number, transition: number){
        if( opacity > 0 ){ this.setVisible(true) }
        this.base.animate([
            {opacity: `${100-opacity}%`},
            {opacity: `${opacity}%`}
        ], transition).addEventListener("finish",() => {
            if( opacity == 0 ){
                this.setVisible(false);
            }
        })
    }

}