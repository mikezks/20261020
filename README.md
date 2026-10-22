# Monorepo

## Generate Monorepo, App & Lib

1. Generate Monorepo:

    ```bash
    npx ng g lib booking --project-root libs/domain/booking --entry-file index
    ```

1. Generate Application:

    ```bash
    npx ng g app shell --project-root apps/shell
    ```

1. Generate Library:

    ```bash
    npx ng g lib booking --project-root libs/domain/booking --entry-file index
    ```