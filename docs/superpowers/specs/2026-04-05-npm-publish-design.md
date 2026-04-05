# NPM Publish Workflow Design

**Date:** 2026-04-05
**Status:** Approved

## Overview

Add a GitHub Actions workflow that automatically publishes `ember-cli-deploy-brotli` to npm when a merge to `master` bumps the version in `package.json`, and the CI tests pass.

## Trigger

A separate `publish.yml` workflow file, triggered via `workflow_run` on the `Node.js CI` workflow:

- Event: `workflow_run`
- Workflows: `["Node.js CI"]`
- Types: `[completed]`
- Only proceeds if `github.event.workflow_run.conclusion == 'success'` and the branch is `master`

This ensures the publish job never runs unless the full test matrix has passed.

## Version Detection

A bash step diffs `package.json` between `HEAD~1` and `HEAD` to check whether the `version` field changed:

```bash
git diff HEAD~1 HEAD -- package.json | grep '"version"'
```

If no version change is detected, the workflow exits early without publishing.

**Constraint:** This relies on standard merge commits. It will not work correctly with squash merges, where the version bump and other changes may be collapsed into a single commit with no `HEAD~1` diff. The default GitHub merge strategy (merge commits) is required.

## Publish Step

- Sets up pnpm and Node.js `22.x` (single version — no matrix needed for publish)
- Runs `pnpm install` to restore dependencies
- Runs `pnpm publish --no-git-checks` to publish to npm

## Authentication

Uses an `NPM_TOKEN` secret configured in the repository's GitHub Actions secrets. The token must have publish permissions for the `ember-cli-deploy-brotli` package.

The `NODE_AUTH_TOKEN` environment variable is set on the `setup-node` step to wire up the `.npmrc` automatically.

## Files Changed

- `.github/workflows/publish.yml` — new file
