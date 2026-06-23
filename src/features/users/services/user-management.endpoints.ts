export const userManagementEndpoints = Object.freeze({
  users: "/users",
  user: (id: string) => `/users/${id}`,
  userEvents: (id: string) => `/events/admin/users/${id}/events`,
});
