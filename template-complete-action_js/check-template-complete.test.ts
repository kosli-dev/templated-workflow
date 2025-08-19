// src/check-template-complete.test.ts
import { findAttestations } from './check-template-complete'; // Import the function to test
import * as fs from 'fs'; // Import the fs module to mock it

// --- Mocking (Similar to Mockito in Java) ---
// Jest's `jest.mock()` allows us to replace actual module implementations
// with mock versions. This is crucial for unit testing, as it prevents
// tests from interacting with the file system, making them faster and more deterministic.
jest.mock('fs');

describe('findAttestations', () => {
    // --- Mock Data ---
    // This JSON data will be used by our mocked `fs.readFileSync`
    const mockJsonData = {
        compliance_status: {
            attestations_statuses: [
                { attestation_name: "Direct Attestation A", status: "MISSING" },
                { attestation_name: "Direct Attestation B", status: "COMPLETE" },
                { attestation_name: "Direct Attestation C", status: "MISSING" },
            ],
            artifacts_statuses: {
                "artifact-123": {
                    attestations_statuses: [
                        { attestation_name: "Nested Attestation X", status: "MISSING" },
                        { attestation_name: "Nested Attestation Y", status: "COMPLETE" },
                    ]
                },
                "artifact-456": {
                    attestations_statuses: [
                        { attestation_name: "Nested Attestation Z", status: "MISSING" },
                    ]
                },
                // An artifact with no attestations_statuses
                "artifact-789": {
                    // attestations_statuses is missing here to test robustness
                }
            }
        }
    };

    // --- Setup Before All Tests ---
    // `beforeAll` runs once before any tests in this describe block.
    // We cast `fs.readFileSync` and `fs.existsSync` to `jest.Mock` to access
    // Jest's mocking methods like `mockReturnValue`.
    beforeAll(() => {
        // When `fs.readFileSync` is called, it will return our stringified mock data.
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockJsonData));
        // When `fs.existsSync` is called, it will always return true, simulating file existence.
        (fs.existsSync as jest.Mock).mockReturnValue(true);
    });

    // --- Test Cases ---
    // `test` (or `it`) defines an individual test case.
    test('should find all attestations with the specified status', () => {
        const found = findAttestations('dummy-path.json', 'MISSING');
        // `expect` is Jest's assertion function, similar to `assertEquals` in JUnit.
        // `toEqual` performs a deep comparison for arrays and objects.
        expect(found).toEqual([
            "Direct Attestation A",
            "Direct Attestation C",
            "Nested Attestation X",
            "Nested Attestation Z"
        ]);
    });

    test('should return an empty array if no attestations are found with the status', () => {
        const found = findAttestations('dummy-path.json', 'NON_EXISTENT_STATUS');
        expect(found).toEqual([]);
    });

    test('should return an empty array if the compliance_status or attestations_statuses are missing', () => {
        // Temporarily mock data to simulate missing structures
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify({})); // Empty object
        const found1 = findAttestations('dummy-path.json', 'MISSING');
        expect(found1).toEqual([]);

        (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify({ compliance_status: {} })); // Empty compliance_status
        const found2 = findAttestations('dummy-path.json', 'MISSING');
        expect(found2).toEqual([]);
    });

    test('should throw an error if the JSON file does not exist', () => {
        // For this specific test, we make `fs.existsSync` return false.
        // `mockReturnValueOnce` ensures this mock only applies to this call.
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
        // `toThrow` asserts that the function throws an error.
        expect(() => findAttestations('non-existent-file.json', 'MISSING'))
            .toThrow("Error: JSON file 'non-existent-file.json' not found.");
    });

      test('should throw an error if the file content is not valid JSON', () => {
        // Provide a clearly malformed JSON string.
        // Using just '{' will typically result in "Unexpected end of JSON input".
        (fs.readFileSync as jest.Mock).mockReturnValueOnce('{');
        expect(() => findAttestations('malformed.json', 'MISSING'))
            // Assert that an Error object is thrown, and its message contains "JSON input".
            // This is more resilient to minor variations in error messages.
            .toThrow(Error);
    });

    test('should find no MISSING attestations in the compliant trail file', () => {
        // Use the actual compliant trail file
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(
            fs.readFileSync('trail-compliant.json', 'utf-8')
        );
        const found = findAttestations('trail-compliant.json', 'MISSING');
        expect(found).toEqual([]);
    });

    test('should find correct MISSING attestations in the non-compliant trail file', () => {
        // Use the actual non-compliant trail file
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(
            fs.readFileSync('/home/sofus/git/kosli/templated-workflow/template-complete-action_js/trail-non-compliant.json', 'utf-8')
        );
        const found = findAttestations('/home/sofus/git/kosli/templated-workflow/template-complete-action_js/trail-non-compliant.json', 'MISSING');
        expect(found).toEqual([
            "test-reports"
        ]);
    });
});