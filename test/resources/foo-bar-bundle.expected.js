$rmod.def("/baz@3.0.0/lib/index", function(require, exports, module, __filename, __dirname) { exports.baz = "3.0.0"; });
$rmod.dep("/$/foo", "baz", "3.0.0");
$rmod.main("/baz@3.0.0", "lib/index");
$rmod.def("/require@4.0.0/baz/index", function(require, exports, module, __filename, __dirname) { exports.baz = true; });
$rmod.dep("", "require", "4.0.0");
$rmod.main("/require@4.0.0/baz", "index");
$rmod.def("/foo@1.0.0/lib/index", function(require, exports, module, __filename, __dirname) { exports.foo = "1.0.0";
require('baz');
require('require/baz'); });
$rmod.dep("", "foo", "1.0.0");
$rmod.main("/foo@1.0.0", "lib/index");
$rmod.dep("/$/bar", "baz", "3.0.0");
$rmod.def("/bar@2.0.0/lib/bar", function(require, exports, module, __filename, __dirname) { exports.bar = "2.0.0";
require('baz'); });
$rmod.dep("", "bar", "2.0.0");
$rmod.main("/bar@2.0.0", "lib/bar");