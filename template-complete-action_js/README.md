# Check Template Complete Action

This custom GitHub Action checks if all required attestations in a Kosli trail are complete by parsing a JSON status file.

## Usage

```yaml
- name: Check Kosli Template Complete
  uses: ./template-complete-action
  with:
    json_file_path: path/to/status.json
    status_to_find: MISSING
```

## Inputs

- `json_file_path` (required): Path to the JSON file containing the trail data.
- `status_to_find` (required): The status to look for in the attestations (e.g., `MISSING`, `COMPLETE`).

## Details

This action runs a shell script to parse the JSON and report any attestations with the specified status.  
See the [action.yml](./action.yml) for implementation details.
