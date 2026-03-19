// 将组织树转换为路径字符串
export const getOrgTreePath = (orgTree: any): string => {
  if (!orgTree) return '-'

  const path: string[] = []
  let current = orgTree

  while (current) {
    path.push(current.orgName)
    // 每层最多只有一个 children
    current =
      current.children && current.children.length > 0
        ? current.children[0]
        : null
  }

  return path.length > 0 ? path.join(' / ') : '-'
}

// 从完整组织树中查找节点路径
export const findOrgPath = (
  tree: any[],
  targetId: number | string,
  currentPath: string[] = []
): string | null => {
  if (!tree || !Array.isArray(tree)) return null

  for (const node of tree) {
    const newPath = [...currentPath, node.orgName]

    // 找到目标节点
    if (node.id === targetId) {
      return newPath.join(' / ')
    }

    // 递归查找子节点
    if (node.children && node.children.length > 0) {
      const result = findOrgPath(node.children, targetId, newPath)
      if (result) return result
    }
  }

  return null
}
