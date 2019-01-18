'use strict';

require(['src/graphics', 'src/logic', 'src/utils', 'src/cookies'], 
        (graphics, logic, utils, cookies) => {
    const main = () => {
        const canvas = new graphics.Canvas(document);

        canvas.width = logic.constants.mapWidth;
        canvas.height = logic.constants.mapHeight;

        const drawCar = (car) => {
            for (const part of car.physicalParts())
                canvas.drawRect(part.rect, part.color);
        };

        const playerCar = logic.PlayerCar.atDefaultPosition();
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

        let distanceTraveled = 0;

        const scoreBasedOnDistanceTraveled = () => Math.floor(distanceTraveled/1000);

        const cookie = new cookies.Cookie(document);

        const showScore = () => {
            const score = scoreBasedOnDistanceTraveled();
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

        const keyHandler = new logic.KeyHandler(['ArrowLeft', 'ArrowRight'], document);

        const game = new logic.Game({
            gameOverChecker: crashHasHappened,
            onGameOver: showScore
        });

        game.addEachFrameCallback(clearCanvas)
            .addEachFrameCallback(moveAllObjects)
            .addEachFrameCallback(destroyOffscreenObjects)
            .addEachFrameCallback(drawEverything);
        
        game.runEveryCalculated(
            () => enemyCars.push(logic.EnemyCar.atRandomPosition()), 
            () => 2800/playerCar.verticalSpeed);
        
        game.runEveryCalculated(
            () => decorations.push(logic.decorations.RoadDrawing.atDefaultPosition()),
            () => 2000/playerCar.verticalSpeed);

        game.run();
    };

    main();
});
