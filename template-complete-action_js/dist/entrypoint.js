'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const child_process_1 = require("child_process");
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const jsonFilePath = core.getInput("json_file_path", { required: true });
            const statusToFind = core.getInput("status_to_find", { required: true });
            // Run the compiled JS file with the inputs
            (0, child_process_1.execSync)(`node dist/check-template-complete.js "${jsonFilePath}" "${statusToFind}"`, { stdio: "inherit" });
        }
        catch (error) {
            core.setFailed(error.message || "Action failed");
        }
    });
}
run();
//# sourceMappingURL=entrypoint.js.map
