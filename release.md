# Release

This document details the release process.

After committing changes:

1. Use the interactive CLI `pnpm run changeset` to prepare the release
2. Run `pnpm run version-packages` and then update the `pnpm-lock.yaml` file with `pnpm install`
3. Finally, run `pnpm run release` and enter a OTP for npm
4. 🎉🍻 (celebrate) and tweet!
