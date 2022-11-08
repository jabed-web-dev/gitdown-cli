const { resolve } = require('path')
const downloadFiles = require('./downloadFiles')
const formatSize = require('./formatSize');


async function gitDown(baseurl, basedir, dirPath) {
    try {
        let _rootDir = ''

        if (dirPath && dirPath.match(/\/$/)) {
            basedir = resolve(dirPath.replace(/\/$/, ''))
        } else if (dirPath && dirPath !== '.') {
            let { prePath, rootDir = '' } = dirPath.match(/^(?<prePath>.*(?=\/))?\/?(?<rootDir>.+?)$/).groups;
            prePath && (basedir = resolve(prePath))
            _rootDir = rootDir
        }
        let progress = ['|', '/', '—', '\\'], i = 0;

        downloadFiles(baseurl, basedir, _rootDir, dirPath, (totalFiles, totalDownloadFiles, size, done, repo) => {
            let logStr = `\x1B[0;36m${progress[i++]}\x1B[1;0m Receiving files: \x1B[0;33m${totalFiles}/${totalDownloadFiles}\x1B[1;0m Size:\x1B[0;33m ${formatSize(size, repo)}\x1B[1;0m`
            i = i >= progress.length ? 0 : i;
            
            process.stderr.cursorTo(0);
            process.stderr.write(logStr);
            process.stderr.clearLine(1);
            if (done && totalFiles === totalDownloadFiles) {
                console.log(`\n✅ \x1B[0;32mDownload completed\x1B[1;0m`)
            }
        })

    } catch (err) {
        console.log(`${err.name}: ${err.message}`)
    }
}

module.exports = gitDown