import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("perioder", "routes/periods.tsx"),
  route("organisering", "routes/organization.tsx"),
  route("organisering/personalegrupper", "routes/organization.tsx"),
  route("adgangsstyring/brugere", "routes/users.tsx"),
  route("adgangsstyring/ansaettelser", "routes/employments.tsx"),
  route("personale", "routes/personnel.tsx"),
] satisfies RouteConfig;
