/* eslint-env node */
module.exports = {
  description: '',
  normalizeEntityName: function() {},
  afterInstall: function() {
     return this.addPackageToProject('iltorb');
  }
};
