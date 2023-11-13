import { assertExists } from "$lib/uniqueid";
import type { CarouselImageData } from "../carousel-common";
import type { PrefixedIntStr } from "$lib/uniqueid";

export class CarouselImageController {

    base:  HTMLElement;
    image: HTMLElement;
    data:  CarouselImageData;

    constructor(id: PrefixedIntStr, data: CarouselImageData){
        this.base  = assertExists( document.getElementById(id) );
        this.image = assertExists( this.base.querySelector(".image") );
        this.data = data
    }

    setVisible(vis: boolean){
        this.base.classList.toggle("hidden", !vis)
    }

    setShift(amt: number){
        this.base.style.left = amt + "%"
    }

}