import store from '@/store'
import { isBillingEnabled } from '@/shared/utils'
import { getBillingRouteBaseOnAppAndConfig } from '@/router/billingDashboardConfig'

const currentClient = store.getters['ps/userModule/GET_CURRENT_CLIENT']
const clientId = currentClient.id || ''
const brandSign = process.env.VUE_APP_BRANDING ? ` - ${process.env.VUE_APP_BRANDING}` : ''

const billingRoute = getBillingRouteBaseOnAppAndConfig()

let routes = [
  {
    path: '/',
    name: 'DefaultContainer',
    component: () => import('@/containers/DefaultContainer'),
    meta: {
      label: 'Home'
    },
    children: [
      {
        path: 'ps/:client_id?/dashboard',
        name: 'ps-dashboard',
        component: () => import('@/components/Dashboard'),
        meta: {
          title: `Portal Dashboard${brandSign}`
        }
      }, {
        path: 'ps/:client_id?/no-module',
        name: 'ps-dashboard-no-module',
        component: () => import('@/components/ClientNoModule'),
        meta: {
          title: `Portal Dashboard${brandSign}`
        }
      }, {
        path: 'ps/users/:id/invite',
        name: 'ps-ClientInvitation',
        component: () => import('@/components/Client/User/Invite'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Users', to: { name: 'ps-UserList' } }
          ],
          label: 'Invite',
          title: `Invite your member${brandSign}`
        }
      }, {
        path: 'ps/users/:id/add',
        name: 'ps-ClientAddition',
        component: () => import('@/components/Client/User/Add'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Users', to: { name: 'ps-UserList' } }
          ],
          label: 'Add',
          title: `Add your member${brandSign}`
        }
      }, {
        path: 'ps/profile',
        name: 'profile',
        component: () => import('@/components/Profile/Profile'),
        meta: {
          label: 'My Settings',
          title: `My Settings${brandSign}`
        }
      }, {
        path: 'redirect',
        name: 'redirect',
        component: () => import('@/components/common/Redirect')
      }, { // Workspace Settings
        path: 'ps/client-settings/:id',
        name: 'ps-ClientSettings',
        redirect: 'ps/client-settings/:id/client-detail',
        component: () => import('@/components/Client/ClientSetting'),
        meta: {
          label: 'Workspace Settings',
          title: `Workspace Settings${brandSign}`
        },
        children: [
          {
            path: 'client-detail/',
            name: 'ps-ClientDetail',
            component: () => import('@/components/Client/ClientDetail')
          }, {
            path: 'client-module/',
            name: 'ps-ClientModule',
            component: () => import('@/components/Client/ClientModule'),
            meta: {
              label: 'Modules',
              title: `Module Management${brandSign}`
            }
          }, {
            path: 'user-list/',
            name: 'ps-UserList',
            component: () => import('@/components/Client/User/List'),
            meta: {
              label: 'Users',
              title: `User Management${brandSign}`
            },
            children: [
              {
                path: ':userId/',
                name: 'ps-UserRole',
                component: () => import('@/components/Client/User/Edit')
              }
            ]
          }, {
            path: 'access-rules/',
            name: 'ps-AccessRules',
            component: () => import('@/components/CustomPermission/Clients/Rules/AccessRules'),
            meta: {
              label: 'Access Rules',
              title: `Access Rules${brandSign}`
            }
          }, {
            path: 'custom-roles/',
            name: 'ps-CustomRoles',
            component: () => import('@/components/CustomPermission/Clients/Roles/Roles'),
            meta: {
              label: 'Custom Roles',
              title: `Custom Roles${brandSign}`
            }
          }
        ]
      }, {
        path: 'ps/:currentClientId/user-permissions/:userId',
        name: 'ps-UserPermissions',
        component: () => import('@/components/Client/User/Permissions'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Users', to: { name: 'ps-UserList', params: { id: clientId } } }
          ],
          label: 'Permissions',
          title: `User Permissions${brandSign}`
        }
      }, {
        path: 'ps/client-settings/:clientId/user-list/:userId/permissions',
        name: 'ps-Permissions',
        component: () => import('@/components/CustomPermission/Clients/Permissions'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Users', to: { name: 'ps-UserList', params: { id: clientId } } }
          ],
          label: 'Permissions',
          title: `User Permissions${brandSign}`
        }
      }, { // Workspace access rules
        path: 'ps/client-settings/:id/access-rules/create',
        name: 'ps-CreateRule',
        component: () => import('@/components/CustomPermission/Clients/Rules/EditRule'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Access Rules', to: { name: 'ps-AccessRules', params: { id: clientId } } }
          ],
          label: 'Create',
          title: `Create New Access Rule${brandSign}`
        }
      }, {
        path: 'ps/client-settings/:id/access-rules/:ruleId',
        name: 'ps-EditRule',
        component: () => import('@/components/CustomPermission/Clients/Rules/EditRule'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Access Rules', to: { name: 'ps-AccessRules', params: { id: clientId } } }
          ],
          label: 'Edit',
          title: `Edit Access Rule${brandSign}`
        }
      }, { // Workspace custom roles
        path: 'ps/client-settings/:id/custom-roles/create',
        name: 'ps-CreateRole',
        component: () => import('@/components/CustomPermission/Clients/Roles/EditRole'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Custom Roles', to: { name: 'ps-CustomRoles', params: { id: clientId } } }
          ],
          label: 'Create',
          title: `Create New Custom Role${brandSign}`
        }
      }, {
        path: 'ps/client-settings/:id/custom-roles/:roleId',
        name: 'ps-EditRole',
        component: () => import('@/components/CustomPermission/Clients/Roles/EditRole'),
        meta: {
          breadcrumbs: [
            { text: 'Workspace Settings', to: { name: 'ps-ClientSettings', params: { id: clientId } } },
            { text: 'Custom Roles', to: { name: 'ps-CustomRoles', params: { id: clientId } } }
          ],
          label: 'Edit',
          title: `Edit Custom Role${brandSign}`
        }
      }, { // org setting
        path: 'ps/organization-settings/:orgId',
        name: 'ps-OrgSettings',
        redirect: 'ps/organization-settings/:orgId/detail',
        component: () => import('@/components/Organization/OrgSettings'),
        meta: {
          label: 'Organization Settings',
          title: `Organization Settings${brandSign}`
        },
        children: (() => {
          const children = [
            {
              path: 'clients/',
              name: 'ps-OrgClients',
              component: () => import('@/components/Organization/OrgClients'),
              meta: {
                label: 'Workspaces',
                title: `Organization Workspaces${brandSign}`
              },
              children: [
                {
                  path: ':clientId/modules/',
                  name: 'ps-OrgModules',
                  component: () => import('@/components/Organization/OrgModules')
                },
                {
                  path: ':clientId/applications/',
                  name: 'ps-Applications',
                  component: () => import('@/components/Organization/OrgApplications')
                },
                {
                  path: ':clientId/edit/',
                  name: 'ps-EditClient',
                  component: () => import('@/components/Organization/EditClient')
                }
              ]
            },
            {
              path: 'detail/',
              name: 'ps-OrgDetail',
              component: () => import('@/components/Organization/OrgDetail'),
              meta: {
                label: 'Information',
                title: `Organization Information${brandSign}`
              }
            },
            {
              path: 'users/:type',
              name: 'ps-OrgUsers',
              component: () => import('@/components/Organization/OrgUsers'),
              meta: {
                label: 'Users',
                title: `Organization Users${brandSign}`
              },
              children: [
                {
                  path: ':userId/',
                  name: 'ps-OrgUserRole',
                  component: () => import('@/components/Organization/User/Edit')
                }
              ]
            },
            {
              path: 'activities/',
              name: 'ps-OrgActivities',
              component: () => import('@/components/Organization/OrgActivities'),
              meta: {
                label: 'Activities',
                title: `Organization Activities${brandSign}`
              }
            },
            {
              path: 'access-rules/',
              name: 'ps-OrgAccessRules',
              component: () => import('@/components/CustomPermission/Orgs/Rules/AccessRules'),
              meta: {
                label: 'Access Rules',
                title: `Access Rules${brandSign}`
              }
            },
            {
              path: 'custom-roles/',
              name: 'ps-OrgCustomRoles',
              component: () => import('@/components/CustomPermission/Orgs/Roles/Roles'),
              meta: {
                label: 'Custom Roles',
                title: `Custom Roles${brandSign}`
              }
            }
          ]
          if (billingRoute) children.push(billingRoute)
          return children
        })()
      }, {
        path: 'ps/organizations/:orgId/clients/add',
        name: 'ps-AddClient',
        component: () => import('@/components/Organization/AddClient'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings', params: { orgId: '' } } }
          ],
          label: 'Create new workspace',
          title: `Create your own workspace${brandSign}`
        }
      }, {
        path: 'ps/organizations/create',
        name: 'ps-AddOrg',
        component: () => import('@/components/Organization/AddOrg'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings', params: { orgId: '' } } }
          ],
          label: 'Create new organization',
          title: `Create your own organization${brandSign}`
        }
      }, {
        path: 'ps/organizations/:orgId/users/:userId/client-access',
        name: 'ps-OrgClientAccess',
        component: () => import('@/components/Organization/User/Access'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings' } },
            { text: 'Users', to: { name: 'ps-OrgUsers', params: { orgId: '', type: 'org' } } }
          ],
          label: 'Workspace Accesses',
          title: `User Permissions${brandSign}`
        },
        children: [
          {
            path: ':clientId/permissions/',
            name: 'ps-OrgUserPermissions',
            component: () => import('@/components/Organization/User/CustomPermissions'),
            meta: {
              breadcrumbs: [],
              label: 'Permissions'
            }
          }
        ]
      }, {
        path: 'ps/organizations/:orgId/invite',
        name: 'ps-OrgInvitation',
        component: () => import('@/components/Organization/User/Invite'),
        meta: {
          label: 'Invitation',
          title: `Verify the Invitation${brandSign}`,
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgDetail', params: { orgId: '' } } },
            { text: 'Users', to: { name: 'ps-OrgUsers', params: { orgId: '', type: 'org' } } }
          ]
        }
      }, {
        path: 'ps/organizations/:orgId/add',
        name: 'ps-OrgAddition',
        component: () => import('@/components/Organization/User/Add'),
        meta: {
          label: 'Addition',
          title: `Verify the Addition${brandSign}`
        }
      }, { // access rules in orgs
        path: 'ps/organization-settings/:orgId/access-rules/create',
        name: 'ps-OrgCreateRule',
        component: () => import('@/components/CustomPermission/Orgs/Rules/EditRule'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings', params: { orgId: '' } } },
            { text: 'Access Rules', to: { name: 'ps-OrgAccessRules', params: { orgId: '' } } }
          ],
          label: 'Create',
          title: `Create New Access Rule${brandSign}`
        }
      }, {
        path: 'ps/organization-settings/:orgId/access-rules/:ruleId',
        name: 'ps-OrgEditRule',
        component: () => import('@/components/CustomPermission/Orgs/Rules/EditRule'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings', params: { orgId: '' } } },
            { text: 'Access Rules', to: { name: 'ps-OrgAccessRules', params: { orgId: '' } } }
          ],
          label: 'Edit',
          title: `Edit Access Rule${brandSign}`
        }
      }, { // custom role in orgs
        path: 'ps/organization-settings/:orgId/custom-roles/create',
        name: 'ps-OrgCreateRole',
        component: () => import('@/components/CustomPermission/Orgs/Roles/EditRole'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings', params: { orgId: '' } } },
            { text: 'Custom Roles', to: { name: 'ps-OrgCustomRoles', params: { orgId: '' } } }
          ],
          label: 'Create',
          title: `Create New Custom Role${brandSign}`
        }
      }, {
        path: 'ps/organization-settings/:orgId/custom-roles/:roleId',
        name: 'ps-OrgEditRole',
        component: () => import('@/components/CustomPermission/Orgs/Roles/EditRole'),
        meta: {
          breadcrumbs: [
            { text: 'Organization Settings', to: { name: 'ps-OrgSettings', params: { orgId: '' } } },
            { text: 'Custom Roles', to: { name: 'ps-OrgCustomRoles', params: { orgId: '' } } }
          ],
          label: 'Edit',
          title: `Edit Custom Role${brandSign}`
        }
      }
    ]
  }, {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login/Login'),
    meta: {
      title: `Login${brandSign}`
    }
  },
  {
    path: '/google-auth',
    name: 'GoogleLogin',
    component: () => import('@/components/Login/GoogleLogin'),
    meta: {
      title: `Login by google account`
    }
  }, {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/Login/Register'),
    meta: {
      title: `Register${brandSign}`
    }
  }, {
    path: '/ps/clients/invitation',
    name: 'ps-ClientConfirm',
    component: () => import('@/components/Client/User/Confirm'),
    meta: {
      label: 'Invitation',
      title: `Verify the Invitation${brandSign}`
    }
  }, {
    path: '/ps/organizations/invitation',
    name: 'ps-OrgConfirm',
    component: () => import('@/components/Organization/User/Confirm'),
    meta: {
      label: 'Invitation',
      title: `Verify the Invitation${brandSign}`
    }
  }, {
    path: '/reset-password',
    name: 'ForgotPassword',
    component: () => import('@/components/Login/ForgotPassword'),
    meta: {
      title: `Reset password${brandSign}`
    }
  }, {
    path: '/error',
    component: () => import('@/components/common/errors/PSErrorPage'),
    name: 'PSErrorPage',
    meta: {
      title: `Error Page${brandSign}`
    }
  }, {
    path: '/no-access',
    component: () => import('@/components/common/errors/PSNoAccess'),
    name: 'PSNoAccess',
    meta: {
      label: 'Access Denied!',
      title: 'Access Denied!'
    }
  }, {
    path: '/not-found',
    component: () => import('@/components/common/errors/Page404'),
    name: 'Page404',
    meta: {
      title: `Not Found${brandSign}`
    },
    alias: '*'
  }, {
    path: '/server-error',
    component: () => import('@/components/common/errors/Page500'),
    name: 'Page500',
    meta: {
      title: `Internal Server Error${brandSign}`
    }
  }
]

// set Permission billing for all routes of PS
;(() => {
  const setMetaForAllRoutes = (routes) => {
    routes.forEach(route => {
      if (route.children) {
        setMetaForAllRoutes(route.children)
      }
      !route.meta && (route.meta = {})
      route.meta.canByPassBillingPermission = true
    })
  }
  // call method to access
  isBillingEnabled() && setMetaForAllRoutes(routes)
})()

export default routes
