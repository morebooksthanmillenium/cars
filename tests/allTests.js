'use strict';

require(['tests/unitTesting', 'tests/logicTests', 'tests/utilsTests'], 
        (unitTesting, logicTests, utilsTests) => {
    const testSuites = {logicTests, utilsTests};
    unitTesting.runEachTestSuite(testSuites);
});
