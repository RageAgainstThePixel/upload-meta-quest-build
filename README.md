# upload-meta-quest-build

A GitHub action for [uploading a Meta Quest app to the Meta Quest store](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/#upload-quest).

## How to use

* [Get Credentials](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/#credentials)
* Set repo secrets
  * `APP_ID`
  * `APP_SECRET`

```yaml
steps:
  - uses: RageAgainstThePixel/setup-ovr-platform-util@v1

  - uses: RageAgainstThePixel/upload-meta-quest-build@v1
    with:
      appId: ${{ secrets.APP_ID }}
      appSecret: ${{ secrets.APP_SECRET }}
      apkPath: 'path/to/apk'
```

### All Parameters 
[Oculus Platform Utility docs](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/)

| Name | Description | Default | Required |
| ---- | ----------- | ------- |---------|
| appId | Your App ID from the meta store | "" | Yes |
| appSecret | Your App secret from the meta store | "" | Must provide appSecret or token |
| token | The App ID from the meta store | "" | Must provide appSecret or token |
| apkPath | Path to the APK to upload | "" | Yes |
| obbPath | Path to an obb file to upload | "" | No |
| assetsDir | DLC Content to upload | "" | No |
| releaseChannel | Which release channel to upload the apk to | "ALPHA" | No |
| releaseNotes | Release notes to upload | "" | No |
| assetFilesConfig | DLC Config | "" | No |
| languagePacksDir | Additional languages | "" | No |
| debugSymbolsDir | Path to the folder that contains the debug symbol file(s) | "" | No |
| debugSymbolsPattern | Specifies a file pattern that matches the filesnames of all debug symbol files | "" | No |
