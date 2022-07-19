import { RouteConfig } from "@types";
import paths from "common/constants/paths";
import {
    DashboardIcon, ReportsIcon, ExtrasIcon
} from 'icons';
import { langKeys } from "lang/keys";
import { Trans } from "react-i18next";

export const routes: RouteConfig[] = [
    {
        key: paths.DASHBOARD,
        description: <Trans i18nKey={langKeys.dashboard} />,
        tooltip: <Trans i18nKey={langKeys.dashboard} />,
        path: paths.DASHBOARD,
        icon: (className) => <DashboardIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.REPORTS,
        description: <Trans i18nKey={langKeys.report} count={2} />, // prop:count for plural purposes
        tooltip: <Trans i18nKey={langKeys.report} count={2} />,
        path: paths.REPORTS,
        icon: (className) => <ReportsIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.USERS,
        description: <Trans i18nKey={langKeys.user} />,
        tooltip: <Trans i18nKey={langKeys.user} />,
        path: paths.USERS,
        icon: (className) => <ReportsIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.PROPERTIES,
        description: <Trans i18nKey={langKeys.property} count={2} />,
        tooltip: <Trans i18nKey={langKeys.property} />,
        path: paths.PROPERTIES,
        icon: (className) => <ReportsIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.DOMAINS,
        description: <Trans i18nKey={langKeys.domain_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.DOMAINS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },


  



    {
        key: paths.UPLOAD_DATA,
        description: <Trans i18nKey={langKeys.upload_data} count={2} />,
        tooltip: <Trans i18nKey={langKeys.upload_data} />,
        path: paths.UPLOAD_DATA,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.ROUTING,
        description: <Trans i18nKey={langKeys.routing} count={2} />,
        tooltip: <Trans i18nKey={langKeys.routing} />,
        path: paths.ROUTING,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.TEMPLATES,
        description: "Plantillas",
        tooltip: "Plantillas",
        path: paths.TEMPLATES,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.MANIFEST,
        description: <Trans i18nKey={langKeys.manifest} count={2} />,
        tooltip: <Trans i18nKey={langKeys.manifest} />,
        path: paths.MANIFEST,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.FLEET,
        description: <Trans i18nKey={langKeys.fleet} count={2} />,
        tooltip: <Trans i18nKey={langKeys.fleet} />,
        path: paths.FLEET,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.CLIENTS,
        description: <Trans i18nKey={langKeys.client} count={2} />,
        tooltip: <Trans i18nKey={langKeys.client} />,
        path: paths.CLIENTS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.KPIS,
        description: <Trans i18nKey={langKeys.kpis} count={2} />,
        tooltip: <Trans i18nKey={langKeys.kpis} />,
        path: paths.KPIS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.EVIDENCES,
        description: <Trans i18nKey={langKeys.evidences} count={2} />,
        tooltip: <Trans i18nKey={langKeys.evidences} />,
        path: paths.EVIDENCES,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    
    {
        key: paths.TRACKING,
        description: <Trans i18nKey={langKeys.tracking} count={2} />,
        tooltip: <Trans i18nKey={langKeys.tracking} />,
        path: paths.TRACKING,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.DOMAINS,
        description: <Trans i18nKey={langKeys.template} count={2} />,
        tooltip: <Trans i18nKey={langKeys.template} />,
        path: paths.DOMAINS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.RESOURCES_CONTROL,
        description: "Control de recursos",
        tooltip: "Control de recursos",
        path: paths.RESOURCES_CONTROL,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.GUIDE_MONITOR,
        description: "Monitor de guías",
        tooltip: "Monitor de guías",
        path: paths.GUIDE_MONITOR,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.REPORT_PROVIDER,
        description: "Reporte de proveedor",
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.REPORT_PROVIDER,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.REPORT_SKU,
        description: "R. control SKU",
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.REPORT_SKU,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    

];

