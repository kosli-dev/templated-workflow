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
# Using 'cat "$json_file"' to read the content of the file
json_data=$(cat "$json_file")

# JQ query to extract attestation name and status
# We use -r to output raw strings and @tsv to format as tab-separated values
# This makes it easier to parse in bash.
# The query now filters for the specific status provided as an argument.
jq_query='
(
  .compliance_status.attestations_statuses[]?, # Attestations directly under compliance_status
  .compliance_status.artifacts_statuses | to_entries[]?.value | select(type == "object") | .attestations_statuses[]? # Attestations nested under artifacts
)
| select(.status == "'"$status_to_find"'")
| [.attestation_name, .status]
| @tsv
'

# Initialize an empty array to store attestations with the specified status
found_attestations=()

# Execute the jq command and loop through the output
# IFS=$'\t' sets the Internal Field Separator to tab for parsing TSV
# -r option for read prevents backslash escapes from being interpreted
while IFS=$'\t' read -r name status; do
  # Add the attestation name to the array if it matches the status
  found_attestations+=("$name")
done < <(echo "$json_data" | jq -r "$jq_query")

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