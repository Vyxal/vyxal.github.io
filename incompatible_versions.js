/*
The incompatible version matrix determines if a permalink needs to redirect
to a versioned permalink. A permalink needs to redirect if the current version
has breaking changes. The matrix's keys represent the version of the permalink.
The values represent the maximum version that the permalink is compatible with.
*/

// An asterisk means that the permalink is compatible with all versions so far.

const incompatMatrix = {
    "3.0.0": "*"
}

function comesAfter(target, current) {
    return current.localeCompare(target, undefined, { numeric: true, sensitivity: 'base' }) >= 0
}

export function incomptabile(target, current) {
    return incompatMatrix[target] != "*" && comesAfter(incompatMatrix[target], current)
}