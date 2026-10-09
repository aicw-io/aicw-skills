# Attribution and licenses

Copyright (c) 2026 AICW contributors. Toolkit source and skill instructions are licensed under AGPL-3.0-only. See LICENSE.

This toolkit adapts audit behavior from [AICW Visibility](https://github.com/aicw-io/aicw-visibility), copyright (c) 2026-present AICW, licensed AGPL-3.0-only.

The reviewed upstream commit was `1d7780754b125be5a8f8cf3ce88ee499f3f80351`. Adapted areas include the native-fetch retry and page-capture approach, raw versus rendered text comparison, bot role classification, and page-level checks.

Upstream source locations:

- `src/utils/http-caller.ts`
- `src/config/ai-user-agents.ts`
- `src/actions/aicw-visibility/sub/check-content-javascript-rendering.ts`
- `src/actions/aicw-visibility/sub/check-content-json-ld.ts`
- `src/actions/aicw-visibility/sub/check-content-meta-tags.ts`
- `src/actions/aicw-visibility/sub/check-server-robots-txt.ts`
- `src/actions/aicw-visibility/sub/check-server-sitemap.ts`

The port replaces schema-count scoring with graph inspection and review findings. It uses parsed HTML and XML, per-path robots matching, bounded requests, and explicit unknown or skipped states. It does not reproduce the upstream aggregate visibility score or imply the same report format.

Bundled third-party dependencies retain their original licenses. The build copies the runtime dependency license files into each skill's `licenses/` directory. Development and test dependencies are not bundled into the skills.

The book, its illustrations, and its PDF/EPUB files retain their original copyright. The toolkit does not relicense or distribute them. See `resources/book.md` for source attribution and the chapter map.
