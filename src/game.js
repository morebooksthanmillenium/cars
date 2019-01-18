'use strict';

require(['src/graphics', 'src/logic', 'src/utils', 'src/cookies'], 
        (graphics, logic, utils, cookies) => {
    const setupControlButton = game => {
        const controlButton = document.getElementById('controlButton');
        controlButton.innerHTML = 'Start';
        controlButton.onclick = () => {
            game.run();
            controlButton.hidden = true;
            controlButton.innerHTML = 'Restart'

            controlButton.onclick = () => {
                controlButton.hidden = true;
                game.reset();
            };
        };

        return controlButton;
    };

    const main = () => {
        const canvas = new graphics.Canvas(document);

        canvas.width = logic.constants.mapWidth;
        canvas.height = logic.constants.mapHeight;

        const drawCar = (car) => {
            for (const part of car.physicalParts())
                canvas.drawRect(part.rect, part.color);
        };

        let playerCar = logic.PlayerCar.atDefaultPosition();
        let enemyCars = [];

        const drawPlayerCar = () => {
            drawCar(playerCar);
        };

        const drawEnemyCars = () => {
            for (const enemyCar of enemyCars)
                drawCar(enemyCar);
        };

        const crashHasHappened = () => {
            for (const enemyCar of enemyCars)
                if (logic.carsCrashed(enemyCar, playerCar))
                    return true;
            return false;
        };

        let decorations = [];

        const drawDecorations = () => {
            for (const decoration of decorations)
                canvas.drawRect(decoration.rect, decoration.color);
        };

        const resetCallback = () => {
            playerCar = logic.PlayerCar.atDefaultPosition();
            enemyCars = [];
            keyHandler = new logic.KeyHandler(['ArrowLeft', 'ArrowRight'], document);
            clearCanvas();
        };

        let distanceTraveled = 0;

        const calculateScore = () => Math.floor(distanceTraveled/1000);

        const cookie = new cookies.Cookie(document);

        const showScore = () => {
            const score = calculateScore();
            const highScore = logic.highScore(cookie);
            console.log('High score: '+highScore);
            let outputText = `Final score: ${score}.`;
            if (!highScore || score > highScore) {
                logic.setHighScore(cookie, score);
                outputText = 'New high score!\n'+outputText;
            }
            alert(outputText);
        };

        const clearCanvas = () => {
            const backgroundColor = '#E6E6F5';
            canvas.clear(backgroundColor);
        }

        const moveAllObjects = () => {
            playerCar.updateSpeedBasedOnDistanceTraveled(distanceTraveled);

            const relativitySystem = logic.VerticalRelativitySystem.relativeTo(playerCar);
            
            relativitySystem.addElements(enemyCars);
            relativitySystem.addElements(decorations);
            
            // This could be filtered out into a separate function
            if (keyHandler.keyIsDown('ArrowLeft'))
                playerCar.moveLeft(0);
            if (keyHandler.keyIsDown('ArrowRight'))
                playerCar.moveRight(logic.constants.mapWidth-logic.carParts.constants.carWidth);

            relativitySystem.moveElements();

            distanceTraveled += playerCar.verticalSpeed;
        };

        const destroyOffscreenObjects = () => {
            enemyCars = logic.activeObjects(enemyCars);
            decorations = logic.activeObjects(decorations);
        };

        const drawEverything = () => {
            drawDecorations();
            drawPlayerCar();
            drawEnemyCars();
        };

        let keyHandler = new logic.KeyHandler(['ArrowLeft', 'ArrowRight'], document);

        const onGameOver = () => {
            controlButton.hidden = false;
            showScore();
        }

        const game = new logic.Game({
            gameOverChecker: crashHasHappened,
            onGameOver,
            resetCallback
        });

        const controlButton = setupControlButton(game);

        game.addEachFrameCallback(clearCanvas)
            .addEachFrameCallback(moveAllObjects)
            .addEachFrameCallback(destroyOffscreenObjects)
            .addEachFrameCallback(drawEverything);
        
        game.runEveryCalculated(
            () => enemyCars.push(logic.EnemyCar.atRandomPosition()), 
            () => 4800/playerCar.verticalSpeed);
        
        game.runEveryCalculated(
            () => decorations.push(logic.decorations.RoadDrawing.atDefaultPosition()),
            () => 2000/playerCar.verticalSpeed);
        
        clearCanvas();
    };

    main();
});
