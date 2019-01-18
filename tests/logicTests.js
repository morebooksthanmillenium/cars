'use strict';

define(['tests/unitTesting.js', 'src/logic'], (unitTesting, logic) => {
    const logicTests = {};
    const unitTestingExtensions = {};

    unitTestingExtensions.assertPointsAreEqual = (p1, p2) => unitTesting.assertTrue(logic.pointsAreEqual(p1, p2));
    
    unitTestingExtensions.assertPointsAreNotEqual = (p1, p2) => unitTesting.assertFalse(logic.pointsAreEqual(p1, p2));

    logicTests.pointsAreEqualTest = () => {
        unitTestingExtensions.assertPointsAreEqual(
            {x: 33, y: -2}, 
            {x: 33, y: -2}
        );

        unitTestingExtensions.assertPointsAreNotEqual(
            {x: 1, y: 42},
            {x: 2, y: 42}
        );

        unitTestingExtensions.assertPointsAreNotEqual(
            {x: 1, y: 42},
            {x: 1, y: 43}
        );

        unitTestingExtensions.assertPointsAreNotEqual(
            {x: 1, y: 42},
            {x: 2, y: 43}
        );
    };

    logicTests.pointsAddedTest = () => {
        const testAdditionFor = ({point1, point2, result}) => unitTestingExtensions.assertPointsAreEqual(
            logic.pointsAdded(point1, point2), result
        );

        testAdditionFor({
            point1: {x: 1, y: 1}, 
            point2: {x: 1, y: 1},
            result: {x: 2, y: 2}
        });

        testAdditionFor({
            point1: {x: -1, y: 1}, 
            point2: {x: 1, y: 1},
            result: {x: 0, y: 2}
        });

        testAdditionFor({
            point1: {x: -1, y: -1}, 
            point2: {x: -1, y: -1},
            result: {x: -2, y: -2}
        });
    };

    logicTests.pointsSubtractedTest = () => {
        const testSubtractionFor = ({point1, point2, result}) => unitTestingExtensions.assertPointsAreEqual(
            logic.pointsSubtracted(point1, point2), result
        );

        testSubtractionFor({
            point1: {x: 1, y: 1}, 
            point2: {x: 1, y: 1},
            result: {x: 0, y: 0}
        });

        testSubtractionFor({
            point1: {x: -1, y: 1}, 
            point2: {x: 1,  y: 1},
            result: {x: -2, y: 0}
        });

        testSubtractionFor({
            point1: {x: -1, y: -1}, 
            point2: {x: -1, y: -1},
            result: {x: 0,  y: 0}
        });
    };

    logicTests.internalKeyTrackerTest = () => {
        const keyTracker = new logic.internal.KeyTracker();
        
        unitTesting.assertFalse(keyTracker.keyIsDown('Enter'));
        unitTesting.assertFalse(keyTracker.keyIsDown('ArrowUp'));

        keyTracker.setKeyDown('Enter');

        unitTesting.assertTrue(keyTracker.keyIsDown('Enter'));
        unitTesting.assertFalse(keyTracker.keyIsDown('ArrowUp'));

        keyTracker.setKeyUp('Enter');
        keyTracker.setKeyDown('ArrowUp');

        unitTesting.assertFalse(keyTracker.keyIsDown('Enter'));
        unitTesting.assertTrue(keyTracker.keyIsDown('ArrowUp'));

        keyTracker.setKeyDown('Enter');

        unitTesting.assertTrue(keyTracker.keyIsDown('Enter'));
        unitTesting.assertTrue(keyTracker.keyIsDown('ArrowUp'));
    };

    logicTests.rectanglePointsTest = () => {
        const rect = {
            x: 5, 
            y: 5,
            width: 10,
            height: 15
        };

        unitTestingExtensions.assertPointsAreEqual(logic.internal.upperLeftPoint(rect), {x: 5, y: 5});
        unitTestingExtensions.assertPointsAreEqual(logic.internal.upperRightPoint(rect), {x: 15, y: 5});
        unitTestingExtensions.assertPointsAreEqual(logic.internal.lowerLeftPoint(rect), {x: 5, y: 20});
        unitTestingExtensions.assertPointsAreEqual(logic.internal.lowerRightPoint(rect), {x: 15, y: 20});
    };

    logicTests.internalPointIsInsideRectangleTest = () => {
        const rect = {
            x: 5, 
            y: 5,
            width: 10,
            height: 15
        };

        const testAgainstRect = (point, result) => unitTesting.assertEqual(
            logic.internal.pointIsInsideRectangle(point, rect), result
        );

        testAgainstRect({x: 5, y: 5}, false);
        testAgainstRect({x: 4, y: 5}, false);
        testAgainstRect({x: 5, y: 4}, false);
        testAgainstRect({x: 4, y: 4}, false);
        testAgainstRect({x: 5, y: 6}, false);
        testAgainstRect({x: 6, y: 5}, false);
        testAgainstRect({x: 6, y: 6}, true);
        
        testAgainstRect({x: 12, y: 6}, true);
        testAgainstRect({x: 6, y: 12}, true);

        testAgainstRect({x: 15, y: 20}, false);
        testAgainstRect({x: 16, y: 20}, false);
        testAgainstRect({x: 15, y: 21}, false);
        testAgainstRect({x: 16, y: 21}, false);
        testAgainstRect({x: 14, y: 20}, false);
        testAgainstRect({x: 15, y: 19}, false);
        testAgainstRect({x: 14, y: 19}, true);
    };

    logicTests.rectanglesAreOverlappedTest = () => {
        const rect = {
            x: 5, 
            y: 5,
            width: 10,
            height: 15
        };

        const testAgainstRect = (rect2, result) => unitTesting.assertEqual(
            logic.rectanglesAreOverlapped(rect, rect2), result
        );

        const testFromUpperLeft = () => {
            testAgainstRect({
                x: 0,
                y: 0,
                width: 5,
                height: 5
            }, false);

            testAgainstRect({
                x: 0,
                y: 0,
                width: 4,
                height: 4
            }, false);

            testAgainstRect({
                x: 0,
                y: 0,
                width: 5,
                height: 4
            }, false);

            testAgainstRect({
                x: 0,
                y: 0,
                width: 4,
                height: 5
            }, false);

            testAgainstRect({
                x: 0,
                y: 0,
                width: 6,
                height: 5
            }, false);

            testAgainstRect({
                x: 0,
                y: 0,
                width: 5,
                height: 6
            }, false);

            testAgainstRect({
                x: 0,
                y: 0,
                width: 6,
                height: 6
            }, true);
        };

        const testFromUpperRight = () => {
            testAgainstRect({
                x: 15,
                y: 0,
                width: 5,
                height: 5
            }, false);

            testAgainstRect({
                x: 15,
                y: 0,
                width: 5,
                height: 4
            }, false);

            testAgainstRect({
                x: 15,
                y: 0,
                width: 5,
                height: 6
            }, false);

            testAgainstRect({
                x: 15,
                y: 0,
                width: 5,
                height: 4
            }, false);
        };

        const testFromLowerLeft = () => {
            testAgainstRect({
                x: 5,
                y: 20,
                width: 1,
                height: 1
            }, false);

            testAgainstRect({
                x: 5,
                y: 20,
                width: 2,
                height: 2
            }, false);

            testAgainstRect({
                x: 5,
                y: 19,
                width: 2,
                height: 2
            }, true);

            testAgainstRect({
                x: 4,
                y: 20,
                width: 1,
                height: 1
            }, false);

            testAgainstRect({
                x: 3,
                y: 20,
                width: 1,
                height: 1
            }, false);

            testAgainstRect({
                x: 5,
                y: 21,
                width: 3,
                height: 3
            }, false);

            testAgainstRect({
                x: 5,
                y: 19,
                width: 1,
                height: 1
            }, true);
        };

        const testFromLowerRight = () => {
            testAgainstRect({
                x: 15,
                y: 20,
                width: 1,
                height: 1
            }, false);

            testAgainstRect({
                x: 16,
                y: 20,
                width: 1,
                height: 1
            }, false);

            testAgainstRect({
                x: 5,
                y: 21,
                width: 1,
                height: 1
            }, false);
        };

        const testArbitrary = () => {
            testAgainstRect({
                x: 10,
                y: 0,
                width: 5,
                height: 5
            }, false);

            testAgainstRect({
                x: 10,
                y: 0,
                width: 4,
                height: 5
            }, false);
        };

        testFromUpperLeft();
        testFromLowerLeft();
        testFromUpperRight();
        testFromLowerRight();
        testArbitrary();
    };

    return logicTests;
});
