const paths = {
    DASHBOARD: '/dashboard',
    REPORTS: '/reports',
    SUPERVISOR: '/supervisor',
    CORPORATIONS: '/corporations',
    ORGANIZATIONS: '/organizations',
    SIGNIN: '/sign-in',
    SIGNUP: {
        path: "/sign-up/:token",
        resolve: (token: string) => `/sign-up/${token}`,
    },
    PRIVACY: "/privacy",
    CONFIGURATION: '/configuration',
    EXTRAS: '/extras',
    PROPERTIES: '/extras/properties',
    USERS: '/user',
    DOMAINS: '/extras/domains',

    UPLOAD_DATA: '/massive_load',
    ROUTING: '/routing',
    MANIFEST: '/manifest',
    FLEET: '/fleet',
    CLIENTS: '/clients',
    KPIS: '/kpis',
    EVIDENCES: '/evidences',
    REPORT_DISTRIBUTION: '/report-distribution',
    TRACKING: '/tracking',
    TEMPLATES: '/templates',


};

export default paths;
