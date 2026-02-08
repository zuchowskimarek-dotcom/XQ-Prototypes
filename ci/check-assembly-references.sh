#!/usr/bin/env bash
# ─── C2 Constraint: Assembly Reference Direction Enforcement ───
# Verifies that the generated contracts assembly does NOT reference
# any WMS implementation assemblies.
#
# Usage:
#   ./ci/check-assembly-references.sh path/to/LogisQ.Contracts.Decisions.csproj
#
# Exit codes:
#   0 — Clean (no forbidden references)
#   1 — Forbidden references found
#   2 — File not found or invalid

set -euo pipefail

# Forbidden package prefixes — contracts must NEVER reference these
FORBIDDEN_PREFIXES=(
    "LogisQ.WMS"
    "LogisQ.MFC"
    "LogisQ.BusinessLogic"
    "LogisQ.Infrastructure"
    "LogisQ.Persistence"
)

CSPROJ="${1:-}"

if [[ -z "$CSPROJ" ]]; then
    echo "Usage: $0 <path-to-csproj>"
    exit 2
fi

if [[ ! -f "$CSPROJ" ]]; then
    echo "❌ File not found: $CSPROJ"
    exit 2
fi

echo "🔍 Checking assembly references in: $CSPROJ"
echo ""

VIOLATIONS=0

for PREFIX in "${FORBIDDEN_PREFIXES[@]}"; do
    # Look for <PackageReference Include="LogisQ.WMS..." or <ProjectReference ...LogisQ.WMS...
    if grep -qiE "(PackageReference|ProjectReference).*${PREFIX}" "$CSPROJ"; then
        MATCHES=$(grep -iE "(PackageReference|ProjectReference).*${PREFIX}" "$CSPROJ")
        echo "❌ FORBIDDEN reference to ${PREFIX}:"
        echo "   $MATCHES"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
done

echo ""

if [[ $VIOLATIONS -gt 0 ]]; then
    echo "❌ C2 VIOLATION: Found $VIOLATIONS forbidden reference(s)."
    echo "   Generated contracts must NEVER reference WMS implementation assemblies."
    echo "   See: XQ-Prototypes_CodeGen_Analysis.md, Constraint C2"
    exit 1
else
    echo "✅ C2 Clean: No forbidden assembly references found."
    exit 0
fi
