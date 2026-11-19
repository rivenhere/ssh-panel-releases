# SSH Panel releases

Downloads of **SSH Panel**, the app for managing Linux servers over SSH: Windows, macOS, Linux and Android.
This repository holds only the releases; the code is developed elsewhere.

## Download

Open **[Releases](../../releases)** and pick the newest one for your system:

| System | File |
|---|---|
| Windows (installer) | `SSH-Panel-X.Y.Z-windows-x64-setup.exe` (or the `.msi`) |
| Windows (portable, no install) | `SSH-Panel-X.Y.Z-windows-x64-portable.zip`: unzip anywhere and run `SSH Panel.exe`; its data stays in `data\` next to it |
| Debian, Ubuntu, Mint… | `SSH-Panel-X.Y.Z-linux-amd64.deb` |
| Fedora, RHEL, openSUSE… | `SSH-Panel-X.Y.Z-linux-x86_64.rpm` |
| Any Linux | `SSH-Panel-X.Y.Z-linux-amd64.AppImage` (portable: create `<name>.AppImage.home` and `<name>.AppImage.config` folders next to it) |
| macOS (Apple silicon and Intel) | `SSH-Panel-X.Y.Z-macos-universal.dmg` |
| Android | `SSH-Panel-X.Y.Z-android.apk` |

Each system's app has its own version, so the newest release for your system may not be the newest release overall.

The apps aren't code-signed yet: Windows (SmartScreen) and macOS (Gatekeeper) warn the first time. On macOS, right-click the app and
choose *Open*.

## The Server Helper (sspd)

Releases tagged `sspd-vX.Y.Z` hold the Server Helper's program for every architecture (`sspd-linux-<arch>`, with `SHA256SUMS`).
You don't need to download them: SSH Panel fetches the right one when you install the Helper on a server, and checks its SHA-256.

## latest.json

[`latest.json`](latest.json) lists the newest version of each package (with its release, file, size and SHA-256). The apps read it to
check for updates; it is updated automatically with every release. Don't edit it by hand.

## License

All rights reserved. © rivenhere
