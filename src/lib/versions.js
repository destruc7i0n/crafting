export function compareMinecraftVersions (a, b) {
  const sa = getVersionParts(a)
  const sb = getVersionParts(b)
  for (let i = 0; i < Math.min(sa.length, sb.length); i++) {
    const na = sa[i]
    const nb = sb[i]
    if (na > nb) return -1
    if (nb > na) return 1
  }
  return 0
}

export function getVersionParts (version) {
  return version.toString().split('.').map(Number)
}

export function areVersionsEqual (a, b) {
  return compareMinecraftVersions(a, b) === 0
}
