var nodePath = require('path');

var urlRegExp = /^(http:|https:)?\/\//;

module.exports = {
    properties: {
        'path': 'string',
        'url': 'string',
        'code': 'string'
    },

    init: function() {
        
        
        var path = this.path;

        if (!this.path && !this.url) {
            throw new Error('"path" is required for a resource dependency');
        }

        if (urlRegExp.test(path)) {
            this.url = path;
            path = null;
            delete this.path;
        }

        if (path) {
            this.path = this.resolvePath(path);
            this._dir = nodePath.dirname(this.path);    
        }
        
    },
    
    getDir: function() {
        return this._dir;
    },

    read: function(context) {
        if (this.code){
            return this.code;
        }

        if (this.url) {
            return null;
        }

        return this.readResource(this.path);
    },

    isExternalResource: function() {
        return this.url != null;
    },

    getUrl: function() {
        return this.url;
    },

    getSourceFile: function() {
        return this.path;
    },

    lastModified: function() {
        if (!this.path) {
            return -1;
        }
        
        return this.resourceLastModified(this.path);
    }
};