export const MARKETPLACE_SCHEMA_URL =
  "https://anthropic.com/claude-code/marketplace.schema.json";

export const ALLOWED_LSP_FIELDS = [
  "command",
  "args",
  "transport",
  "env",
  "extensionToLanguage",
  "filePatterns",
  "workspaceFolder",
  "initializationOptions",
  "settings",
  "startupTimeout",
  "shutdownTimeout",
  "restartOnCrash",
  "maxRestarts",
];

export const LEGACY_LSP_FIELDS = ["languages", "fileExtensions"];

export const MARKETPLACE_KEY_ORDER = [
  "$schema",
  "name",
  "version",
  "description",
  "owner",
  "plugins",
];

export const PLUGIN_KEY_ORDER = [
  "name",
  "version",
  "source",
  "description",
  "category",
  "tags",
  "author",
  "lspServers",
];

const ALLOWED_LSP_FIELD_SET = new Set(ALLOWED_LSP_FIELDS);
const LEGACY_LSP_FIELD_SET = new Set(LEGACY_LSP_FIELDS);

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function sortObjectDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sorted = {};
  for (const key of Object.keys(value).sort()) {
    sorted[key] = sortObjectDeep(value[key]);
  }
  return sorted;
}

export function reorderKeys(value, preferredOrder) {
  const result = {};
  for (const key of preferredOrder) {
    if (Object.hasOwn(value, key)) {
      result[key] = value[key];
    }
  }

  for (const key of Object.keys(value).sort()) {
    if (!Object.hasOwn(result, key)) {
      result[key] = value[key];
    }
  }

  return result;
}

function normalizeExtensionToLanguage(value, context, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${context} must be an object of extension -> languageId entries`);
    return null;
  }

  const normalized = {};
  for (const extension of Object.keys(value).sort()) {
    const languageId = value[extension];
    if (typeof languageId !== "string") {
      errors.push(`${context}.${extension} must be a string`);
      continue;
    }
    normalized[extension] = languageId;
  }
  return normalized;
}

function normalizeStringArray(value, context, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${context} must be an array`);
    return null;
  }

  const normalized = [];
  for (const item of value) {
    if (typeof item !== "string") {
      errors.push(`${context} items must be strings`);
      continue;
    }
    normalized.push(item);
  }
  return normalized;
}

function normalizeEnv(value, context, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${context} must be an object of env var key/value pairs`);
    return null;
  }

  const normalized = {};
  for (const key of Object.keys(value).sort()) {
    const envValue = value[key];
    if (typeof envValue !== "string") {
      errors.push(`${context}.${key} must be a string`);
      continue;
    }
    normalized[key] = envValue;
  }
  return normalized;
}

function normalizeServerConfig(serverName, serverConfig, pluginLabel) {
  const context = `${pluginLabel}.${serverName}`;
  const errors = [];

  if (!isPlainObject(serverConfig)) {
    return {
      normalized: null,
      errors: [`${context} must be an object`],
    };
  }

  for (const field of Object.keys(serverConfig)) {
    if (LEGACY_LSP_FIELD_SET.has(field)) {
      errors.push(`${context} uses legacy field "${field}"`);
    }

    if (!ALLOWED_LSP_FIELD_SET.has(field)) {
      errors.push(`${context} uses unsupported field "${field}"`);
    }
  }

  const normalized = {};
  for (const key of ALLOWED_LSP_FIELDS) {
    if (!Object.hasOwn(serverConfig, key)) {
      continue;
    }

    const value = serverConfig[key];
    if (key === "command" || key === "transport" || key === "workspaceFolder") {
      if (typeof value !== "string") {
        errors.push(`${context}.${key} must be a string`);
        continue;
      }
      normalized[key] = value;
      continue;
    }

    if (key === "args" || key === "filePatterns") {
      const normalizedValue = normalizeStringArray(value, `${context}.${key}`, errors);
      if (normalizedValue) {
        normalized[key] = normalizedValue;
      }
      continue;
    }

    if (key === "extensionToLanguage") {
      const normalizedValue = normalizeExtensionToLanguage(
        value,
        `${context}.${key}`,
        errors,
      );
      if (normalizedValue) {
        normalized[key] = normalizedValue;
      }
      continue;
    }

    if (key === "env") {
      const normalizedValue = normalizeEnv(value, `${context}.${key}`, errors);
      if (normalizedValue) {
        normalized[key] = normalizedValue;
      }
      continue;
    }

    if (key === "initializationOptions" || key === "settings") {
      if (!isPlainObject(value)) {
        errors.push(`${context}.${key} must be an object`);
        continue;
      }
      normalized[key] = sortObjectDeep(value);
      continue;
    }

    if (
      key === "startupTimeout" ||
      key === "shutdownTimeout" ||
      key === "maxRestarts"
    ) {
      if (!Number.isInteger(value) || value < 0) {
        errors.push(`${context}.${key} must be a non-negative integer`);
        continue;
      }
      normalized[key] = value;
      continue;
    }

    if (key === "restartOnCrash") {
      if (typeof value !== "boolean") {
        errors.push(`${context}.${key} must be a boolean`);
        continue;
      }
      normalized[key] = value;
      continue;
    }
  }

  if (!Object.hasOwn(normalized, "command")) {
    errors.push(`${context}.command is required`);
  }
  if (!Object.hasOwn(normalized, "transport")) {
    errors.push(`${context}.transport is required`);
  }
  if (!Object.hasOwn(normalized, "extensionToLanguage")) {
    errors.push(`${context}.extensionToLanguage is required`);
  }

  return {
    normalized: errors.length === 0 ? normalized : null,
    errors,
  };
}

export function normalizeLspServers(rawServers, pluginLabel) {
  if (!isPlainObject(rawServers)) {
    return {
      normalized: null,
      errors: [`${pluginLabel} must define an object of LSP servers`],
    };
  }

  const normalized = {};
  const errors = [];
  for (const serverName of Object.keys(rawServers).sort()) {
    const serverResult = normalizeServerConfig(
      serverName,
      rawServers[serverName],
      pluginLabel,
    );
    if (serverResult.normalized) {
      normalized[serverName] = serverResult.normalized;
    }
    errors.push(...serverResult.errors);
  }

  return {
    normalized: errors.length === 0 ? normalized : null,
    errors,
  };
}
