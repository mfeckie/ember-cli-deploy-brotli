/* eslint-env node */
module.exports = {
  description: '',
  afterInstall: function() {
     return this.addPackageToProject('iltorb');
  }
};
