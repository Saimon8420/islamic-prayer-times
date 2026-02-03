# Android APK Release Guide

## How It Works

The GitHub Actions workflow (`.github/workflows/build-apk.yml`) automatically builds an Android APK and creates a GitHub Release whenever a tag starting with `v` is pushed.

## First-Time Release

After committing your changes, create and push a new tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Re-Release (Same Tag)

If you need to rebuild the APK on a newer commit using the same version tag:

```bash
# 1. Delete the tag locally
git tag -d v1.0.0

# 2. Delete the tag on GitHub
git push origin --delete v1.0.0

# 3. Recreate the tag on the latest commit
git tag v1.0.0

# 4. Push the tag to trigger the APK build
git push origin v1.0.0
```

## Bumping Version

To release a new version instead of overwriting:

```bash
git tag v1.1.0
git push origin v1.1.0
```

## Where to Find the APK

Once the workflow completes:

1. Go to your GitHub repo
2. Click **Releases** in the sidebar
3. Download `islamic-prayer-times.apk` from the latest release

You can also check the workflow status under the **Actions** tab.
