import { useLocation, useParams as useRouterParams } from "react-router-dom";

export function usePathname() {
  return useLocation().pathname;
}

export { useRouterParams as useParams };
