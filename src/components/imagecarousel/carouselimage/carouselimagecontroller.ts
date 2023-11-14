import { assertExists, assertQueryExists } from "$lib/uniqueid";
import type { CarouselImageData } from "../carousel-common";
import type { PrefixedIntStr } from "$lib/uniqueid";

export class CarouselImageController {

    base:  HTMLElement;
    image: HTMLElement;
    data:  CarouselImageData;

    constructor(id: PrefixedIntStr, data: CarouselImageData){
        this.base  = assertExists( id );
        this.image = assertQueryExists( this.base, ".image" );
        this.data = data
    }

    setVisible(vis: boolean){
        this.base.classList.toggle("hidden", !vis)
    }

    setShift(amt: number){
        this.base.style.left = amt + "%"
    }

}