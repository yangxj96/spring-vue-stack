# Manual forward-check

These are desk simulations: apply the Skill description, routing rules, and reference guidance to representative prompts and target-project facts. They do not claim that an agent runtime was installed or invoked.

## 1. Spring Boot feature in a JPA project

**Request:** “Add a paginated endpoint for listing invoices in this Spring Boot 4 project.”

**Target-project facts:** The project uses Spring Data JPA, a `InvoiceRepository`, and an existing application-service layer.

**Route:** The task touches backend/API work, so read `SKILL.md` and `references/backend.md`.

**Simulated decision:** Inspect the existing endpoint, repository, service, API contract, and tests first. Continue using Spring Data JPA and the existing service boundary. Do not introduce MyBatis, Mapper XML, or a new layering scheme. Check pagination and authorization against this project's existing contract.

**Outcome:** Pass. The project-selected ORM and architecture are preserved.

## 2. PostgreSQL migration with another tool and Schema boundary

**Request:** “Add a unique constraint for `(tenant_id, external_id)` to the inventory tables and migrate existing data.”

**Target-project facts:** PostgreSQL; Liquibase changelogs; business tables are in the `inventory` Schema; existing values may be duplicated.

**Route:** The request changes a database contract, so read `SKILL.md` and `references/postgres.md`.

**Simulated decision:** Inspect Liquibase conventions, schema-qualified objects, table size, duplicate rows, deployment compatibility, and current indexes before writing a changelog. Define a duplicate-detection/remediation step and a safe rollout. Do not assume Flyway, public Schema, Spectra prefixes, or that the constraint can be added without data cleanup.

**Outcome:** Pass. Migration tool, Schema boundary, existing data, and rollout safety are discovered first.

## 3. Redis unavailable during authentication state validation

**Request:** “Redis times out while checking whether the current refresh token has already been consumed. What should the service do?”

**Target-project facts:** Redis stores a security-relevant one-time token state; the repository has an authentication contract and centralized error mapping.

**Route:** The request changes or evaluates security state, so read `SKILL.md` and `references/redis.md`; read the relevant backend security guidance if changing the endpoint behavior.

**Simulated decision:** Do not reinterpret the timeout as “token not consumed” and do not silently retry into business logic. Trace the project's security contract and existing outage mapping, then use its required deny/retry/error behavior. Do not copy Spectra's HTTP status or executor implementation.

**Outcome:** Pass. No blanket fail-open rule or Spectra-specific response is imposed; the security contract controls.

## 4. Vue feature with a different state library and UI kit

**Request:** “Add an editable customer table to this Vue 3 app.”

**Target-project facts:** The app uses a project-specific composable store and Naive UI; it does not use Pinia or Element Plus.

**Route:** The task changes a Vue page and API usage, so read `SKILL.md` and `references/frontend.md`; read `backend.md` only if the API contract also changes.

**Simulated decision:** Inspect adjacent pages, the store/composable, UI kit, request layer, and lint rules. Build the table using the existing composable store and Naive UI. Do not add Pinia or Element Plus. Preserve the API's actual loading/error and permission behavior.

**Outcome:** Pass. Existing frontend libraries and patterns are retained.

## 5. Unrelated task in a repository that also uses the stack

**Request:** “Fix the spelling in an unrelated Python data-cleanup script.”

**Target-project facts:** The repository contains the supported stack, but this change touches only a standalone Python utility.

**Route:** The Skill description says to use it only when a task touches its listed backend, frontend, database, Redis, or cross-layer areas. This request does not meet that condition.

**Simulated decision:** Do not load this Skill's stack references or impose Java/Vue/PostgreSQL/Redis conventions on the Python utility.

**Outcome:** Pass. The repository's stack alone does not force activation for an unrelated task.

## 6. Project outside the supported stack

**Request:** “Add a React page backed by SQLite to this Spring Boot 3 project.”

**Target-project facts:** Spring Boot 3, React, and SQLite; no Vue 3, PostgreSQL, or Redis in scope.

**Route:** The requested frontend and data changes do not match the Skill's supported areas/versions. Do not apply these references as defaults.

**Simulated decision:** Follow the repository's own instructions and frameworks. This Skill is not a migration mandate; if a narrow Spring backend detail remains relevant, use it only if its guidance fits the actual project and version, after verifying the current documentation.

**Outcome:** Pass. The package does not require migration to the named stack.
