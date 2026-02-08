import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import type { ValidateFunction } from 'ajv';

// ─── File paths ───
const SCHEMAS_DIR = join(__dirname, 'schemas');
const FACTORY_PATH = join(SCHEMAS_DIR, 'policyManifestSchema.json');
const USER_PATH = join(SCHEMAS_DIR, 'policyManifestSchema.user.json');

// ─── State ───
let currentSchema: Record<string, unknown>;
let compiledValidator: ValidateFunction;

function compileSchema(schema: Record<string, unknown>): ValidateFunction {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    return ajv.compile(schema);
}

function loadSchema(): Record<string, unknown> {
    // User file takes precedence over factory default
    const path = existsSync(USER_PATH) ? USER_PATH : FACTORY_PATH;
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw);
}

// Initialize on import
currentSchema = loadSchema();
compiledValidator = compileSchema(currentSchema);

// ─── Public API ───

export function getSchema(): Record<string, unknown> {
    return currentSchema;
}

export function getValidator(): ValidateFunction {
    return compiledValidator;
}

export function setSchema(schema: Record<string, unknown>): void {
    // Validate that it's a valid JSON Schema by trying to compile it
    const validator = compileSchema(schema);
    // If compilation succeeds, persist and update state
    writeFileSync(USER_PATH, JSON.stringify(schema, null, 2), 'utf-8');
    currentSchema = schema;
    compiledValidator = validator;
}

export function resetSchema(): Record<string, unknown> {
    // Read factory default
    const raw = readFileSync(FACTORY_PATH, 'utf-8');
    const factory = JSON.parse(raw);
    // Remove user file if it exists
    if (existsSync(USER_PATH)) {
        const { unlinkSync } = require('fs');
        unlinkSync(USER_PATH);
    }
    // Update state
    currentSchema = factory;
    compiledValidator = compileSchema(factory);
    return factory;
}

export function getFactorySchema(): Record<string, unknown> {
    const raw = readFileSync(FACTORY_PATH, 'utf-8');
    return JSON.parse(raw);
}

export function isUsingFactorySchema(): boolean {
    return !existsSync(USER_PATH);
}
