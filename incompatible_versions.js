/*
The incompatible version matrix determines if a permalink needs to redirect
to a versioned permalink.

A true value means that all permalinks referencing that version need to redirect
to their respective archived version.
*/

const incompatMatrix = {
    "3.0.0": true,
    "3.1.0": true, 
    "3.2.0": true,
    "3.3.0": true,
    "3.4.0": true,
    "3.4.1": true,
    "3.4.2": true,
    "3.4.3": true,
    "3.4.4": true,
    "3.4.5": false
}

export function incomptabile(target, current) {
    return incompatMatrix[target]
}
