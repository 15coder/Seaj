const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function fixGradleJvmArgs(config) {
  return withGradleProperties(config, (modConfig) => {
    modConfig.modResults = modConfig.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'org.gradle.jvmargs')
    );
    modConfig.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError -Xmx4g -Dfile.encoding=UTF-8',
    });
    return modConfig;
  });
};
