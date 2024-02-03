const pkgFile = require('../package.json');
class SystemVal {
    constructor(){
        this.version = this.getVersion();
    }

    /**
    * @return {string} The current version of the package.
    */
    getVersion() {
        console.log('getVersion');
        return pkgFile.version;
    }
}

global.system = new SystemVal();