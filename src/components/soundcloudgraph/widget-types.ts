declare global {
    interface Window {
        SC: {
            Widget(iframe: HTMLIFrameElement | string): {
                load(url: string, options?: object): void;
                play(): void;
                pause(): void;
                toggle(): void;
                seekTo(milliseconds: number): void;
                setVolume(volume: number): void;
                getVolume(): number;
                getDuration(): number;
                getPosition(): number;
                bind(eventName: string, listener: Function): void;
                unbind(eventName: string): void;
            };
        };
    }
}

export {};