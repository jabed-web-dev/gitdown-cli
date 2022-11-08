const download = require('download')
const { resolve } = require('path')
const parseRepoUrl = require('./parseRepoUrl')
const getAPIs = require('./getAPIs');

async function downloadFiles(baseurl, basedir, _rootDir, _dirName, cb) {
    try {
        const { owner, repo, branch, path, prePath = '', rootDir = '' } = parseRepoUrl(baseurl)
        const apiUrl = `/repos/${owner}/${repo}${path ? '/contents/' + path : ''}${branch ? '?ref=' + branch : ''}`;
        const cwd = filePath => (_dirName === '.' || _rootDir) && path !== filePath ? rootDir + '/' : '';
        let totalFiles = 0, totalDownloadFiles = 0, totalSize = 0, done = false;

        for await (const file of getAPIs(apiUrl)) {
            let dirPath = file.path?.replace(RegExp(`^${prePath}${cwd(file.path)}(?<dirPath>.*?)\/?${file.name}$`), (m, _dirPath) => {
                return _dirPath && _rootDir ? _rootDir + '/' + _dirPath : _rootDir && path !== file.path ? _rootDir : _dirPath;
            })

            if (!path && file.type === 'repo') {
                file.download_url = `${file.download_url}/archive/${branch ? branch : file.default_branch}.zip`
                download(file.download_url, basedir, { extract: true })
                    .on('end', () => {
                        ++totalDownloadFiles
                        cb(totalFiles, totalDownloadFiles, totalSize, done, file.type)
                    })
            } else {
                download(file.download_url, resolve(`${basedir}${dirPath ? '/' + dirPath : ''}`), { filename: file.name })
                    .on('end', () => {
                        ++totalDownloadFiles
                        cb(totalFiles, totalDownloadFiles, totalSize, done)
                    })
            }

            ++totalFiles
            totalSize += file.size
            cb(totalFiles, totalDownloadFiles, totalSize, done)
        }
        done = true
    } catch (err) {
        throw err
    }
}

module.exports = downloadFiles