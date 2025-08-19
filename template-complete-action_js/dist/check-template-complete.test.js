"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/check-template-complete.test.ts
const check_template_complete_1 = require("./check-template-complete"); // Import the function to test
const fs = __importStar(require("fs")); // Import the fs module to mock it
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
        fs.readFileSync.mockReturnValue(JSON.stringify(mockJsonData));
        // When `fs.existsSync` is called, it will always return true, simulating file existence.
        fs.existsSync.mockReturnValue(true);
    });
    // --- Test Cases ---
    // `test` (or `it`) defines an individual test case.
    test('should find all attestations with the specified status', () => {
        const found = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'MISSING');
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
        const found = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'NON_EXISTENT_STATUS');
        expect(found).toEqual([]);
    });
    test('should return an empty array if the compliance_status or attestations_statuses are missing', () => {
        // Temporarily mock data to simulate missing structures
        fs.readFileSync.mockReturnValueOnce(JSON.stringify({})); // Empty object
        const found1 = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'MISSING');
        expect(found1).toEqual([]);
        fs.readFileSync.mockReturnValueOnce(JSON.stringify({ compliance_status: {} })); // Empty compliance_status
        const found2 = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'MISSING');
        expect(found2).toEqual([]);
    });
    test('should throw an error if the JSON file does not exist', () => {
        // For this specific test, we make `fs.existsSync` return false.
        // `mockReturnValueOnce` ensures this mock only applies to this call.
        fs.existsSync.mockReturnValueOnce(false);
        // `toThrow` asserts that the function throws an error.
        expect(() => (0, check_template_complete_1.findAttestations)('non-existent-file.json', 'MISSING'))
            .toThrow("Error: JSON file 'non-existent-file.json' not found.");
    });
    test('should throw an error if the file content is not valid JSON', () => {
        // Provide a clearly malformed JSON string.
        // Using just '{' will typically result in "Unexpected end of JSON input".
        fs.readFileSync.mockReturnValueOnce('{');
        expect(() => (0, check_template_complete_1.findAttestations)('malformed.json', 'MISSING'))
            // Assert that an Error object is thrown, and its message contains "JSON input".
            // This is more resilient to minor variations in error messages.
            .toThrow(Error);
        expect(() => (0, check_template_complete_1.findAttestations)('malformed.json', 'MISSING'))
            .toThrow(/JSON input/); // Checks if the error message contains "JSON input"
    });
});
