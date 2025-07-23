#!/bin/bash

# This script reads JSON data from a specified file and checks for attestations
# with a given status.
#
# Usage: ./check_attestations.sh <json_file_path> <status_to_look_for>
#
# Arguments:
#   <json_file_path>: The path to the JSON file containing the attestation data.
#   <status_to_look_for>: The status string to search for (e.g., "MISSING", "COMPLETE").

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <json_file_path> <status_to_look_for>"
  echo "Example: $0 data.json MISSING"
  exit 1
fi

json_file="$1"
status_to_find="$2"

# Check if the specified JSON file exists
if [ ! -f "$json_file" ]; then
  echo "Error: JSON file '$json_file' not found."
  exit 1
fi

# Read the JSON data from the file
json_data=$(cat "$json_file")

# Initialize an empty array to store attestations with the specified status
found_attestations=()

# JQ query for attestations directly under .compliance_status.attestations_statuses
jq_query_direct='
.compliance_status.attestations_statuses[]?
| select(.status == "'"$status_to_find"'")
| [.attestation_name, .status]
| @tsv
'

# Execute the jq command for direct attestations and loop through the output
while IFS=$'\t' read -r name status; do
  found_attestations+=("$name")
done < <(echo "$json_data" | jq -r "$jq_query_direct")

# JQ query for attestations nested under .compliance_status.artifacts_statuses
jq_query_nested='
.compliance_status.artifacts_statuses | to_entries[]?.value
| select(type == "object")
| .attestations_statuses[]?
| select(.status == "'"$status_to_find"'")
| [.attestation_name, .status]
| @tsv
'

# Execute the jq command for nested attestations and loop through the output
while IFS=$'\t' read -r name status; do
  found_attestations+=("$name")
done < <(echo "$json_data" | jq -r "$jq_query_nested")

# Check if any attestations with the specified status were found
if [ ${#found_attestations[@]} -gt 0 ]; then
  echo "The following attestations have a '$status_to_find' status:"
  # Loop through and print each found attestation
  for attestation in "${found_attestations[@]}"; do
    echo "- $attestation"
  done
  exit 1
else
  echo "No attestations found with '$status_to_find' status."
fi