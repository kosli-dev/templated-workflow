'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
exports.findAttestations = findAttestations;
const tslib_1 = require("tslib");
// src/checkAttestations.ts
const fs = tslib_1.__importStar(require("fs")); // Node.js built-in file system module
/**
 * Reads a JSON file, parses its content, and finds attestations
 * with a specified status.
 *
 * @param jsonFilePath - The path to the JSON file.
 * @param statusToFind - The status string to search for (e.g., "MISSING", "COMPLETE").
 * @returns An array of attestation names with the specified status.
 * @throws Error if the JSON file is not found or cannot be parsed.
 */
function findAttestations(jsonFilePath, statusToFind) {
    // --- Argument and File Existence Check (Bash: `if [ ! -f "$json_file" ]`) ---
    // Instead of `exit 1` in bash, we throw an error in TypeScript.
    // This is a more idiomatic way to handle errors in functions, allowing
    // the caller to decide how to handle the exception.
    if (!fs.existsSync(jsonFilePath)) {
        throw new Error(`Error: JSON file '${jsonFilePath}' not found.`);
    }
    // --- Read and Parse JSON Data (Bash: `json_data=$(cat "$json_file")` then `jq`) ---
    // `fs.readFileSync` reads the file content synchronously. For larger files
    // or long-running applications, you'd typically use asynchronous `fs.promises.readFile`
    // with `async/await` to avoid blocking the Node.js event loop.
    // `JSON.parse` is the built-in JavaScript function to convert a JSON string into a JavaScript object.
    const fileContent = fs.readFileSync(jsonFilePath, "utf8");
    let data;
    try {
        data = JSON.parse(fileContent);
    }
    catch (error) {
        throw new Error(`Error parsing JSON file '${jsonFilePath}': ${error instanceof Error ? error.message : String(error)}`);
    }
    // Add this check! If compliance_status is missing, we have nothing to process.
    const complianceStatus = data.compliance_status;
    if (!complianceStatus) {
        return [];
    }
    const foundAttestations = [];
    // Now, these checks are safe because complianceStatus is guaranteed to exist
    // --- Process Direct Attestations (Bash: `jq_query_direct`) ---
    // This is where functional programming shines.
    // `?.` (optional chaining) safely accesses nested properties that might be undefined.
    // `.filter()`: Creates a new array with all elements that pass the test implemented by the provided function.
    // `.map()`: Creates a new array populated with the results of calling a provided function on every element in the calling array.
    // This is very similar to Java's Stream API: `stream().filter(...).map(...).collect(...)`
    if (complianceStatus.attestations_statuses) {
        const directAttestations = complianceStatus.attestations_statuses
            .filter((att) => att.status === statusToFind)
            .map((att) => att.attestation_name);
        foundAttestations.push(...directAttestations);
    }
    // --- Process Nested Attestations (Bash: `jq_query_nested`) ---
    // `Object.values()`: Returns an array of a given object's own enumerable property values.
    // `.flatMap()`: A combination of `map` and `flat`. It maps each element using a mapping function,
    // then flattens the result into a new array. Perfect for handling nested arrays like `attestations_statuses`.
    if (complianceStatus.artifacts_statuses) {
        const nestedAttestations = Object.values(complianceStatus.artifacts_statuses)
            .flatMap((artifact) => artifact.attestations_statuses || [])
            .filter((att) => att.status === statusToFind)
            .map((att) => att.attestation_name);
        foundAttestations.push(...nestedAttestations);
    }
    return foundAttestations;
}
// --- Main Execution Block (Bash: Top-level script logic) ---
// `if (require.main === module)` is the Node.js equivalent of checking if a script
// is being run directly (like `if __name__ == "__main__":` in Python).
// `process.argv` is an array containing the command-line arguments.
// `process.argv[0]` is 'node', `process.argv[1]` is the script path,
// so actual arguments start from index 2.
if (require.main === module) {
    const args = process.argv.slice(2); // Get actual arguments
    // --- Argument Count Check (Bash: `if [ "$#" -ne 2 ]`) ---
    if (args.length !== 2) {
        console.error("Usage: ts-node src/checkAttestations.ts <json_file_path> <status_to_look_for>");
        console.error("Example: ts-node src/checkAttestations.ts data.json MISSING");
        process.exit(1); // Exit with a non-zero code to indicate an error
    }
    const jsonFilePath = args[0];
    const statusToFind = args[1];
    try {
        const foundAttestations = findAttestations(jsonFilePath, statusToFind);
        // --- Output and Exit Status (Bash: `if [ ${#found_attestations[@]} -gt 0 ]`) ---
        if (foundAttestations.length > 0) {
            console.log(`The following attestations have a '${statusToFind}' status:`);
            foundAttestations.forEach((attestation) => console.log(`- ${attestation}`));
            // Bash exits with 1 if found. Mimicking that behavior.
            process.exit(1);
        }
        else {
            console.log(`No attestations found with '${statusToFind}' status.`);
            process.exit(0); // Exit with 0 for success
        }
    }
    catch (error) {
        // Catch any errors thrown by `findAttestations`
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error("An unknown error occurred.");
        }
        process.exit(1);
    }
}
//# sourceMappingURL=check-template-complete.js.map
