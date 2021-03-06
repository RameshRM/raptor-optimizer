'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');

var dust = require('dustjs-linkedin');
dust.onLoad = function(path, callback) {
    if (!fs.existsSync(path)) {
        if (!path.endsWith('.dust')) {
            path += '.dust';
        }
    }

    fs.readFile(path, 'utf-8', callback);
};


require('../dust').registerHelpers(dust);

function testRender(path, data, done, options) {
    var inputPath = nodePath.join(__dirname, path);
    var expectedPath = nodePath.join(__dirname, path + '.expected.html');
    var actualPath = nodePath.join(__dirname, path + '.actual.html');
    options = options || {};
    // var compiledPath = nodePath.join(__dirname, path + '.actual.js');
    // var compiler = require('raptor-templates/compiler').createCompiler(inputPath);
    // var src = fs.readFileSync(inputPath, {encoding: 'utf8'});
    
    // var compiledSrc = compiler.compile(src);
    // fs.writeFileSync(compiledPath, compiledSrc, {encoding: 'utf8'});

    
    

    dust.render(inputPath, data, function(err, output) {
        if (err) {
            return done(err);
        }

        try {
            fs.writeFileSync(actualPath, output, {encoding: 'utf8'});

            var expected;
            try {
                expected = options.expected || fs.readFileSync(expectedPath, {encoding: 'utf8'});
            }
            catch(e) {
                expected = 'TBD';
                fs.writeFileSync(expectedPath, expected, {encoding: 'utf8'});
            }

            if (output !== expected) {
                throw new Error('Unexpected output for "' + inputPath + '":\nEXPECTED (' + expectedPath + '):\n---------\n' + expected +
                    '\n---------\nACTUAL (' + actualPath + '):\n---------\n' + output + '\n---------');
            }
            done();
        } catch(e) {
            return done(e);
        }
    }); 
}

require('raptor-logging').configureLoggers({
    'raptor-optimizer': 'DEBUG'
});



describe('raptor-optimizer/taglib' , function() {

    beforeEach(function(done) {
        require('../').configure({
            fileWriter: {
                outputDir: nodePath.join(__dirname, 'build'),
                urlPrefix: '/static',
                includeSlotNames: false,
                checksumsEnabled: false
            },
            enabledExtensions: ['browser']
        }, __dirname);

        done();
    });

    // it('should compile a simple page template', function() {
    //     testCompiler('test-project/src/pages/page1.rhtml');
    // });

    it.only('should render a simple page template', function(done) {
        testRender('test-project/src/pages/page1/template.dust', {
            packagePath: nodePath.join(__dirname, 'test-project/src/pages/page1/optimizer.json')
        }, done);
    });

});

