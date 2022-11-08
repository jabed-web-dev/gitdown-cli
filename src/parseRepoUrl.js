function parseRepoUrl(baseurl) {
    try {
        baseurl = baseurl.replace(/^(?<protocol>https:\/\/)?(?<hostname>github\.com)?/, (match, protocol, hostname) => {
            if (protocol && hostname) {
                return match
            } else if (!protocol && hostname) {
                return `https://${hostname}`
            } else if (!protocol && !hostname) {
                return `https://github.com${baseurl[0] !== '/' ? '/' : ''}`
            }
        })

        let { pathname } = new URL(baseurl)
        return pathname.match(/^\/(?<owner>.+?)\/(?<repo>.+?(?=\/|$))(\/(?<type>tree|blob)\/(?<branch>.+?)(?=\/|$))?\/?(?<path>(?<prePath>.+)?(?<rootDir>(?<=\/).+?))?\/?$/).groups
    } catch (error) {
        throw error
    }
}

module.exports = parseRepoUrl