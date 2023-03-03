
export const accessRulesSerialize = (data) => {
  if (data.length) {
    data = data.map((rule, index) => {
      const { id, name } = rule
      return { id, name, priority: index + 1 }
    })
  }
  return data
}

export const permissionSerialize = (data) => {
  return {
    key: data.key || '',
    name: data.name || '',
    status: data.status || 'INHERIT'
  }
}

export const ruleSerialize = (data) => {
  if (data.permissions_groups && data.permissions_groups.length) {
    data.permissions_groups = data.permissions_groups.map(group => {
      group.permissions = group.permissions.map(permission => permissionSerialize(permission))
      return group
    })
  }
  return {
    name: data.name || '',
    permissions_groups: data.permissions_groups || []
  }
}

export const roleSerialize = (data) => {
  return {
    name: data.name || '',
    access_rules: accessRulesSerialize(data.access_rules || [])
  }
}

export const setPriority = (data) => {
  return data.map((item, index) => {
    item.priority = index + 1
    return item
  })
}
