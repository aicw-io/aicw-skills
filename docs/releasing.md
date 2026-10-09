# Maintain and release AICW Skills

Maintain one repository. Edit shared code in `src/`, guidance in `resources/`, and entry points in `skills/*/SKILL.md`. Keep optimization recommendations tied to the book's 25 checklist items or a specific cited passage. Preserve the distinction between book guidance and current implementation corrections.

`package.json` supplies the version used in reports, CLI help, and generated skill metadata. Each skill's `scripts/`, `references/`, and `licenses/` folders are generated and replaced by the build. Keep custom edits in their maintained sources.

## Validate a change

```sh
npm ci
npm run build
npm run check:build
npm run validate
npm test
npm run test:integration
```

`check:build` detects stale artifacts, removes a deliberately planted obsolete reference, and compares two builds. The integration suite requires Chrome and can download WordPress runtime files. Missing required integration prerequisites are failures, not successful skips.

CI runs core checks on Linux, macOS, and Windows with Node.js 22 and 24. The browser/WordPress integration job runs on macOS. A configured workflow is not evidence that hosted jobs have run; record the actual results after publication.

## Check agent behavior when instructions change

Read [the evaluation guide](../evals/README.md). Run the relevant cases with locally authenticated clients. Keep raw conversations in ignored `.local/agent-evals/`; publish only factual, sanitized results in [validation](validation.md). Test direct and natural invocation, source attribution, and the outcome of edits. Recheck critical cases in fresh sessions after fixing a failure.

## Prepare the public candidate

```sh
npm run release:prepare
```

This prepares `release/aicw-skills-VERSION/`, a source archive, a file manifest, and an archive checksum. It uses an explicit allowlist, includes source and build files, and excludes local history, audit reports, runtime data, extracted book text, and dependencies. It checks the generated skills and runs each packaged helper from outside its directory. It does not create a GitHub repository or publish anything.

Extract the archive in a fresh directory, verify its manifest, install the skills into a disposable project, and run a real audit. Keep the source, notices, dependency licenses, and book attribution in the release. The repeated script/reference files are intentional: one installed skill must not depend on another skill's directory.

The public tree contains user guidance, synthetic tests, and reproducible source. Local planning history and raw evaluations can stay under ignored `.local/`. Temporary runtime installations and backups belong under ignored `.tmp/`; remove them after saving any useful test evidence. Credentials and real client data do not belong in the public tree.

Keep `private: true` in `package.json` while the project is distributed through GitHub rather than npm. Publish only through a separately requested release action. State which agent versions and operating systems were actually tested.
