var dependencyWalker = require('./dependency-walker');
var DependencyTree = require('./DependencyTree');
var logger = require('raptor-logging').logger(module);
var promises = require('raptor-promises');

var recurseHandlers = {
    none: function(rootDependency, context) {
        return {
            shouldIncludeDependency: function(dependency) {
                return false;
            },

            shouldRecurseIntoPackageDependency: function(dependency) {
                return false;
            }
        };
    },

    all: function(rootDependency, context) {

        return {
            shouldIncludeDependency: function(dependency) {
                return true;
            },

            shouldRecurseIntoPackageDependency: function(dependency) {
                return true;
            }
        };
    },

    dir: function(rootDependency, context) {

        var baseDir = rootDependency.getDir(context) || '';

        return {
            shouldIncludeDependency: function(dependency) {
                var dir = dependency.getDir(context);
                return dir === baseDir;
            },

            shouldRecurseIntoPackageDependency: function(dependency) {
                if (dependency.getDir(context) === baseDir) {
                    return true;
                }

                return false;
            }
        };
    },

    dirtree: function(rootDependency, context) {

        var baseDir = rootDependency.getDir(context);

        function checkDir(dependency) {
            if (!baseDir) {
                return false;
            }

            var dir = dependency.getDir(context);
            if (!dir) {
                return false;
            }

            return dir.startsWith(baseDir);
        }

        return {
            shouldIncludeDependency: function(dependency) {
                return checkDir(dependency);
            },

            shouldRecurseIntoPackageDependency: function(dependency) {
                return checkDir(dependency);
            }
        };
    }
};

function buildBundle(bundleMappings, dependencyRegistry, bundleConfig) {
    var promiseChain = promises.resolved();
    var tree = logger.isInfoEnabled() ? new DependencyTree() : null;
    var context = bundleMappings.context;
    var enabledExtensions = bundleMappings.enabledExtensions;

    var dependencies = bundleConfig.getDependencies(dependencyRegistry);
    var targetBundleName = bundleConfig.name;

    dependencies.forEach(function(rootDependency) {
        promiseChain = promiseChain.then(function() {

            var recurseInto = rootDependency._recurseInto;

            if (!recurseInto) {
                recurseInto = 'dirtree';
            }

            if (!recurseHandlers[recurseInto]) {
                throw new Error('Invalid recursion option: ' + recurseInto);
            }

            var recurseHandler = recurseHandlers[recurseInto](rootDependency, context);

            function shouldIncludeDependency(dependency) {
                if (dependency === rootDependency ||
                        (context.parentDependency && context.parentDependency === rootDependency)) {
                    // Always include the root dependency or any child dependencies if the top-level
                    // dependency was a package
                    return true;
                }

                return recurseHandler.shouldIncludeDependency(dependency);
            }

            function shouldRecurseIntoPackageDependency(dependency) {
                if (dependency === rootDependency) {
                    // Always recurse into top-level package dependencies
                    return true;
                }

                return recurseHandler.shouldRecurseIntoPackageDependency(dependency);
            }

            return dependencyWalker.walk({
                context: context,
                dependency: rootDependency,
                enabledExtensions: enabledExtensions,
                shouldSkipDependency: function(dependency, walkContext) {
                    if (walkContext.async) {
                        return true;
                    }

                    if (bundleMappings.getBundleForDependency(dependency)) {
                        // The dependency has already been added to another bundle
                        return true;
                    }

                    if (dependency.isPackageDependency()) {
                        return !shouldRecurseIntoPackageDependency(dependency);
                    }

                    return false;
                },
                on: {
                    dependency: function(dependency, context) {
                        if (dependency.isPackageDependency()) {
                            if (tree) {
                                tree.add(dependency, context.parentDependency);
                            }

                            // We are only interested in non-package dependencies
                            return;
                        }

                        if (shouldIncludeDependency(dependency)) {
                            bundleMappings.addDependencyToBundle(dependency, targetBundleName, context.slot, bundleConfig);
                            if (tree) {
                                tree.add(dependency, context.parentDependency);    
                            }
                            
                        }
                    }
                }
            });
        });
    });

    return promiseChain
        .then(function() {
            if (tree) {
                logger.info('Bundle "' + targetBundleName + '":\n' + tree.toString());    
            }
        });
}

exports.buildBundle = buildBundle;