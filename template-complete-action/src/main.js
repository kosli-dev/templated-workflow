import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * Reads and parses a JSON file.
 * @param {string} filePath The path to the JSON file.
 * @returns {object} The parsed JSON data.
 * @throws {Error} If the file is not found or cannot be parsed.
 */
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file '${filePath}' not found.`)
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    throw new Error(`Error reading or parsing JSON file: ${error.message}`)
  }
}

/**
 * Finds attestations with a specific status within the JSON data structure.
 * This function recursively traverses the object to find all relevant attestations.
 * @param {object} data The JSON data object to search within.
 * @param {string} targetStatus The status string to search for (e.g., "MISSING", "COMPLETE").
 * @returns {string[]} An array of attestation names that match the target status.
 */
function findAttestationsByStatus(data, targetStatus) {
  const foundAttestations = []

  // Helper function to process an array of attestation statuses
  const processAttestationArray = (attestationArray) => {
    if (Array.isArray(attestationArray)) {
      attestationArray.forEach((attestation) => {
        if (
          attestation &&
          attestation.status === targetStatus &&
          attestation.attestation_name
        ) {
          foundAttestations.push(attestation.attestation_name)
        }
      })
    }
  }

  // Check for attestations directly under compliance_status
  if (data && data.compliance_status) {
    processAttestationArray(data.compliance_status.attestations_statuses)

    // Check for attestations nested under artifacts_statuses
    if (data.compliance_status.artifacts_statuses) {
      const artifactsStatuses = data.compliance_status.artifacts_statuses
      for (const key in artifactsStatuses) {
        if (
          Object.prototype.hasOwnProperty.call(artifactsStatuses, key) &&
          typeof artifactsStatuses[key] === 'object'
        ) {
          const artifact = artifactsStatuses[key]
          processAttestationArray(artifact.attestations_statuses)
        }
      }
    }
  }

  return foundAttestations
}

/**
 * Prints the results of the attestation search to the console.
 * @param {string[]} attestations An array of attestation names found.
 * @param {string} statusToFind The status string that was searched for.
 */
function printResults(attestations, statusToFind) {
  if (attestations.length > 0) {
    core.setFailed(
      `Found ${attestations.length} attestations with status '${statusToFind}'.`
    )

    core.info(`The following attestations have a '${statusToFind}' status:`)
    attestations.forEach((attestation) => {
      core.info(`- ${attestation}`)
    })
    process.exit(1) // Exit with a non-zero code if attestations were found
  } else {
    core.info(`No attestations found with '${statusToFind}' status.`)
    process.exit(0) // Exit with a zero code if no attestations were found
  }
}
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    const jsonFilePath = core.getInput('json_file_path', { required: true })
    const statusToFind = core.getInput('status_to_find', { required: true })
    core.info(`Searching for attestations with status: ${statusToFind}`)

    const jsonData = readJsonFile(jsonFilePath)
    const foundAttestations = findAttestationsByStatus(jsonData, statusToFind)
    printResults(foundAttestations, statusToFind)
  } catch (error) {
    core.error(`Error: ${error.message}`)
    process.exit(1) // Exit with a non-zero code for any unhandled errors
  }
}
