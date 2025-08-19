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
describe('findAttestations (mocked fs)', () => {
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
                "artifact-789": {
                // attestations_statuses is missing here to test robustness
                }
            }
        }
    };
    beforeAll(() => {
        fs.readFileSync.mockReturnValue(JSON.stringify(mockJsonData));
        fs.existsSync.mockReturnValue(true);
    });
    test('should find all attestations with the specified status', () => {
        const found = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'MISSING');
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
        fs.readFileSync.mockReturnValueOnce(JSON.stringify({}));
        const found1 = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'MISSING');
        expect(found1).toEqual([]);
        fs.readFileSync.mockReturnValueOnce(JSON.stringify({ compliance_status: {} }));
        const found2 = (0, check_template_complete_1.findAttestations)('dummy-path.json', 'MISSING');
        expect(found2).toEqual([]);
    });
    test('should throw an error if the JSON file does not exist', () => {
        fs.existsSync.mockReturnValueOnce(false);
        expect(() => (0, check_template_complete_1.findAttestations)('non-existent-file.json', 'MISSING'))
            .toThrow("Error: JSON file 'non-existent-file.json' not found.");
    });
    test('should throw an error if the file content is not valid JSON', () => {
        fs.readFileSync.mockReturnValueOnce('{');
        expect(() => (0, check_template_complete_1.findAttestations)('test-files/malformed.json', 'MISSING'))
            .toThrow(Error);
    });
    test('should find no MISSING attestations in the compliant trail file', () => {
        const realFs = jest.requireActual('fs');
        fs.readFileSync.mockReturnValueOnce(realFs.readFileSync('test-files/trail-compliant.json', 'utf-8'));
        const found = (0, check_template_complete_1.findAttestations)('test-files/trail-compliant.json', 'MISSING');
        expect(found).toEqual([]);
    });
});
describe('findAttestations (real file)', () => {
    test('should find correct MISSING attestations in the non-compliant trail file', () => {
        // Re-require the module under test with real fs (no mock)
        jest.resetModules();
        jest.unmock('fs');
        const { findAttestations: findAttestationsReal } = require('./check-template-complete');
        const found = findAttestationsReal('/home/sofus/git/kosli/templated-workflow/template-complete-action_js/test-files/trail-non-compliant.json', 'MISSING');
        expect(found).toEqual([
            "test-reports"
        ]);
    });
});
