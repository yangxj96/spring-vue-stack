# Spring + Vue Stack Skill

A portable Agent Skills package for development work in projects using Spring Boot 4.x, Vue 3.x, PostgreSQL, and Redis.

The core Skill is in [`skills/spring-vue-stack/`](skills/spring-vue-stack/). It uses `SKILL.md` and Markdown references and does not require a Codex plugin manifest, MCP server, or tool-specific runtime. It provides general guidance while leaving architecture, libraries, API contracts, migration tools, and commands to each target repository.

## Use in an agent tool

Agent tools differ in how they discover, install, enable, and refresh Skills. Check the selected tool's current documentation for its supported local Skill directory or plugin mechanism.

For a tool that discovers skills from local directories:

1. Clone this repository, or download a release archive.
2. Make `skills/spring-vue-stack/` available under a directory the tool recognizes. You can copy or link the Skill folder using that tool's documented method.
3. Start a new task or session and ask for work in a repository using the supported stack. The Skill first checks the target repository's instructions and existing implementation.

Do not copy the whole repository into a tool's skill directory unless its documentation expects that layout. The portable unit is the `spring-vue-stack` folder containing `SKILL.md` and `references/`.

## Updates and version pins

The Agent Skills directory format does not itself fetch updates.

- **Linked install:** update the source checkout (for example, run `git pull --ff-only` there) and confirm the link still points to that checkout.
- **Copied install:** update the source checkout or download a newer archive, then copy the complete updated `spring-vue-stack/` directory over the installed copy. Updating only the source checkout does not update the copied Skill.
- **Archive install:** download a new archive and replace the installed Skill directory with its updated contents.

Some tools may offer their own marketplace refresh or plugin update mechanism; follow that tool's documentation and check whether the active session must be restarted to load changed files.

For repeatable team use, pin a release tag or commit and update that pin through review. A tool-specific startup updater is intentionally not bundled, so installing this Skill does not silently introduce network activity or modify user-level agent configuration.

## Scope

- Backend guidance: Spring Boot and Java service/API work.
- Frontend guidance: Vue 3 and TypeScript UI work.
- Data guidance: PostgreSQL schema, query, and migration work.
- State guidance: Redis cache, security state, and coordination behavior.
- Delivery guidance: API/schema/configuration documentation and project-specific verification.

This is not a project scaffold and does not prescribe a specific ORM, UI library, state manager, router, API response shape, authentication design, database migration tool, or build command. Version-sensitive details must be checked against the dependencies used by the target project.

## License

MIT. See [`LICENSE`](LICENSE).
