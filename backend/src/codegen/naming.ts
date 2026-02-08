// ─── C# Naming Utilities ───
// Converts XyronQ policy metadata names into valid C# identifiers

/**
 * Convert a dot-separated or space-separated name to PascalCase.
 * e.g., "Storage.Slotting" → "StorageSlotting"
 *       "WeightedScoreSlotting" → "WeightedScoreSlotting"
 *       "MaxHUWeight" → "MaxHUWeight"
 */
export function toPascalCase(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
}

/**
 * Convert a name to camelCase (first char lowercase).
 */
export function toCamelCase(name: string): string {
    const pascal = toPascalCase(name);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Derive a C# namespace from a domain name.
 * e.g., "Storage.Slotting" → "StorageSlotting"
 *       "Failure.Resolution" → "FailureResolution"
 */
export function toNamespaceSegment(domainName: string): string {
    return toPascalCase(domainName);
}

/**
 * Map §8.10 SystemParameter.type to a C# type.
 */
export function toCSharpType(paramType: string): string {
    switch (paramType) {
        case 'bool': return 'bool';
        case 'int': return 'int';
        case 'decimal': return 'decimal';
        case 'string': return 'string';
        case 'enum': return 'string';
        default: return 'object';
    }
}

/**
 * Ensure a name is a valid C# identifier (no reserved words, etc.)
 */
export function safeCSharpId(name: string): string {
    const pascal = toPascalCase(name);
    const reserved = new Set([
        'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch',
        'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default',
        'delegate', 'do', 'double', 'else', 'enum', 'event', 'explicit',
        'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach',
        'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal',
        'is', 'lock', 'long', 'namespace', 'new', 'null', 'object',
        'operator', 'out', 'override', 'params', 'private', 'protected',
        'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short',
        'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch',
        'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong',
        'unchecked', 'unsafe', 'ushort', 'using', 'virtual', 'void',
        'volatile', 'while',
    ]);
    if (reserved.has(pascal.toLowerCase())) {
        return `@${pascal}`;
    }
    return pascal;
}
