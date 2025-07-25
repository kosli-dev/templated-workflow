# Begin Trail Action

This custom GitHub Action starts a Kosli trail for your workflow, initializing compliance tracking for your build.

## Usage

```yaml
- name: Begin Kosli Trail
  uses: ./begin-trail-action
  with:
    build_id: ${{ github.sha }}
```

## Inputs

- `build_id` (required): The ID of the build to check (typically the commit SHA).

## Details

This action runs `kosli begin trail` with the provided build ID and a template file (`flow.yaml`).  
See the [action.yml](./action.yml) for implementation details.
