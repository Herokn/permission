import type { MockMethod } from 'vite-plugin-mock'

// ==================== Mock Data ====================

const mockOrgTree = [
  {
    id: 1,
    orgCode: 'ROOT',
    orgName: '总公司',
    orgType: 'COMPANY',
    status: 'ENABLED',
    parentId: 0,
    children: [
      {
        id: 2,
        orgCode: 'TECH',
        orgName: '技术部',
        orgType: 'DEPARTMENT',
        status: 'ENABLED',
        parentId: 1,
        children: [
          {
            id: 4,
            orgCode: 'FE',
            orgName: '前端组',
            orgType: 'TEAM',
            status: 'ENABLED',
            parentId: 2,
            children: [],
          },
          {
            id: 5,
            orgCode: 'BE',
            orgName: '后端组',
            orgType: 'TEAM',
            status: 'ENABLED',
            parentId: 2,
            children: [],
          },
        ],
      },
      {
        id: 3,
        orgCode: 'HR',
        orgName: '人力资源部',
        orgType: 'DEPARTMENT',
        status: 'ENABLED',
        parentId: 1,
        children: [],
      },
    ],
  },
]

const mockUsers = [
  {
    id: 1,
    userId: 'U001',
    username: 'admin',
    displayName: 'Admin',
    empNo: 'EMP001',
    mobile: '13800000001',
    email: 'admin@example.com',
    status: 'ENABLED',
    orgId: 1,
    orgName: '总公司',
    positionId: 1,
    positionName: '总经理',
  },
  {
    id: 2,
    userId: 'U002',
    username: 'zhangsan',
    displayName: '张三',
    empNo: 'EMP002',
    mobile: '13800000002',
    email: 'zhangsan@example.com',
    status: 'ENABLED',
    orgId: 2,
    orgName: '技术部',
    positionId: 2,
    positionName: '技术经理',
  },
  {
    id: 3,
    userId: 'U003',
    username: 'lisi',
    displayName: '李四',
    empNo: 'EMP003',
    mobile: '13800000003',
    email: 'lisi@example.com',
    status: 'ENABLED',
    orgId: 4,
    orgName: '前端组',
    positionId: 3,
    positionName: '前端工程师',
  },
]

const mockPositions = [
  { id: 1, positionCode: 'GM', positionName: '总经理', status: 'ENABLED', description: '公司总经理' },
  { id: 2, positionCode: 'TM', positionName: '技术经理', status: 'ENABLED', description: '技术部经理' },
  { id: 3, positionCode: 'FE_DEV', positionName: '前端工程师', status: 'ENABLED', description: '前端开发工程师' },
  { id: 4, positionCode: 'BE_DEV', positionName: '后端工程师', status: 'ENABLED', description: '后端开发工程师' },
  { id: 5, positionCode: 'HR_MGR', positionName: 'HR经理', status: 'ENABLED', description: '人力资源经理' },
]

// ==================== Helper ====================
function ok(data: any) {
  return { success: true, code: 2000, message: 'OK', data }
}

// ==================== Mock Routes ====================
export default [
  // 组织树
  {
    url: '/wb-ucs/api/ucOrg/queryOrgTree',
    method: 'get',
    response: () => ok(mockOrgTree),
  },
  // 查询所有组织
  {
    url: '/wb-ucs/api/ucOrg/queryAllUcOrgs',
    method: 'post',
    response: () => ok(mockOrgTree),
  },
  // 新增组织
  {
    url: '/wb-ucs/api/ucOrg/addUcOrg',
    method: 'post',
    response: ({ body }: any) => ok({ id: Date.now(), ...body }),
  },
  // 修改组织
  {
    url: '/wb-ucs/api/ucOrg/modifyUcOrgById',
    method: 'post',
    response: ({ body }: any) => ok(body),
  },

  // 用户分页查询
  {
    url: '/wb-ucs/api/ucUser/queryPageWithTenantAndOrgRel',
    method: 'post',
    response: () =>
      ok({
        records: mockUsers,
        total: mockUsers.length,
        size: 10,
        current: 1,
        pages: 1,
      }),
  },
  // 用户详情
  {
    url: '/wb-ucs/api/ucUser/queryDetailWithTenantAndOrgRel',
    method: 'get',
    response: ({ query }: any) => {
      const user = mockUsers.find((u) => u.id === Number(query.userId))
      return ok(user || mockUsers[0])
    },
  },
  // 新增用户
  {
    url: '/wb-ucs/api/ucUser/addWithTenantAndOrgRel',
    method: 'post',
    response: ({ body }: any) => ok({ id: Date.now(), ...body }),
  },
  // 修改用户
  {
    url: '/wb-ucs/api/ucUser/modifyWithTenantAndOrgRelById',
    method: 'post',
    response: ({ body }: any) => ok(body),
  },
  // 启用用户
  {
    url: '/wb-ucs/api/ucUser/enableUcUserById',
    method: 'get',
    response: () => ok(true),
  },
  // 禁用用户
  {
    url: '/wb-ucs/api/ucUser/disableUcUserById',
    method: 'get',
    response: () => ok(true),
  },

  // 岗位分页查询
  {
    url: '/wb-ucs/api/ucPosition/queryPageUcPositions',
    method: 'post',
    response: () =>
      ok({
        records: mockPositions,
        total: mockPositions.length,
        size: 10,
        current: 1,
        pages: 1,
      }),
  },
  // 查询所有岗位
  {
    url: '/wb-ucs/api/ucPosition/queryAllUcPositions',
    method: 'post',
    response: () => ok(mockPositions),
  },
  // 新增岗位
  {
    url: '/wb-ucs/api/ucPosition/addUcPosition',
    method: 'post',
    response: ({ body }: any) => ok(Date.now()),
  },
  // 修改岗位
  {
    url: '/wb-ucs/api/ucPosition/modifyUcPositionById',
    method: 'post',
    response: () => ok(null),
  },
  // 启用岗位
  {
    url: '/wb-ucs/api/ucPosition/enableUcPositionById',
    method: 'get',
    response: () => ok(null),
  },
  // 禁用岗位
  {
    url: '/wb-ucs/api/ucPosition/disableUcPositionById',
    method: 'get',
    response: () => ok(null),
  },
  // 按组织查岗位
  {
    url: '/wb-ucs/api/ucOrgPosition/queryByOrgId',
    method: 'get',
    response: () => ok(mockPositions.slice(0, 2)),
  },
  // 批量更新组织岗位
  {
    url: '/wb-ucs/api/ucOrgPosition/batchUpdateOrgPositions',
    method: 'post',
    response: () => ok([]),
  },
  // 按岗位查组织树
  {
    url: '/wb-ucs/api/ucOrgPosition/queryOrgTreeByPositionId',
    method: 'get',
    response: () => ok(mockOrgTree),
  },
  // 岗位与组织标记
  {
    url: '/wb-ucs/api/ucOrgPosition/listPositionsWithOrgFlag',
    method: 'get',
    response: () => ok(mockPositions),
  },
  // 查询岗位详情
  {
    url: '/wb-ucs/api/ucPosition/queryUcPositionById',
    method: 'get',
    response: ({ query }: any) => {
      const pos = mockPositions.find((p) => p.id === Number(query.id))
      return ok(pos || mockPositions[0])
    },
  },

  // SSO - 重置密码
  {
    url: '/wb-sso/api/ssoUserCredential/modifySsoUserCredentialByUserId',
    method: 'post',
    response: () => ok(true),
  },
] as MockMethod[]

