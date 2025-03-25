import core = require('@actions/core');
import exec = require('@actions/exec');
import glob = require('@actions/glob');
import unzip = require('unzip-stream');
import path = require('path');
import fs = require('fs');

const main = async () => {
    try {
        const args = [`upload-quest-build`];
        const ageGroup = core.getInput(`ageGroup`);
        if (!ageGroup) {
            throw Error('Missing ageGroup input. Must be one of: TEENS_AND_ADULTS, MIXED_AGES, or CHILDREN.');
        }
        core.debug(`ageGroup: ${ageGroup}`);
        args.push(`--age-group`, ageGroup);
        const appId = core.getInput(`appId`, { required: true });
        core.debug(`appId: ${appId}`);
        args.push(`--app-id`, appId);
        const appSecret = core.getInput(`appSecret`);
        if (!appSecret) {
            const token = core.getInput(`token`);
            if (!token) {
                throw Error(`Missing either appSecret or token input`);
            }
            args.push(`--token`, token);
        } else {
            args.push(`--app-secret`, appSecret);
        }
        const buildDir = core.getInput(`buildDir`);
        if (buildDir) {
            core.debug(`buildDir: ${buildDir}`);
        }
        const apkPath = buildDir
            ? await findSpecificPath(`${buildDir}/**/*.apk`)
            : await findSpecificPath(core.getInput(`apkPath`));
        if (!apkPath) {
            throw Error(`Missing apkPath input`);
        }
        core.debug(`apkPath: ${apkPath}`);
        args.push(`--apk`, `'${apkPath}'`);
        const obbPath = buildDir
            ? await findSpecificPath(`${buildDir}/**/*.obb`)
            : await findSpecificPath(core.getInput(`obbPath`));
        if (obbPath) {
            core.debug(`obbPath: ${obbPath}`);
            args.push(`--obb`, `'${obbPath}'`);
        }
        const assetsDir = core.getInput(`assetsDir`);
        if (assetsDir) {
            core.debug(`assetsDir: ${assetsDir}`);
            args.push(`--assets-dir`, `'${assetsDir}'`);
        }
        const channel = core.getInput(`releaseChannel`) || `ALPHA`;
        core.debug(`releaseChannel: ${channel}`);
        args.push(`--channel`, channel);
        const releaseNotes = core.getInput(`releaseNotes`);
        if (releaseNotes) {
            core.debug(`releaseNotes:\n-----\n${releaseNotes}\n-----`);
            args.push(`--notes`, `"${releaseNotes}"`);
        }
        const assetFilesConfig = await findSpecificPath(core.getInput(`assetFilesConfig`));
        if (assetFilesConfig) {
            core.debug(`assetFilesConfig: ${assetFilesConfig}`);
            args.push(`--asset-files-config`, assetFilesConfig);
        }
        const languagePacksDir = await findSpecificPath(core.getInput(`languagePacksDir`));
        if (languagePacksDir) {
            core.debug(`languagePacksDir: ${languagePacksDir}`);
            args.push(`--language-packs-dir`, languagePacksDir);
        }
        let debugSymbolsZip: string | null = null;
        const inputDebugSymbolsPath = core.getInput(`debugSymbolsZip`);
        if (inputDebugSymbolsPath) {
            debugSymbolsZip = await findSpecificPath(inputDebugSymbolsPath);
            if (!debugSymbolsZip) {
                core.warning(`No debugSymbolsZip found in directory: ${inputDebugSymbolsPath}`);
            }
        } else {
            if (buildDir) {
                debugSymbolsZip = await findSpecificPath(`${buildDir}/**/*.zip`);
            }
        }
        if (debugSymbolsZip) {
            core.debug(`debugSymbolsZip: ${debugSymbolsZip}`);
        }
        const debugSymbolsDir = debugSymbolsZip
            ? await unzipSymbols(debugSymbolsZip)
            : await findSpecificPath(core.getInput(`debugSymbolsDir`));
        if (debugSymbolsDir) {
            core.debug(`debugSymbolsDir: ${debugSymbolsDir}`);
            args.push(`--debug-symbols-dir`, debugSymbolsDir);
        }
        const debugSymbolsPattern = core.getInput(`debugSymbolsPattern`);
        if (debugSymbolsPattern) {
            core.debug(`debugSymbolsPattern: ${debugSymbolsPattern}`);
            args.push(`--debug-symbols-pattern`, debugSymbolsPattern);
        }
        const inheritAssetFiles = core.getInput(`inheritAssetFiles`);
        if (inheritAssetFiles) {
            core.debug(`inheritAssetFiles: ${inheritAssetFiles}`);
            args.push(`--inherit-asset-files`, inheritAssetFiles);
        }
        const excludeAddons = core.getInput(`excludeAddons`);
        if (excludeAddons) {
            core.debug(`excludeAddons: ${excludeAddons}`);
            args.push(`--exclude-addons`, excludeAddons);
        }
        const draft = core.getInput(`draft`);
        if (draft) {
            core.debug(`draft: ${draft}`);
            args.push(`--draft`, draft);
        }
        const force = core.getInput(`force`);
        if (force === 'true') {
            core.debug(`force: ${force}`);
            args.push(`--force`);
        }
        args.push(`--disable-progress-bar`, `true`);
        const output = await execOvrUtil(args);
        const match = output.match(/Created Build ID: (?<build_id>\d+)/);
        if (match) {
            const build_id = match.groups.build_id;
            if (build_id) {
                core.debug(`build_id: ${build_id}`);
                core.setOutput('build_id', build_id);
            }
        }
    } catch (error) {
        core.setFailed(error);
    }
}

async function execOvrUtil(args: string[]): Promise<string> {
    let output = '';
    const exitCode = await exec.exec('ovr-platform-util', args, {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
            stderr: (data) => {
                output += data.toString();
            }
        }
    });
    if (exitCode !== 0) {
        throw Error(`ovr-platform-util failed with exit code: ${exitCode}`);
    }
    return output;
}

async function findGlobMatches(pattern: string): Promise<string[]> {
    if (!pattern) { return []; }
    core.debug(`Finding paths matching pattern: ${pattern}`);
    const globber = await glob.create(pattern);
    var paths = await globber.glob();
    core.debug(`Found ${paths.length} paths matching pattern: ${pattern}`);
    return paths;
}

async function findSpecificPath(pattern: string): Promise<string | null> {
    if (!pattern) { return null; }
    core.debug(`Finding path matching pattern: ${pattern}`);
    const paths = await findGlobMatches(pattern);
    if (paths.length === 0) {
        core.debug(`No paths found matching pattern: ${pattern}`);
        return null;
    } else if (paths.length > 1) {
        core.warning(`Found more than one path matching pattern: ${pattern}\n  > ${paths.join(`\n  > `)}`);
    }
    const result = paths[0];
    core.debug(`Found path: ${result}`);
    return result;
}

const unzipSymbols = async (symbolsZip: string): Promise<string> => {
    const outputDir = path.join(`${process.env.RUNNER_TEMP}`, `${path.basename(symbolsZip, '.zip')}`);
    core.debug(`Unzipping symbols:\n"${symbolsZip}"\n"${outputDir}"`);
    try {
        return await new Promise<string>((resolve, reject) => {
            const extractStream = unzip.Extract({ path: outputDir });
            extractStream.on('close', () => {
                core.debug(`Successfully unzipped symbols to: ${outputDir}`);
                resolve(outputDir);
            });
            extractStream.on('error', (error) => {
                reject(error);
            });
            fs.createReadStream(symbolsZip).pipe(extractStream);
        });
    } catch (error) {
        throw Error(`Failed to unzip symbols: ${error}`);
    }
}

main();
