'use strict';

require(['src/graphics', 'src/logic', 'src/utils', 'src/cookies'],
        (graphics, logic, utils, cookies) => {
    const game = {};

    game.setupControlButton = carsGame => {
        const controlButton = document.getElementById('controlButton');
        controlButton.innerHTML = 'Go';
        controlButton.onclick = () => {
            carsGame.run();
            controlButton.hidden = true;
            controlButton.innerHTML = 'Restart'

            controlButton.onclick = () => {
                controlButton.hidden = true;
                carsGame.reset();
            };
        };
    };

    game.CarsGame = class {
        constructor(canvas) {
            this.canvas = canvas;
            this.gameOver = false;
            this.distanceTraveled = 0;
            this.playerCar = logic.PlayerCar.atDefaultPosition();
            this.enemyCars = [];
            this.decorations = [];
            this.keyHandler = new logic.KeyHandler(['ArrowLeft', 'ArrowRight'], document);
        }

        clearCanvas() {
            const backgroundColor = '#E6E6F5';
            this.canvas.clear(backgroundColor);
        }

        run() {
            this.runEveryCalculated(
                () => this.enemyCars.push(logic.EnemyCar.atRandomPosition()), 
                () => 5800/this.playerCar.verticalSpeed);
            
            this.runEveryCalculated(
                () => this.decorations.push(logic.decorations.RoadDrawing.atDefaultPosition()),
                () => 2000/this.playerCar.verticalSpeed);

            utils.runInBackground(() => {
                if (!this.gameOver) {
                    this.clearCanvas();
                    this.moveAllObjects();
                    this.destroyOffscreenObjects();
                    this.drawEverything();
                    this.checkGameOver();
                }
            });
        }

        moveAllObjects() {
            this.playerCar.updateSpeedBasedOnDistanceTraveled(this.distanceTraveled);

            const relativitySystem = logic.VerticalRelativitySystem.relativeTo(this.playerCar);
            
            relativitySystem.addElements(this.enemyCars);
            relativitySystem.addElements(this.decorations);
            
            // This could be filtered out into a separate function
            if (this.keyHandler.keyIsDown('ArrowLeft'))
                this.playerCar.moveLeft(0);
            if (this.keyHandler.keyIsDown('ArrowRight'))
                this.playerCar.moveRight(logic.constants.mapWidth - logic.carParts.constants.carWidth);

            relativitySystem.moveElements();

            this.distanceTraveled += this.playerCar.verticalSpeed;
        }

        destroyOffscreenObjects() {
            this.enemyCars = logic.activeObjects(this.enemyCars);
            this.decorations = logic.activeObjects(this.decorations);
        }

        drawEverything() {
            this.drawDecorations();
            this.drawPlayerCar();
            this.drawEnemyCars();
        }

        drawDecorations() {
            for (const decoration of this.decorations)
                this.canvas.drawRect(decoration.rect, decoration.color);
        }

        drawPlayerCar() {
            this.drawCar(this.playerCar);
        }

        drawEnemyCars() {
            for (const enemyCar of this.enemyCars)
                this.drawCar(enemyCar);
        }

        drawCar(car) {
            for (const part of car.physicalParts())
                this.canvas.drawRect(part.rect, part.color);
        }

        checkGameOver() {
            if (this.crashHasHappened()) {
                this.gameOver = true;
                this.onGameOver();
            }
        }

        onGameOver() {
            controlButton.hidden = false;
            this.showScore();
        }

        showScore() {
            const cookie = new cookies.Cookie(document);
            const score = this.score;
            const highScore = logic.highScore(cookie);
            console.log(`High score: ${highScore}`);
            let outputText = `Final score: ${score}.`;
            if (!highScore || score > highScore) {
                logic.setHighScore(cookie, score);
                outputText = `New high score!\n${outputText}`;
            }
            alert(outputText);
        }

        crashHasHappened() {
            for (const enemyCar of this.enemyCars)
                if (logic.carsCrashed(enemyCar, this.playerCar))
                    return true;
            return false;
        }

        runEveryCalculated(task, milliseconds) {
            utils.runEveryCalculated(() => {
                if (!this.gameOver)
                    task();
            }, milliseconds)
        }

        reset() {
            this.gameOver = false;
            this.distanceTraveled = 0;
            this.playerCar = logic.PlayerCar.atDefaultPosition();
            this.keyHandler = new logic.KeyHandler(['ArrowLeft', 'ArrowRight'], document);
            this.enemyCars = [];
            this.decorations = [];
            this.clearCanvas();
        }

        get score() {
            return Math.floor(this.distanceTraveled/1000);
        }
    };

    const carsGame = new game.CarsGame(
        new graphics.Canvas(document, {width: logic.constants.mapWidth, height: logic.constants.mapHeight}));
    game.setupControlButton(carsGame);
    carsGame.clearCanvas();
});
