export const userManagementEndpoints = Object.freeze({
  users: "/users",
  user: (id: string) => `/users/${id}`,
});
