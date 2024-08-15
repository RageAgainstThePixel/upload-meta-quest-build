import core = require('@actions/core');
import exec = require('@actions/exec');
import glob = require('@actions/glob');
import unzip = require('unzip-stream');
import path = require('path');

const main = async () => {
    try {
        const args = [`upload-quest-build`];
        const ageGroup = core.getInput(`ageGroup`);
        if (!ageGroup) {
            throw Error('Missing ageGroup input. Must be one of: TEENS_AND_ADULTS, MIXED_AGES, or CHILDREN.');
        }
        args.push(`--age_group`, ageGroup);
        const appId = core.getInput(`appId`, { required: true });
        args.push(`--app_id`, appId);
        const appSecret = core.getInput(`appSecret`);
        if (!appSecret) {
            const token = core.getInput(`token`);
            if (!token) {
                throw Error(`Missing either appSecret or token input`);
            }
            args.push(`--token`, token);
        } else {
            args.push(`--app_secret`, appSecret);
        }
        const buildDir = core.getInput(`buildDir`);
        const apkPath = buildDir
            ? await findSpecificPath(`${buildDir}/**/*.apk`)
            : await findSpecificPath(core.getInput(`apkPath`));
        if (!apkPath) {
            throw Error(`Missing apkPath input`);
        }
        args.push(`--apk`, `'${apkPath}'`);
        const obbPath = buildDir
            ? await findSpecificPath(`${buildDir}/**/*.obb`)
            : await findSpecificPath(core.getInput(`obbPath`));
        if (obbPath) {
            args.push(`--obb`, `'${obbPath}'`);
        }
        const assetsDir = core.getInput(`assetsDir`);
        if (assetsDir) {
            args.push(`--assets-dir`, `'${assetsDir}'`);
        }
        const channel = core.getInput(`releaseChannel`) || `ALPHA`;
        args.push(`--channel`, channel);
        const releaseNotes = core.getInput(`releaseNotes`);
        if (releaseNotes) {
            args.push(`--notes`, `"${releaseNotes}"`);
        }
        const assetFilesConfig = await findSpecificPath(core.getInput(`assetFilesConfig`));
        if (assetFilesConfig) {
            args.push(`--asset-files-config`, assetFilesConfig);
        }
        const languagePacksDir = await findSpecificPath(core.getInput(`languagePacksDir`));
        if (languagePacksDir) {
            args.push(`--language-packs-dir`, languagePacksDir);
        }
        const debugSymbolsZip = await findSpecificPath(core.getInput(`debugSymbolsZip`));
        const debugSymbolsDir = debugSymbolsZip
            ? await unzipSymbols(debugSymbolsZip)
            : await findSpecificPath(core.getInput(`debugSymbolsDir`));
        if (debugSymbolsDir) {
            args.push(`--debug_symbols_dir`, debugSymbolsDir);
        }
        const debugSymbolsPattern = core.getInput(`debugSymbolsPattern`);
        if (debugSymbolsPattern) {
            args.push(`--debug-symbols-pattern`, debugSymbolsPattern);
        }
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
    await exec.exec('ovr-platform-util', args, {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
            stderr: (data) => {
                output += data.toString();
            }
        }
    });
    return output;
}

async function findGlobMatches(pattern: string): Promise<string[]> {
    if (!pattern) { return []; }
    const globber = await glob.create(pattern);
    return await globber.glob();
}

async function findSpecificPath(pattern: string): Promise<string | undefined> {
    if (!pattern) { return undefined; }
    const paths = await findGlobMatches(pattern);
    if (paths.length === 0) {
        return undefined;
    } else if (paths.length > 1) {
        core.warning(`Found more than one path matching pattern: ${pattern}\n  > ${paths.join(`\n  > `)}`);
    }
    return paths[0] !== undefined ? paths[0] : undefined;
}

const unzipSymbols = async (symbolsZip: string): Promise<string> => {
    const outputDir = `${process.env.RUNNER_TEMP}/${path.basename(symbolsZip, '.zip')}`;
    return await new Promise<string>((resolve, reject) => {
        unzip.Extract({ path: outputDir })
            .on('close', () => resolve(outputDir))
            .on('error', reject);
    });
}

main();
