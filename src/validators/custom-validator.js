export function isValidFileSize(value) {
  if (!value) return true
  const validSize = 2 * 1024 * 1024
  return value.size <= validSize
}

export function isValidFileType(value) {
  const validTypes = ['image/jpeg', 'image/png']
  if (!value) return true
  return validTypes.includes(value.type)
}

export function passwordNotEmail(value, parentVm) {
  if (!value || !parentVm.email) return true
  return value.toLowerCase() !== parentVm.email.toLowerCase()
}

export function passwordRegex(value) {
  if (value !== '') {
    const reWhiteSpace = new RegExp(/(^\s+)|(\s+$)/)
    if (reWhiteSpace.test(value)) {
      return false
    }
  }
  return true
}
