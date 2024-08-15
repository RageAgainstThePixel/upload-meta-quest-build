# upload-meta-quest-build

A GitHub Action for [uploading a Meta Quest app to the Meta Quest store](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/#upload-quest).

## How to use

* [Get Credentials](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/#credentials)
* Set repo secrets
  * `META_APP_ID`
  * `META_APP_SECRET`

### workflow

```yaml
steps:
    # setup ovr platform util
  - uses: RageAgainstThePixel/setup-ovr-platform-util@v1
    # upload meta quest build
  - uses: RageAgainstThePixel/upload-meta-quest-build@v2
    id: upload
    with:
      appId: ${{ secrets.META_APP_ID }}
      appSecret: ${{ secrets.META_APP_SECRET }}
      apkPath: 'path/to/apk'
    # use uploaded meta quest build id
  - run: 'echo ${{ steps.upload.build_id }}'
```

### inputs

[Oculus Platform Utility docs](https://developer.oculus.com/resources/publish-reference-platform-command-line-utility/)

| Name | Description | Required | Default |
| ---- | ----------- | ------- |----------|
| `ageGroup` | Age group of the build. This can be `TEENS_AND_ADULTS`, `MIXED_AGES`, or `CHILDREN`. (If not specified, the upload will go into “draft” status, rather than failing). For more information, see [Age Group Self-Certification and Youth Requirements](https://developer.oculus.com/resources/age-groups). | true | |
| `appId` | Specifies the ID of your app. Obtained from the API tab of your app in the Oculus Dashboard. | true | |
| `appSecret` |Specifies the app secret. Obtained from the API tab of your app in the Oculus developer dashboard. | Must provide `appSecret` or `token` | |
| `token` | A user token obtained by the get-access-token command or from the API tab of your app in the Oculus developer dashboard. | Must provide `appSecret` or `token` | |
| `apkPath` | Specifies the path to the APK to upload. | true | |
| `obbPath` | Specifies the path to the Expansion file (OBB) to upload. | false | |
| `buildDir` | Specifies the path to the directory that contains the build files. If specified, the plugin will look for the APK and OBB files in this directory. | false | |
| `assetsDir` | Specifies the path to the directory with DLCs for this build. | false | |
| `assetFilesConfig` | Specifies the path to the file that configures required assets or associates DLC assets with in-app purchases. | false | |
| `releaseChannel` | Which release channel to upload the apk to | false | `ALPHA` |
| `releaseNotes` | Specifies the release note text shown to users. Encodes double quotes as `\"`. Encode newlines as `\n`. | false | |
| `languagePacksDir` | The path to the directory that contains language packs. | false | |
| `debugSymbolsDir` | Path to the folder that contains the debug symbol file(s). | false | |
| `debugSymbolsZip` | The path to the debug symbol zip file. If provided this will be used instead of the `debugSymbolsDir` and will unzip before uploading. | false | |
| `debugSymbolsPattern` | A pattern sequence that can match the filenames of all the debug symbol files. An asterisk may be used to indicate a wildcard, for example, `*.sym.so`. | false | |

### outputs

* `build_id`: The uploaded build id.

## Related actions

* [setup-ovr-platform-util](https://github.com/RageAgainstThePixel/setup-ovr-platform-util)
