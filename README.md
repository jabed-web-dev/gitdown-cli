# gitdown

Download directory and files from github repository

See gitdown for the command-line github directory and files download.

## Install

```bash
npm install -g gitdown-cli
```


## Usage in CLI Command

```bash
gitdown https://github.com/user/repo/tree/main/path [.|dir|dir/subdir|new-path]?
or
gitdown user/repo/path
```

## Usage in Nodejs

```js
const gitdown = require('gitdown')

gitdown(url, path, dir?)
```