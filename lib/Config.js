var extend = require('raptor-util').extend;
var BundleSetConfig = require('./BundleSetConfig');
var extensions = require('./extensions');
var ok = require('assert').ok;

function Config(params) {
    this.configResource = null;
    
    this.bundlingEnabled = true;
    
    this.projectRoot = null;


    this.minifyJs = false;
    this.minifyCss = false;

    
    this.enabledExtensions = extensions.createExtensionSet();
    this.params = {};
    this.bundleSetConfigsByName = {};
    
    this.serverSourceMappings = [];
    this.pages = {};
    this.checksumLength = 8;
    this.transforms = [];
    this.bundlingEnabled = true;
    this.basePath = null;
    this.writer = null;
    this.includeSlotNameForBundles = false;
    this.plugins = [];
    this.pages = {};

    /*
     * The PageOptimizer Config does not have any wrappers enabled by default.
     * If wrappers are explicitly set then this value will be an object whose
     * keys are wrapper IDs and whose values are boolean values that indicate
     * whether or not that specific wrapper is enabled.
     */
    this.bundleWrappers = undefined;

    if (params) {
        extend(this.params, params);
    }

    this.addDefaultPlugins();
}

Config.prototype = {
    __Config: true,

    addDefaultPlugins: function() {
    },

    addPage: function(pageConfig) {
        var pageName = pageConfig.name;
        this.pages[pageName] = pageConfig;
    },

    addPlugin: function(func, config) {
        ok(func && typeof func === 'function');
        config = config || {};

        this.plugins.push({
            func: func,
            config: config
        });
    },
    

    addTransform: function(transform) {
        if (!transform) {
            throw new Error('transform is required');
        }

        if (typeof transform === 'function') {
            transform = {
                transform: transform,
                name: '(anonymous)'
            };
        }

        if (typeof transform.transform !== 'function') {
            throw new Error('Invalid transform: ' + require('util').inspect(transform));
        }

        this.transforms.push(transform);
    },
    
    getTransforms: function() {
        return this.transforms;
    },
    
    isInPlaceDeploymentEnabled: function() {
        return this.inPlaceDeploymentEnabled === true;
    },
    
    isBundlingEnabled: function() {
        return this.bundlingEnabled;
    },

    addBundleSetConfig: function(bundleSetConfig) {        
        if (!bundleSetConfig.name) {
            bundleSetConfig.name = "default";
        }
        
        if (this.bundleSetConfigsByName[bundleSetConfig.name]) {
            throw new Error('Bundles with name "' + bundleSetConfig.name + '" defined multiple times');
        }
        
        this.bundleSetConfigsByName[bundleSetConfig.name] = bundleSetConfig;
        
        return bundleSetConfig;
    },
    
    getBundleSetConfig: function(name) {
        return this.bundleSetConfigsByName[name];
    },

    enableExtension: function(name) {
        
        this.enabledExtensions.add(name);
    },
    
    getEnabledExtensions: function() {
        return this.enabledExtensions;
    },
    
    enableExtensions: function(enabledExtensions) {
        this.enabledExtensions = extensions.createExtensionSet(enabledExtensions);
    },
    
    getPageBundleSetConfig: function(pageName) {
        
        var pageConfig = this.pages[pageName];
        var bundleSetConfig = null;
        
        if (pageConfig) {
            bundleSetConfig = pageConfig.bundleSetConfig;
        }
        
        if (!bundleSetConfig) {
            bundleSetConfig = this.getBundleSetConfig("default");
            
            if (!bundleSetConfig) {
                bundleSetConfig = this.addBundleSetConfig(new BundleSetConfig('default'));
            }
        }
        
        return bundleSetConfig;
    },
    
    setInPlaceDeploymentEnabled: function(inPlaceDeploymentEnabled) {
        this.inPlaceDeploymentEnabled = inPlaceDeploymentEnabled;
    },

    setInPlaceUrlPrefix: function(inPlaceUrlPrefix) {
        this.inPlaceUrlPrefix = inPlaceUrlPrefix;
    },

    getInPlaceUrlPrefix: function() {
        return this.inPlaceUrlPrefix;
    },
    
    getBasePath: function() {
        return this.basePath;
    },
    
    setBasePath: function(basePath) {
        this.basePath = basePath;
    },

    getWriter: function() {
        return this.writer;
    },

    setWriter: function(writer) {
        this.writer = writer;
    },

    enableBundleWrapper: function(wrapperId) {
        if (!this.bundleWrappers) {
            this.bundleWrappers = {};
        }
        this.bundleWrappers[wrapperId] = true;
    },

    disableBundleWrapper: function(wrapperId) {
        if (!this.bundleWrappers) {
            this.bundleWrappers = {};
        }
        this.bundleWrappers[wrapperId] = false;
    },

    getProjectRoot: function() {
        return this.projectRoot;
    },

    setProjectRoot: function(projectRoot) {
        this.projectRoot = projectRoot;
    },

    setBundlingEnabled: function(bundlingEnabled) {
        this.bundlingEnabled = bundlingEnabled;
    },

    toString: function() {
        return '[' + __filename + ']';
    }
};

module.exports = Config;