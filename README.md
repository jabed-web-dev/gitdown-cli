# gitdown-cli

Download single folder and files from github repository

See gitdown for the command-line github single folder and files download.

## Install

```bash
npm install -g gitdown-cli
```


## Usage in CLI Command

```bash
# <path> (.|dir|dir/subdir|new-path|../) 
# <branch> use any branch
gitdown https://github.com/user/repo/tree/<branch>/path <path>? 
or
# ignore github.com and tree/branch
gitdown user/repo/path <path>?
```

## Example
```bash
# folder download
gitdown https://github.com/nodejs/node/tree/main/doc/api <new-path>?
or
# file download 
gitdown https://github.com/nodejs/node/blob/main/doc/api/buffer.md <new-name>?
```

## Usage in Nodejs

```js
const gitdown = require('gitdown')

gitdown(url, path, dir?)
```