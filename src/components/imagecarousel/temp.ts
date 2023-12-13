class ImageCarousel {

    name: string;
    size: number;
    slides: Element[];

    constructor(name: string, interval = 2000, size = 512, time = 500) {

        const self = this; // utility for eliminating dumb variable scope errors down the line

        // ---- CONSTRUCTOR ---- //
        this.name = name;
        this.size = size;
        this.slides = [];
        this.index = 0;
        this.time = time;
        this.fade = 0;
        this.interval = interval;
        this.loop;

        this.self = $(this.name);
        this.self.css({
            'max-width': this.size,
            'margin': "0px auto 5px auto"
        });

        this.frame = $(this.self.append('<div class="frame"></div>')[0].lastChild);

        this.holder = $(this.frame.append('<div class="holder"></div>')[0].lastChild);

        this.fadeIn = $(this.self.append('<div class="fade-text">fade in text</div>')[0].lastChild);
        this.fadeIn.css({
            display: "none",
        });

        this.fadeOut = $(this.self.append('<div class="fade-text">fade out text</div>')[0].lastChild);
        this.fadeOut.css({
            display: "block"
        });

        this.fadingText = [this.fadeOut, this.fadeIn];

        this.buttons = $(this.frame.append('<div class="front"></div>')[0].lastChild);
        $(this.buttons.append('<button class="button"></button>')[0].lastChild).on('click',
            function () { self.move((self.index + self.slides.length - 1) % self.slides.length, -100); } // dirty numbers hack
        );
        $(this.buttons.append('<button class="button"></button>')[0].lastChild).on('click',
            function () { self.move((self.index + 1) % self.slides.length); }
        );
        this.buttons.on('mouseenter', function () {
            self.stopScroll();
        });
        this.buttons.on('mouseleave', function () {
            self.autoScroll();
        });

        // ---- METHODS ---- //
        /* Adds an image to this carousel */
        this.addImage = function addImage(url, name = "untitled image", caption = "origins unknown", sizeoverride = size) {
            let len = this.slides.length;
            let html = `<p><div class="minihead">${name}</div><div class="sub">${sizeoverride}x Render<br>${caption}</div></p>`;
            this.slides[len] = {
                slide: $(this.holder.append(`<div class="slide"><img src="${url}" alt="${name}"></div>`)[0].lastChild),
                captionHTML: html
            };
            if (len == 0) {
                this.fadeOut.html(html);
            }
        };

        /* Slides to the slide of the given index */
        this.move = function move(newIndex = 0, direction = 100) {

            if (this.holder.is(':animated') || this.index === newIndex) {
                return;
            }

            this.slides[newIndex].slide.css({
                left: direction + '%',
                display: 'block'
            });

            this.fade = (this.fade + 1) % 2;
            this.fadingText[this.fade].html(this.slides[newIndex].captionHTML);

            this.fadeIn.fadeToggle(this.time);
            this.fadeOut.fadeToggle(this.time);

            this.holder.animate({
                left: `${-direction}%`
            }, this.time,
                function () {
                    self.slides[self.index].slide.css({
                        display: 'none'
                    });
                    self.slides[newIndex].slide.css({
                        left: 0
                    });
                    self.holder.css({
                        left: 0
                    });
                    self.index = newIndex;
                }
            );

        };

        /* Advances to the next slide */
        this.advance = function advance() {
            this.move((this.index + 1) % this.slides.length);
        };

        /* Initiate Auto-Scrolling */
        this.autoScroll = function autoScroll(startDelay = 0) {
            if (self.loop) { clearInterval(self.loop) }
            setTimeout(
                function () {
                    self.loop = setInterval(
                        function () { self.advance(); },
                        self.interval
                    );
                },
                startDelay
            );
        };

        /* Stops the Auto-Scroll */
        this.stopScroll = function stopScroll() {
            if (self.loop) { clearInterval(self.loop); self.loop = false; }
        };

    }
}