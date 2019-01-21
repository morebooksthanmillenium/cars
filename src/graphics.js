'use strict';

define(() => {
    const graphics = {};
    
    graphics.Canvas = class {
        constructor(document, {width, height}) {
            this.canvas = document.getElementById('canvas');
            this.context = this.canvas.getContext('2d');
            if (width)
                this.canvas.width = width;
            if (height)
                this.canvas.height = height;
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
    
    return graphics;
});