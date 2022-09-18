const defaultEnvVars = ["__TEST_TMP_PATH", "__TEST_SCRIPT_PATH"] as const;

console.log(process.env);

function getEnvVar(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Default testing environment variable ${key} is undefined`);
  }
  return value;
}

const env = {} as { [k in typeof defaultEnvVars[number]]: string };

for (const key of defaultEnvVars) {
  env[key] = getEnvVar(key);
}

export default env;
