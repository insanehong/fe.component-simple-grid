// Karma configuration
// Generated on Mon Aug 25 2014 20:26:51 GMT+0900 (KST)
function setConfig(configDefault, isDev) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    if (isDev) {
        configDefault.browsers = [
            'Chrome'
        ];
    } else {
        configDefault.browsers = [
            'IE7',
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
        ];
        configDefault.customLaunchers = {
            'IE7': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE7'
            },
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE8'
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE9'
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE10'
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE11'
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            },
            'Firefox-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'firefox'
            }
        };
    }
}

module.exports = function(config) {
    var configDefault = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // dependencies
            {pattern: 'src/external/*.js', watched: false, served: true, included: true},
            {pattern: 'lib/jquery/jquery.min.js', watched: false, served: true, included: true},
            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false, served: true, included: true},
            {pattern: 'test/js/data/*.js', watched: false, served: true, included: true},
            {pattern: 'src/core/*.js', watched: false, served: true, included: true},
            {pattern: 'src/data/*.js', watched: false, served: true, included: true},
            {pattern: 'src/model/*.js', watched: false, served: true, included: true},
            {pattern: 'src/view/*.js', watched: false, served: true, included: true},
            {pattern: 'src/*.js', watched: false, served: true, included: true},

            // fixtures
            {pattern: 'test/fixtures/*.html', watched: true, served: true, included: false},
            {pattern: 'src/css/*.css', watched: true, served: true, included: false},

            // files to test
            {pattern: 'test/js/*.test.js', watched: true, served: true, included: true}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/!(external)/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
//        reporters: ['progress', 'coverage'],
        reporters: ['dots', 'coverage', 'junit'],
        junitReporter: {
            outputFile: 'report/junit-result.xml',
            suite: ''
        },
        coverageReporter: {
            type: 'html',
            dir: 'report/coverage/'
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    };

    setConfig(configDefault, false);
    config.set(configDefault);
};
