/**
 * Tree utility functions
 */

import type { OrganizationTreeNode } from '@/types/api/users/position'

/**
 * Traverse tree and extract organization paths
 * Returns a formatted string showing the organization hierarchy
 */
export function extractOrgPaths(tree: OrganizationTreeNode[]): string[] {
  const paths: string[] = []

  function traverse(nodes: OrganizationTreeNode[], path: string[] = []) {
    if (!nodes || nodes.length === 0) return

    nodes.forEach((node) => {
      const currentPath = [...path, node.orgName]

      if (node.belongsToPosition) {
        paths.push(currentPath.join(' / '))
      }

      if (node.children && node.children.length > 0) {
        traverse(node.children, currentPath)
      }
    })
  }

  traverse(tree)
  return paths
}

/**
 * Flatten tree structure to array
 */
export function flattenTree<T extends { children?: T[] }>(
  tree: T[],
  childrenKey: keyof T = 'children' as keyof T
): T[] {
  const result: T[] = []

  function traverse(nodes: T[]) {
    if (!nodes || nodes.length === 0) return

    nodes.forEach((node) => {
      result.push(node)
      const children = node[childrenKey] as T[] | undefined
      if (children && children.length > 0) {
        traverse(children)
      }
    })
  }

  traverse(tree)
  return result
}

/**
 * Find node in tree by predicate
 */
export function findNodeInTree<T extends { children?: T[] }>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: keyof T = 'children' as keyof T
): T | undefined {
  for (const node of tree) {
    if (predicate(node)) {
      return node
    }

    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = findNodeInTree(children, predicate, childrenKey)
      if (found) {
        return found
      }
    }
  }

  return undefined
}

/**
 * Filter tree nodes by predicate
 * Returns a new tree containing only nodes that match the predicate
 */
export function filterTree<T extends { children?: T[] }>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: keyof T = 'children' as keyof T
): T[] {
  const result: T[] = []

  tree.forEach((node) => {
    const children = node[childrenKey] as T[] | undefined
    const filteredChildren = children
      ? filterTree(children, predicate, childrenKey)
      : []

    if (predicate(node) || filteredChildren.length > 0) {
      result.push({
        ...node,
        [childrenKey]: filteredChildren,
      } as T)
    }
  })

  return result
}

/**
 * Get all parent nodes for a target node
 */
export function getParentPath<T extends { children?: T[] }>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: keyof T = 'children' as keyof T
): T[] {
  const path: T[] = []

  function traverse(nodes: T[]): boolean {
    for (const node of nodes) {
      path.push(node)

      if (predicate(node)) {
        return true
      }

      const children = node[childrenKey] as T[] | undefined
      if (children && children.length > 0) {
        if (traverse(children)) {
          return true
        }
      }

      path.pop()
    }

    return false
  }

  traverse(tree)
  return path
}
