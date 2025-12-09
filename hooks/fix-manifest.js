#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
    const manifestPath = path.join(platformRoot, 'app/src/main/AndroidManifest.xml');

    if (!fs.existsSync(manifestPath)) {
        console.log('AndroidManifest.xml not found, skipping...');
        return;
    }

    console.log('Cleaning duplicate permissions from AndroidManifest.xml...');
    
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    
    // Remove all WRITE_EXTERNAL_STORAGE permissions
    manifest = manifest.replace(/<uses-permission android:name="android\.permission\.WRITE_EXTERNAL_STORAGE"[^>]*\/>/g, '');
    
    // Remove all READ_EXTERNAL_STORAGE permissions
    manifest = manifest.replace(/<uses-permission android:name="android\.permission\.READ_EXTERNAL_STORAGE"[^>]*\/>/g, '');
    
    // Add them back once, right after the <manifest> tag
    const manifestTagRegex = /(<manifest[^>]*>)/;
    const permissionsToAdd = `
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />`;
    
    manifest = manifest.replace(manifestTagRegex, `$1${permissionsToAdd}`);
    
    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('AndroidManifest.xml cleaned successfully!');
};
