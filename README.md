# camera-preview-sample-app

Sample Cordova app untuk verifikasi bahwa fix `cordova-plugin-camera-preview` dari fork [Bobbsskuyy](https://github.com/Bobbsskuyy/cordova-plugin-camera-preview) bekerja dengan **cordova-ios 8**.

## Struktur Repo

```
camera-preview-sample-app/
├── .github/
│   └── workflows/
│       └── verify-ios-build.yml   ← GitHub Actions workflow
├── www/
│   ├── index.html                 ← UI sample app
│   ├── js/app.js                  ← Logic + test cases
│   └── css/style.css              ← Styling
├── config.xml                     ← Cordova config (plugin di-point ke fork)
├── package.json                   ← Dependencies
└── README.md
```

## Plugin yang Diverifikasi

```
https://github.com/Bobbsskuyy/cordova-plugin-camera-preview
```

Fixes yang diverifikasi:
- ✅ `_activeRootView` helper — fix view hierarchy untuk iOS Scene API
- ✅ `didMoveToParentViewController` — proper VC containment lifecycle
- ✅ `willMoveToParentViewController:nil` — proper VC removal lifecycle
- ✅ `plugin.xml <engines>` — declare minimum cordova-ios version

## Cara Pakai

### Via GitHub Actions (dari Windows sekalipun)

1. Push repo ini ke GitHub
2. Buka tab **Actions**
3. Workflow `verify-ios-build.yml` otomatis jalan
4. Lihat hasilnya — semua step harus hijau ✅

Atau trigger manual: **Actions → iOS Trial Build → Run workflow**

### Lokal (butuh Mac)

```bash
npm install
cordova platform add ios@8
cordova build ios --emulator -- CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

## Test Cases di App

| Test | Fungsi yang ditest | Fix yang diverifikasi |
|------|-------------------|----------------------|
| Plugin checks | `CameraPreview` object exists | Plugin ter-install dari fork |
| Start camera | `startCamera()` dengan `toBack:true` | `_activeRootView` fix |
| Take picture | `takePicture()` | Capture flow |
| Stop camera | `stopCamera()` | `willMoveToParentViewController:nil` fix |
| Switch camera | `switchCamera()` | Front/back toggle |
| Flash toggle | `setFlashMode()` | Flash API |
