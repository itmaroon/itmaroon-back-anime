// webpack.config.js in your project root
const path = require('path');
const fs = require('fs');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

//プロジェクト内フォルダのファイル一覧プラグイン
class FileListPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      const directoryPath = path.join(__dirname, '/assets/img');
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          return callback(err);
        }
        const fileList = JSON.stringify(files);
        compilation.assets['fileList.json'] = {
          source: function () {
            return fileList;
          },
          size: function () {
            return fileList.length;
          }
        };
        callback();
      });
    });
  }
}


module.exports = async () => {
  defaultConfig.plugins.push(new FileListPlugin());
  return defaultConfig;
};