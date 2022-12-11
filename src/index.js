const core = require('@actions/core');
const exec = require('@actions/exec');

const main = async () => {
    try {
        let args = [];

        const appId = core.getInput('appId');

        if (!appId) {
            throw Error('Missing appId input');
        }

        args.push('--app_id');
        args.push(appId);

        const appSecret = core.getInput('appSecret');

        if (!appSecret) {
            const token = core.getInput('token');

            if (!token) {
                throw Error('Missing either appSecret or token input');
            }

            args.push('--token');
            args.push(token);
        } else {
            args.push('--app_secret');
            args.push(appSecret);
        }

        const apkPath = core.getInput('apkPath');

        if (!apkPath) {
            throw Error('Missing apkPath input');
        }

        args.push('--apk');
        args.push(apkPath);

        const obbPath = core.getInput('obbPath');

        if (obbPath) {
            args.push('--obb');
            args.push(obbPath);
        }

        const assetsDir = core.getInput('assetsDir');

        if (assetsDir) {
            args.push('--assets-dir');
            args.push(assetsDir);
        }

        const channel = core.getInput('releaseChannel') || 'ALPHA';

        args.push('--channel');
        args.push(channel);

        const releaseNotes = core.getInput('releaseNotes');

        if (releaseNotes) {
            args.push('--notes');
            args.push(releaseNotes);
        }

        const assetFilesConfig = core.getInput('assetFilesConfig');

        if (assetFilesConfig) {
            args.push('--asset-files-config');
            args.push(assetFilesConfig);
        }

        const languagePacksDir = core.getInput('languagePacksDir');

        if (languagePacksDir) {
            args.push('--language-packs-dir');
            args.push(languagePacksDir);
        }

        const debugSymbolsDir = core.getInput('debugSymbolsDir');

        if (debugSymbolsDir) {
            args.push('--debug_symbols_dir');
            args.push(debugSymbolsDir);
        }

        const debugSymbolsPattern = core.getInput('debugSymbolsPattern');

        if (debugSymbolsPattern) {
            args.push('--debug-symbols-pattern');
            args.push(debugSymbolsPattern);
        }

        await exec.exec('ovr-platform-util', args);
    } catch (error) {
        core.setFailed(error);
    }
}

main();