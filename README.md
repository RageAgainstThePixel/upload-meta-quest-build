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
