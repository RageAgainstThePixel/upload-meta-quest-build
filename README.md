# upload-meta-quest-build

A GitHub action for [uploading a Meta Quest app to the Meta Quest store](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/#upload-quest).

## How to use

* [Get Credentials](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/#credentials)
* Set repo secrets
  * `APP_ID`
  * `APP_SECRET`

Step outputs:

* `buildId`: The uploaded build id.

```yaml
steps:
    # setup ovr platform util
  - uses: RageAgainstThePixel/setup-ovr-platform-util@v1
    # upload meta quest build
  - uses: RageAgainstThePixel/upload-meta-quest-build@v2
    id: upload
    with:
      appId: ${{ secrets.APP_ID }}
      appSecret: ${{ secrets.APP_SECRET }}
      apkPath: 'path/to/apk'
    # use uploaded meta quest build id
  - run: 'echo ${{ steps.upload.buildId }}'
```

### All Parameters

[Oculus Platform Utility docs](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/)

| Name | Description | Default | Required |
| ---- | ----------- | ------- |----------|
| `ageGroup` | Age group of the build. This can be `TEENS_AND_ADULTS`, `MIXED_AGES`, or `CHILDREN`. | | Yes |
| `appId` | Your App ID from the meta store | | Yes |
| `appSecret` | Your App secret from the meta store | | Must provide appSecret or token |
| `token` | The App ID from the meta store | | Must provide appSecret or token |
| `apkPath` | Path to the APK to upload | | Yes |
| `obbPath` | Path to an obb file to upload | | No |
| `assetsDir` | DLC Content to upload | | No |
| `releaseChannel` | Which release channel to upload the apk to | `ALPHA` | No |
| `releaseNotes` | Release notes to upload | | No |
| `assetFilesConfig` | DLC Config | | No |
| `languagePacksDir` | Additional languages | | No |
| `debugSymbolsDir` | Path to the folder that contains the debug symbol file(s) | | No |
| `debugSymbolsPattern` | Specifies a file pattern that matches the files names of all debug symbol files | | No |

## Related actions

* [setup-ovr-platform-util](https://github.com/RageAgainstThePixel/setup-ovr-platform-util)
