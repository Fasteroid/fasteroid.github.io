export interface CarouselImageData {
    file:   string
    title:  string
    capt1:  string
    capt2:  string
    first?: boolean
}

export type CarouselImagePicker = (pics: CarouselImageData[]) => CarouselImageData[]