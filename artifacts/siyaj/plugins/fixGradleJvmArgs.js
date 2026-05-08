const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function fixGradleJvmArgs(config) {
  return withGradleProperties(config, (modConfig) => {
    modConfig.modResults = modConfig.modResults.map((item) => {
      if (item.type === 'property' && item.key === 'org.gradle.jvmargs') {
        item.value = item.value
          .replace(/-XX:MaxPermSize=\S+/g, '')
          .replace(/-XX:MaxMetaspaceSize=\S+/g, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      }
      return item;
    });
    return modConfig;
  });
};
