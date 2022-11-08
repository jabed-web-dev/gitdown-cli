const formatSize = (bytes, repo, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    i = repo ? i + 1 : i;
    return ((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]);
}

//  MB >= KB / 1024ⁿ
//  KB <= MB * 1024ⁿ

module.exports = formatSize
