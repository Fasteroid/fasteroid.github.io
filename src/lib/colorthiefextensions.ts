import ColorThief from "colorthief";

const thief = new ColorThief();

export async function getColorAsync(img: HTMLImageElement, quality?: number): Promise<[number, number, number] | null> {
    return new Promise((resolve, _) => {
        try {
            img.addEventListener('load', () => {
                resolve( thief.getColor(img, quality) );
            })
        }
        catch(e){
            resolve([0,0,0]);
        }
    });
}


// todo: this is slow as fuck, put it in a web worker!
export async function getPaletteAsync(img: HTMLImageElement, colorCount?: number, quality?: number): Promise<[number, number, number][] | null> {
    return new Promise((resolve, _) => {
        try {
            img.addEventListener('load', () => {
                resolve( thief.getPalette(img, colorCount, quality) );
            })
        }
        catch(e){
            resolve([[0,0,0]]);
        }
    });
}