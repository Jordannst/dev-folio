export const authEnvNames = ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "ADMIN_GITHUB_ID", "SESSION_SECRET"] as const;

// Names only, never values: the admin panel lists what still has to be configured.
export const missingAuthEnv = (env: Record<string, string | undefined> = process.env): string[] => authEnvNames.filter(name => !env[name]);
