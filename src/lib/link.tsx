import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";
import React from "react";

type LinkProps = Omit<RouterLinkProps, "to"> & { href: string };

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, ...props }, ref) => <RouterLink ref={ref} to={href} {...props} />
);

Link.displayName = "Link";
export default Link;
