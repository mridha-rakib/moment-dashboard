export const userManagementEndpoints = Object.freeze({
  users: "/users/admin/management",
  user: (id: string) => `/users/admin/management/${id}`,
  userEvents: (id: string) => `/events/admin/users/${id}/events`,
});
