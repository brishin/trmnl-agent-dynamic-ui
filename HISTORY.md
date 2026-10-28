# Reconstructed development history

This repository was initialized after the plugin was built. Its first four commits reconstruct the development stages from the source and conversation; they are not original timestamped snapshots. All commits use the actual repository-creation time. Intermediate versions restore the relevant earlier behavior, rather than claiming byte-for-byte historical archives.

1. Bounded grid: five block types, schema validation, two-row budget, sample data and local renders.
2. Varied compositions: editorial, spotlight, timeline, scoreboard, focus and dispatch.
3. Readable design system: shared tokens, 16px floor, heavier small text, removed v2 footer and computed-style checks.
4. Inline MCP contract: generated schema/design/update guidance embedded in a non-rendering Liquid comment; repository documentation and reproducible build entry points.

Generated output is ignored. `npm ci` then `npm test` builds and verifies the current source. See `DESIGN-SYSTEM.md` for the rules and `README.md` for the MCP workflow.
