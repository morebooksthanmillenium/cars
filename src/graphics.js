'use strict';

define(['src/utils'], (utils) => {
    const graphics = {
        constants: {},
        internal: {}
    };
    
    graphics.Canvas = class {
        constructor(document) {
            this.canvas = document.getElementById('canvas');
            this.context = this.canvas.getContext('2d');
        }
        
        drawRect({x, y, width, height}, color) {
            this.context.fillStyle = color;
            this.context.fillRect(x, y, width, height);
        }

        clear(backgroundColor) {
            this.drawRect({
                x: 0, 
                y: 0, 
                width: this.width, 
                height: this.height
            }, backgroundColor);
        }

        get width() {
            return this.canvas.width;
        }

        get height() {
            return this.canvas.height;
        }

        set width(value) {
            this.canvas.width = value;
        }

        set height(value) {
            this.canvas.height = value;
        }
    };
    
    graphics.ImageNotCached = class extends Error {};

    graphics.ImageCache = class {
        constructor(...fileNames) {
            this.images = new Map();
            this.loadedCount = 0;
        }

        loadFiles(fileName, fileNames) {
            this.images[fileName] = graphics.internal.imageWithSrc(fileName);
            this.images[fileName].addEventListener('load', () => {
                ++this.loadedCount;
            });
        }

        whenLoaded(callback) {
            utils.runInBackground(() => {
                if (this.images.size === this.loadedCount)
                    callback();
            });
        }

        image(fileName) {
            return this.images[fileName];
        }
    };

    graphics.internal.imageWithSrc = (src) => {
        const result = new Image();
        result.src = src;
        return result;
    };

    return graphics;
});