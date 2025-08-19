// See: https://rollupjs.org/introduction/

import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = [
  {
    input: "check-template-complete.ts",
    output: {
      file: "dist/check-template-complete.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      typescript({ exclude: ["**/__tests__", "**/*.test.ts"] }),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
    ],
  },
  {
    input: "entrypoint.ts",
    output: {
      file: "dist/entrypoint.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      typescript({ exclude: ["**/__tests__", "**/*.test.ts"] }),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
    ],
  },
];

export default config;
