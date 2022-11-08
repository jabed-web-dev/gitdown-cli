const { Octokit } = require("@octokit/rest");

const octokit = new Octokit()

function fileData(file, obj = {}) {
    let { name, path, size, download_url } = file
    return { name, path, size, download_url, ...obj }
}

async function* getAPIs(apiUrl) {
    try {
        const { data } = await octokit.request(`GET ${apiUrl}`, {
            headers: {
                accept: "application/vnd.github.v3+json",
                authorization: "token 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",
                referer: "https://v--0kvkd1gg50uq1ko9vd4pluu8mt5cbsiakrohahj34gg4p2q1l3j6.vscode-cdn.net/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.26"
            }
        });

        if (data instanceof Array) {
            for (const file of data) {
                if (file.type === 'dir') {
                    yield* getAPIs(file.url);
                } else {
                    yield fileData(file)
                }
            }
        } else if (data instanceof Object) {
            if (!data.type && data.svn_url) {
                yield fileData(data, {
                    download_url: data.svn_url,
                    default_branch: data.default_branch,
                    type: 'repo'
                })
            } else {
                yield fileData(data)
            }
        }
    } catch (err) {
        console.log(`${err.name}: \x1B[0;33m${err.status}\x1B[1;0m ${err.message}`)
        return
    }
}

module.exports = getAPIs