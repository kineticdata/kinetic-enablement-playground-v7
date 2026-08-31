# Kinetic Enablement Playground

This repo is a working Kinetic Platform portal (`portal/`) for partners to
run against their own space, plus an **optional** AI skills library at
`ai-skills/`. The portal runs fine with or without that library — see
[ONBOARDING.md](ONBOARDING.md) for the two independent tracks.

The skills library ships as an optional git submodule at `ai-skills/`. When
it's initialized (`git submodule update --init ai-skills`), the import
below pulls its guidance in automatically. When it isn't initialized, this
import simply resolves to nothing — that's expected and harmless, not an
error.

@ai-skills/CLAUDE.md
