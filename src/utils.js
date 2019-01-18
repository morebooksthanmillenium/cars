'use strict';

define(() => {
    const utils = {};

    utils.contains = (array, element) => array.indexOf(element) !== -1;

    utils.runEveryCalculated = (task, millisecondsGetter) => {
        setTimeout(() => {
            utils.runEveryCalculated(task, millisecondsGetter);
            task();
        }, millisecondsGetter());
    };

    utils.runEvery = (task, milliseconds) => utils.runEveryCalculated(task, () => milliseconds);

    utils.runInBackground = (task) => utils.runEvery(task, 0);

    utils.randomElement = (array) => array[utils.randomRange(0, array.length)];
    
    utils.randomRange = (from, to) => from + Math.floor(Math.random() * (to-from));

    return utils;
});
