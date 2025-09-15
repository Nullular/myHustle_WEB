# MyHustle App Icon Setup Guide

## Current Configuration
Your app is already configured with proper icon settings in `AndroidManifest.xml`:
```xml
android:icon="@mipmap/ic_launcher"
android:roundIcon="@mipmap/ic_launcher_round"
```

## Method 1: Android Studio Image Asset Tool (Recommended)

### Steps:
1. **Open Android Studio**
2. **Right-click** on `app` module in Project view
3. **New > Image Asset**
4. **Configure:**
   - Icon Type: Launcher Icons (Adaptive and Legacy)
   - Asset Type: Image (browse to your icon file)
   - Background: Choose appropriate color
   - Foreground: Your icon design
   - Legacy: Check "Generate Legacy Icon"
5. **Preview** your icon on different devices
6. **Next > Finish**

### What it creates:
- All density folders (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Adaptive icons for Android 8.0+ (`ic_launcher.xml` files)
- Legacy icons for older versions
- Both round and square variants

## Method 2: Manual Icon Replacement

### Required Files:
Replace these existing files with your new icon:

```
app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.webp (48x48)
│   └── ic_launcher_round.webp (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.webp (72x72)
│   └── ic_launcher_round.webp (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.webp (96x96)
│   └── ic_launcher_round.webp (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.webp (144x144)
│   └── ic_launcher_round.webp (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.webp (192x192)
    └── ic_launcher_round.webp (192x192)
```

### Adaptive Icons (Android 8.0+):
Also update these XML files if using adaptive icons:
```
app/src/main/res/
├── drawable/
│   ├── ic_launcher_background.xml
│   └── ic_launcher_foreground.xml
└── mipmap-anydpi-v26/
    ├── ic_launcher.xml
    └── ic_launcher_round.xml
```

## Icon Design Guidelines

### Best Practices:
- **Size**: Start with 512x512 px source image
- **Format**: PNG with transparency or solid background
- **Content**: Avoid thin lines, use bold shapes
- **Safety Area**: Keep important content in center 66% of icon
- **Colors**: High contrast, readable on various backgrounds
- **Branding**: Should represent MyHustle business/marketplace app

### MyHustle Icon Ideas:
- Shopping cart with handshake
- Marketplace/store icon with dollar sign
- Shopping bag with "M" or "H" letter
- Business/entrepreneur themed icon
- Combination of shopping and business elements

## Testing Your Icon

After adding the icon:
1. **Clean and rebuild** the project
2. **Install** on device/emulator
3. **Check** home screen appearance
4. **Test** on different launchers if possible
5. **Verify** in app drawer and recent apps

## Current Icon Location
Your current icons are located at:
- `app/src/main/res/mipmap-*/ic_launcher.webp`
- `app/src/main/res/mipmap-*/ic_launcher_round.webp`

Simply replace these files with your new icon in the appropriate sizes, or use Android Studio's Image Asset tool for automatic generation.
