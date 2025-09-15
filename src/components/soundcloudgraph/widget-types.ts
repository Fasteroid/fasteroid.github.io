type SCWidgetEvents = {
    LOAD_PROGRESS:     "LOAD_PROGRESS"
    PLAY_PROGRESS:     "PLAY_PROGRESS"
    PLAY:              "PLAY"
    PAUSE:             "PAUSE"
    FINISH:            "FINISH"
    SEEK:              "SEEK"
    READY:             "READY"
    CLICK_DOWNLOAD:    "CLICK_DOWNLOAD"
    CLICK_BUY:         "CLICK_BUY"
    OPEN_SHARE_PANEL:  "OPEN_SHARE_PANEL"
    ERROR:             "ERROR"
}

declare global {

    interface Window {
        SC: {
            Widget: 
                ((iframe: HTMLIFrameElement | string) => {
                    load(url: string, options?: object): void;
                    play(): void;
                    pause(): void;
                    toggle(): void;
                    seekTo(milliseconds: number): void;
                    setVolume(volume: number): void;
                    getVolume(): number;
                    getDuration(): number;
                    getPosition(): number;
                    bind(eventName: SCWidgetEvents[keyof SCWidgetEvents], listener: Function): void;
                    unbind(eventName: SCWidgetEvents[keyof SCWidgetEvents]): void;
                })
                & {
                    Events: SCWidgetEvents
                }
        }
    }


}

export {};