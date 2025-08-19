import * as core from "@actions/core";
import { execSync } from "child_process";

function run(): void {
  try {
    const jsonFilePath = core.getInput("json_file_path", { required: true });
    const statusToFind = core.getInput("status_to_find", { required: true });

    // Run the compiled JS file with the inputs
    execSync(
      `node dist/check-template-complete.js "${jsonFilePath}" "${statusToFind}"`,
      { stdio: "inherit" },
    );
  } catch (error: any) {
    core.setFailed(error.message || "Action failed");
  }
}

run();
