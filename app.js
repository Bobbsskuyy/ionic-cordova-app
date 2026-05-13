// www/js/app.js
// Sample app untuk verify cordova-plugin-camera-preview dari fork Bobbsskuyy
// Test cases yang di-cover:
//   1. Plugin terdaftar dan accessible
//   2. startCamera() — tes fix _activeRootView & didMoveToParentViewController
//   3. takePicture() — tes capture flow
//   4. stopCamera()  — tes fix willMoveToParentViewController:nil
//   5. switchCamera() — tes front/back toggle

'use strict';

var App = {
    isFlashOn: false,
    isCameraRunning: false,

    // ─────────────────────────────────────────────────────────────────────
    // Init
    // ─────────────────────────────────────────────────────────────────────
    init: function () {
        document.addEventListener('deviceready', App.onDeviceReady, false);
        App.log('Waiting for deviceready...');
    },

    onDeviceReady: function () {
        App.log('✅ deviceready fired');
        App.setStatus('Device ready — cordova ' + cordova.version);

        // Auto-run checks
        App.runPluginChecks();
    },

    // ─────────────────────────────────────────────────────────────────────
    // Plugin availability checks
    // ─────────────────────────────────────────────────────────────────────
    runPluginChecks: function () {
        var checks = [
            {
                name: 'CameraPreview object exists',
                pass: typeof CameraPreview !== 'undefined'
            },
            {
                name: 'startCamera() available',
                pass: typeof CameraPreview !== 'undefined' && typeof CameraPreview.startCamera === 'function'
            },
            {
                name: 'stopCamera() available',
                pass: typeof CameraPreview !== 'undefined' && typeof CameraPreview.stopCamera === 'function'
            },
            {
                name: 'takePicture() available',
                pass: typeof CameraPreview !== 'undefined' && typeof CameraPreview.takePicture === 'function'
            },
            {
                name: 'switchCamera() available',
                pass: typeof CameraPreview !== 'undefined' && typeof CameraPreview.switchCamera === 'function'
            },
            {
                name: 'setFlashMode() available',
                pass: typeof CameraPreview !== 'undefined' && typeof CameraPreview.setFlashMode === 'function'
            },
            {
                name: 'Running on iOS',
                pass: cordova.platformId === 'ios'
            }
        ];

        var checkList = document.getElementById('check-list');
        var testResults = document.getElementById('test-results');
        checkList.innerHTML = '';
        testResults.style.display = 'block';

        var allPassed = true;
        checks.forEach(function (check) {
            var li = document.createElement('li');
            li.className = check.pass ? 'check-pass' : 'check-fail';
            li.textContent = (check.pass ? '✅ ' : '❌ ') + check.name;
            checkList.appendChild(li);
            if (!check.pass) allPassed = false;
            App.log((check.pass ? '✅' : '❌') + ' ' + check.name);
        });

        App.setStatus(allPassed ? '✅ All checks passed!' : '⚠️ Some checks failed');

        // Enable start button hanya kalau CameraPreview available
        var btn = document.getElementById('btn-start-camera');
        if (typeof CameraPreview === 'undefined') {
            btn.disabled = true;
            btn.textContent = 'Plugin not available';
        }
    },

    // ─────────────────────────────────────────────────────────────────────
    // TEST 1: startCamera
    // Ini test utama untuk fix _activeRootView & didMoveToParentViewController
    // ─────────────────────────────────────────────────────────────────────
    startCamera: function () {
        if (App.isCameraRunning) {
            App.log('Camera already running');
            return;
        }

        App.log('Starting camera...');
        App.setStatus('Opening camera...');

        var options = {
            x: 0,
            y: 0,
            width: window.screen.width,
            height: window.screen.height,
            camera: CameraPreview.CAMERA_DIRECTION.BACK,
            tapPhoto: false,
            tapFocus: true,
            previewDrag: false,
            toBack: true,       // ← ini yang trigger _activeRootView fix
            alpha: 1
        };

        CameraPreview.startCamera(options,
            function () {
                App.isCameraRunning = true;
                App.log('✅ startCamera SUCCESS — fix _activeRootView bekerja');
                App.setStatus('Camera running');
                document.getElementById('main-menu').style.display = 'none';
                document.getElementById('camera-overlay').style.display = 'flex';
            },
            function (err) {
                App.log('❌ startCamera FAILED: ' + JSON.stringify(err));
                App.setStatus('❌ startCamera failed: ' + err);
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────
    // TEST 2: takePicture
    // ─────────────────────────────────────────────────────────────────────
    takePicture: function () {
        if (!App.isCameraRunning) return;
        App.log('Taking picture...');

        CameraPreview.takePicture(
            { width: 640, height: 640, quality: 85 },
            function (base64) {
                App.log('✅ takePicture SUCCESS — image length: ' + base64.length);
                var img = document.getElementById('captured-image');
                img.src = 'data:image/jpeg;base64,' + base64;
                document.getElementById('camera-overlay').style.display = 'none';
                document.getElementById('result-overlay').style.display = 'flex';
            },
            function (err) {
                App.log('❌ takePicture FAILED: ' + JSON.stringify(err));
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────
    // TEST 3: stopCamera
    // Ini test untuk fix willMoveToParentViewController:nil
    // ─────────────────────────────────────────────────────────────────────
    stopCamera: function () {
        if (!App.isCameraRunning) return;
        App.log('Stopping camera...');

        CameraPreview.stopCamera(
            function () {
                App.isCameraRunning = false;
                App.log('✅ stopCamera SUCCESS — fix willMoveToParentViewController bekerja');
                App.setStatus('Camera stopped');
                document.getElementById('camera-overlay').style.display = 'none';
                document.getElementById('result-overlay').style.display = 'none';
                document.getElementById('main-menu').style.display = 'flex';
            },
            function (err) {
                App.log('❌ stopCamera FAILED: ' + JSON.stringify(err));
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────
    // TEST 4: switchCamera
    // ─────────────────────────────────────────────────────────────────────
    switchCamera: function () {
        if (!App.isCameraRunning) return;
        App.log('Switching camera...');

        CameraPreview.switchCamera(
            function () {
                App.log('✅ switchCamera SUCCESS');
            },
            function (err) {
                App.log('❌ switchCamera FAILED: ' + JSON.stringify(err));
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────
    // TEST 5: flash toggle
    // ─────────────────────────────────────────────────────────────────────
    toggleFlash: function () {
        if (!App.isCameraRunning) return;
        App.isFlashOn = !App.isFlashOn;
        var mode = App.isFlashOn ? 'on' : 'off';
        App.log('Setting flash: ' + mode);

        CameraPreview.setFlashMode(mode,
            function () {
                App.log('✅ setFlashMode ' + mode + ' SUCCESS');
                document.getElementById('btn-flash').textContent = App.isFlashOn ? '🔦' : '⚡';
            },
            function (err) {
                App.log('❌ setFlashMode FAILED: ' + JSON.stringify(err));
            }
        );
    },

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────
    retake: function () {
        document.getElementById('result-overlay').style.display = 'none';
        document.getElementById('camera-overlay').style.display = 'flex';
    },

    confirmCapture: function () {
        App.stopCamera();
    },

    setStatus: function (msg) {
        document.getElementById('status-text').textContent = msg;
    },

    log: function (msg) {
        console.log('[CameraPreviewTest] ' + msg);
        var logEl = document.getElementById('log-text');
        if (logEl) {
            logEl.textContent = msg;
        }
    }
};

// Expose ke HTML onclick handlers
function startCamera()    { App.startCamera(); }
function takePicture()    { App.takePicture(); }
function switchCamera()   { App.switchCamera(); }
function toggleFlash()    { App.toggleFlash(); }
function retake()         { App.retake(); }
function confirmCapture() { App.confirmCapture(); }
function runPluginChecks(){ App.runPluginChecks(); }

App.init();
