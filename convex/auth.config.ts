const authConfig = {
    providers: [
        {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://ace-macaque-76.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};

export default authConfig;
