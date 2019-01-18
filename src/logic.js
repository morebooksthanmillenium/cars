'use strict';

define(['src/utils'], (utils) => {
    const logic = {
        constants: {},
        decorations: {},
        internal: {}
    };
    
    logic.pointsAdded = (p1, p2) => {
        return {
            x: p1.x+p2.x,
            y: p1.y+p2.y
        };
    };

    logic.pointsSubtracted = (p1, p2) => {
        return {
            x: p1.x-p2.x,
            y: p1.y-p2.y
        };
    };

    logic.pointsAreEqual = (p1, p2) => p1.x === p2.x && p1.y === p2.y;
    
    logic.internal.KeyTracker = class {
        constructor() {
            this.isDownMap = new Map();
        }
        
        setKeyDown(key) {
            this.isDownMap.set(key, true);
        }
        
        setKeyUp(key) {
            this.isDownMap.set(key, false);
        }
        
        keyIsDown(key) {
            return this.isDownMap.has(key) ? this.isDownMap.get(key) : false;
        }
    };

    logic.KeyHandler = class {
        constructor(keysArray, document) {
            this.keyTracker = new logic.internal.KeyTracker();
            
            document.addEventListener('keydown', logic.KeyHandler.eventCallbackForKeyInKeys(keysArray, (key) => {
                this.keyTracker.setKeyDown(key);
            }));

            document.addEventListener('keyup', logic.KeyHandler.eventCallbackForKeyInKeys(keysArray, (key) => {
                this.keyTracker.setKeyUp(key);
            }));
        }
        
        static eventCallbackForKeyInKeys(keysArray, callback) {
            return (event) => {
                if (utils.contains(keysArray, event.key))
                    callback(event.key);
            };
        }

        keyIsDown(key) {
            return this.keyTracker.keyIsDown(key);
        }
    };

    logic.carParts = {
        constants: {}
    };

    logic.carParts.facingUp = (position, color) => {
        const tire = ({x, y}) => {
            return {
                rect: {
                    x, y, 
                    width: logic.carParts.constants.tireWidth,
                    height: logic.carParts.constants.tireHeight
                },
                color: 'black'
            };
        };

        const bonnet = {
            rect: {
                x: position.x+logic.carParts.constants.tireWidth*2, 
                y: position.y, 
                width: logic.carParts.constants.bonnetWidth, 
                height: logic.carParts.constants.bonnetHeight,
            },
            color
        };
        const roof = {
            rect: {
                x: position.x+logic.carParts.constants.tireWidth, 
                y: bonnet.rect.y+logic.carParts.constants.bonnetHeight, 
                width: logic.carParts.constants.roofWidth,
                height: logic.carParts.constants.roofHeight
            },
            color
        };
        const frontLeftTire = tire({
            x: position.x,
            y: roof.rect.y+5
        });
        const bottomLeftTire = tire({
            x: position.x, 
            y: roof.rect.y+logic.carParts.constants.roofHeight-20
        });
        const frontRightTire = tire({
            x: roof.rect.x+logic.carParts.constants.roofWidth, 
            y: roof.rect.y+5
        });
        const bottomRightTire = tire({
            x: roof.rect.x+logic.carParts.constants.roofWidth, 
            y: roof.rect.y+logic.carParts.constants.roofHeight-20
        });

        return [
            bonnet, roof, frontLeftTire, bottomLeftTire, frontRightTire, bottomRightTire
        ];
    };

    logic.carParts.constants.tireWidth = 7;
    logic.carParts.constants.tireHeight = 15;
    logic.carParts.constants.bonnetWidth = 30;    
    logic.carParts.constants.bonnetHeight = 20;    
    logic.carParts.constants.roofWidth = logic.carParts.constants.bonnetWidth+logic.carParts.constants.tireWidth*2;
    logic.carParts.constants.roofHeight = logic.carParts.constants.bonnetHeight+50;
    logic.carParts.constants.carWidth = logic.carParts.constants.roofWidth+logic.carParts.constants.tireWidth*2
    logic.carParts.constants.carHeight = logic.carParts.constants.roofHeight+logic.carParts.constants.bonnetHeight;

    logic.constants.laneCount = 6;
    logic.constants.mapWidth = logic.constants.laneCount*logic.carParts.constants.carWidth;
    logic.constants.mapHeight = logic.carParts.constants.carHeight*6;

    logic.RandomlyColored = class {
        constructor() {
            const randomColor = () => utils.randomElement(
                ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'magenta', 'aqua', 'maroon']);

            this.color = randomColor();
        }
    };

    logic.PlayerCar = class extends logic.RandomlyColored {
        static atDefaultPosition(){
            return new logic.PlayerCar({
                x: logic.constants.mapWidth/2-logic.carParts.constants.carWidth/2,
                y: logic.constants.mapHeight-logic.carParts.constants.carHeight-5
            });
        }

        static baseSpeed() {
            return 5;
        }

        static maxSpeed() {
            return 7;
        }

        constructor(position) {
            super();
            this.position = position;
            this.horizontalSpeed = this.verticalSpeed = 0;
            this.updateSpeedBasedOnDistanceTraveled(0);
        }

        updateSpeedBasedOnDistanceTraveled(distanceTraveled) {
            const newVerticalSpeed = Math.abs(distanceTraveled/5000)+logic.PlayerCar.baseSpeed();
            this.horizontalSpeed = this.verticalSpeed = 
                (newVerticalSpeed > logic.PlayerCar.maxSpeed()) ? logic.PlayerCar.maxSpeed() : newVerticalSpeed;
        }

        physicalParts() {
            return logic.carParts.facingUp(this.position, this.color);
        }

        moveLeft(leftBoundary) {
            this.position.x = logic.xFilteredThroughLeftBoundary(
                this.position.x-this.horizontalSpeed, leftBoundary
            );
        }

        moveRight(rightBoundary) {
            this.position.x = logic.xFilteredThroughRightBoundary(
                this.position.x+this.horizontalSpeed, rightBoundary
            );
        }
    };

    logic.xFilteredThroughRightBoundary = (x, rightBoundary) => (x > rightBoundary) ? rightBoundary : x;

    logic.xFilteredThroughLeftBoundary = (x, leftBoundary) => (x < leftBoundary) ? leftBoundary : x;

    logic.EnemyCar = class extends logic.RandomlyColored {
        static atRandomPosition() {
            return new logic.EnemyCar({
                x: canvas.width/logic.constants.laneCount*utils.randomRange(0, logic.constants.laneCount), 
                y: -logic.carParts.constants.carHeight
            });
        }

        constructor(position) {
            super();
            this.position = position;
            this.verticalSpeed = 2;            
        }

        physicalParts() {
            return logic.carParts.facingUp(this.position, this.color);
        }
    };

    logic.onScreenCars = (cars) => {
        const carIsOnScreen = (car) => car.position.y < -logic.constants.mapHeight;
        return cars.filter(carIsOnScreen);
    };

    logic.rectanglesAreOverlapped = (rect1, rect2) => {
        return logic.internal.rectanglePoints(rect1).some(point => logic.internal.pointIsInsideRectangle(point, rect2)) ||
               logic.internal.rectanglePoints(rect2).some(point => logic.internal.pointIsInsideRectangle(point, rect1));
    };

    logic.internal.pointIsInsideRectangle = (point, rect) => {
        const upperLeftRectPoint = logic.internal.upperLeftPoint(rect);
        const lowerRightRectPoint = logic.internal.lowerRightPoint(rect);
        return (point.x > upperLeftRectPoint.x && point.x < lowerRightRectPoint.x) &&
               (point.y > upperLeftRectPoint.y && point.y < lowerRightRectPoint.y);
    };

    logic.internal.upperLeftPoint = (rect) => {
        return {x: rect.x, y: rect.y};
    };

    logic.internal.upperRightPoint = (rect) => {
        return {x: rect.x+rect.width, y: rect.y};
    };

    logic.internal.lowerLeftPoint = (rect) => {
        return {x: rect.x, y: rect.y+rect.height};
    };

    logic.internal.lowerRightPoint = (rect) => {
        return {x: rect.x+rect.width, y: rect.y+rect.height};
    };

    logic.internal.rectanglePoints = (rectangle) => [
        logic.internal.upperLeftPoint(rectangle),
        logic.internal.upperRightPoint(rectangle),
        logic.internal.lowerLeftPoint(rectangle),
        logic.internal.lowerRightPoint(rectangle)
    ];

    logic.carsCrashed = (c1, c2) => {
        for (const part1 of c1.physicalParts())
            for (const part2 of c2.physicalParts())
                if (logic.rectanglesAreOverlapped(part1.rect, part2.rect))
                    return true;
        return false;
    };

    logic.activeObjects = (objects) => {
        const isActive = (object) => object.position.y < logic.constants.mapHeight;
        return objects.filter(isActive);
    };

    logic.VerticalRelativitySystem = class {
        static relativeTo({object, verticalSpeed}) {
            return new logic.VerticalRelativitySystem({object, verticalSpeed});
        }

        constructor(centerObject) {
            this.centerObject = centerObject;
            this.elements = [];
        }

        addElements(elementArray) {
            this.elements.push(...elementArray);
        }

        moveElements() {
            for (const element of this.elements)
                element.position.y += this.centerObject.verticalSpeed-element.verticalSpeed;
        }
    };

    logic.Game = class {
        constructor({gameOverChecker, onGameOver}) {
            this.eachFrameCallbacks = [];
            this.gameOverChecker = gameOverChecker;
            this.onGameOver = onGameOver;
            this.gameOver = false;
        }

        run() {
            utils.runInBackground(() => {
                if (!this.gameOver) {
                    this.callEachFrameCallbacks();
                    this.checkGameOver();
                }
            });
        }

        checkGameOver() {
            if (this.gameOverChecker()) {
                this.gameOver = true;
                this.onGameOver();
            }
        }

        callEachFrameCallbacks() {
            for (const callback of this.eachFrameCallbacks)
                callback();
        }

        addEachFrameCallback(callback) {
            this.eachFrameCallbacks.push(callback);
            return this;
        }

        runEveryCalculated(task, milliseconds) {
            utils.runEveryCalculated(() => {
                if (!this.gameOver)
                    task();
            }, milliseconds)
        }
    };

    logic.decorations.constants = {};

    logic.decorations.constants.roadDrawingWidth = 30;
    logic.decorations.constants.roadDrawingHeight = 120;

    logic.decorations.RoadDrawing = class {
        static atDefaultPosition() {
            return new logic.decorations.RoadDrawing({
                x: logic.constants.mapWidth/2-logic.decorations.constants.roadDrawingWidth/2,
                y: -logic.decorations.constants.roadDrawingHeight
            });
        }

        constructor(position) {
            this.position = position;
            this.color = 'grey';
            this.verticalSpeed = 0;
        }

        get rect() {
            return {
                x: this.position.x,
                y: this.position.y,
                width: logic.decorations.constants.roadDrawingWidth,
                height: logic.decorations.constants.roadDrawingHeight
            };
        }
    };

    logic.constants.cookieHighScoreKey = 'highscore';

    logic.highScore = (cookie) => {
        return cookie.read(logic.constants.cookieHighScoreKey);
    };

    logic.setHighScore = (cookie, highScore) => {
        cookie.write(logic.constants.cookieHighScoreKey, highScore);
    };

    return logic;
});