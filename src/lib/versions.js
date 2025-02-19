export function compareMinecraftVersions (a, b) {
  const sa = getVersionParts(a)
  const sb = getVersionParts(b)

  // Pad both arrays to the same length
  const maxLength = Math.max(sa.length, sb.length)
  while (sa.length < maxLength) sa.push(0)
  while (sb.length < maxLength) sb.push(0)

  for (let i = 0; i < maxLength; i++) {
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
