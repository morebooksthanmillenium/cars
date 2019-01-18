'use strict';

define(['tests/unitTesting', 'src/utils'], (unitTesting, utils) => {
    const utilsTests = {};

    utilsTests.containsTest = () => {
        unitTesting.assertTrue(utils.contains([1, 2, 3, 4], 3));
        unitTesting.assertFalse(utils.contains([1, 2, 3], 10));
    }

    return utilsTests;
});
