#!/usr/bin/env node

import fs from 'node:fs';
import { join, basename, resolve} from 'node:path';
import process from 'node:process';

const totalDownloads = {
  files: 0,
  size: 0,
};

// Function to create directories recursively
const ensureDir = async (dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};

// File size converter function
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${i ? size : ~~size} ${units[i]}`;
}

// Function to download a file
const downloadFile = async ({ url, dest }) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
  }

  // Open a write stream to the destination file
  const writer = fs.createWriteStream(dest);

  // Use the ReadableStream to write data to the file
  const readableStream = response.body;

  return new Promise((resolve, reject) => {
    readableStream.pipeTo(
      new WritableStream({
        write(chunk) {
          writer.write(chunk);
        },
        close() {
          writer.end();
          resolve();
        },
        abort(err) {
          writer.destroy();
          reject(err);
        },
      })
    );
  });
};

// Recursive function to download folder contents
const downloadContents = async ({ owner, repo, branch, path, localPath }) => {
  try {
    const contents = await getRepoContents({ owner, repo, path, branch });

    for (const item of contents) {
      const itemLocalPath = join(localPath, item.name);

      if (item.type === 'file') {
        console.log(`Downloading file: ${item.path}`);
        await downloadFile({ url: item.download_url, dest: itemLocalPath });
        totalDownloads.files += 1;
        totalDownloads.size += item.size;
      } else if (item.type === 'dir') {
        // console.log(`Entering subfolder: ${item.path}`);
        await ensureDir(itemLocalPath); // Create local subfolder
        await downloadContents({ owner, repo, branch, path: item.path, localPath: itemLocalPath });
      }
    }
  } catch (error) {
    console.error(`Error downloading folder "${path}": ${error.message}`);
  }
};

// Function to fetch repository contents (files or folders) via GitHub API
const getRepoContents = async ({ owner, repo, path = '', branch = 'main' }) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch contents from GitHub: ${response.statusText}`);
  }

  return response.json();
};

// Function to parse the GitHub URL
const parseGitHubUrl = (url) => {
  const match = url.match(/(?:https:\/\/github\.com\/)?(?<owner>[^/]+)\/(?<repo>[^/]+)(\/(?<type>tree|blob)\/(?<branch>[^/]+))?(\/(?<path>.+))?\/?$/);

  if (!match) {
    throw new Error('Invalid GitHub URL format. Ensure it points to a file or folder.');
  }

  const { owner, repo, type = 'tree', branch = 'main', path = '' } = match.groups;
  return { owner, repo, type, branch, path };
};

function color(text, code) {
  return `\x1b[${code}m${text}\x1b[0m`
}

async function argument(baseurl, basedir) {
  if (!baseurl) {
    console.error('Error: No argument provided. Use -h or --help for usage instructions.');
    process.exit(1);
  }

  if (/-h|--help/.test(baseurl)) {
    console.log(`
${color('Usage:', 1)}
  ${color('gitdown', 33)} ${color('<url> <path>?', 36)}
  ${color('<url>', 36)}   GitHub repository URL: ${color('<https://github.com/>?user/repo/<tree|blob>/branch/path/<folder|file>', 36)}
          Use folder path: ${color('user/repo/<folder>', 36)}                     Default branch: ${color('main', 95)}
  ${color('<path>?', 36)} Local directory path or filename: ${color('new-dir|new-filename', 36)}  Default path: ${color('cwd+urlPath', 95)}
  
          Download a repository, folder, subfolder or file from a GitHub repository URL or Path.
    `);
    process.exit(0);
  }

  try {
    const { owner, repo, type, branch, path } = parseGitHubUrl(baseurl);
    console.log(
      `Parsed URL: { Owner: ${color(owner, 32)}, Repo: ${color(repo, 32)}, Type: ${color(type, 32)}, Branch: ${color(branch, 32)}, Path: ${color(path || 'root', 32)} }\n`
    );

    if (type === 'blob') {
      // Handle file download
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      const fileName = basename(path); // Extract file name
      console.log(`Downloading file: ${fileName}`);
      await downloadFile({ url: rawUrl, dest: basedir || fileName });
      const content = await getRepoContents({ owner, repo, path, branch });
      totalDownloads.files = 1;
      totalDownloads.size = content.size;
      console.log(`File downloaded: ${fileName}`);
    } else if (type === 'tree') {
      // Handle folder download
      const dirPath = resolve(basedir || process.cwd());
      const dirName = basedir ? '' : path.match(/[^/]+$/)?.[0] || repo;
      const localPath = join(dirPath, dirName);
      console.log(`Starting download for folder: ${path || 'root'} (branch: ${branch})`);
      await ensureDir(localPath); // Ensure the root folder exists locally
      await downloadContents({ owner, repo, branch, path, localPath });
    } else {
      throw new Error('Unsupported URL type. URL must point to a file or folder.');
    }
    console.log(`\nTotal download files: ${color(totalDownloads.files, 33)}  Size: ${color(formatFileSize(totalDownloads.size), 33)}`);
    console.log(`✅ ${color('Download completed!', 32)}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const [baseurl, basedir] = process.argv.slice(2);
argument(baseurl, basedir);
