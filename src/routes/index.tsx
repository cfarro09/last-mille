/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC } from "react";
import Layout from 'components/layout/Layout';
import Popus from 'components/layout/Popus';
import {
	Users, SignIn, Properties, NotFound, Forbidden, InternalServererror,
	Reports, Corporations, Organizations, MassiveLoad, Routing, Tracking, Manifest, ReportProvider, ReportSKU
} from 'pages';

import { BrowserRouter as Router, Switch, Route, RouteProps, useLocation } from 'react-router-dom';
import paths from "common/constants/paths";
import { makeStyles } from "@material-ui/core";
import { useSelector } from 'hooks';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { wsConnect } from "store/inbox/actions";
import { getAccessToken } from 'common/helpers';
import { Redirect } from 'react-router-dom';
import { validateToken } from 'store/login/actions';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme) => ({
	main: {
		padding: theme.spacing(2),
		paddingTop: theme.spacing(1),
		width: '100%'
	},
}));

interface PrivateRouteProps extends Omit<RouteProps, "component"> {
	component?: React.ElementType;
}

// view: 0
// modify: 1
// insert: 2
// delete: 3

const ProtectRoute: FC<PrivateRouteProps> = ({ children, component: Component, ...rest }) => {
	const resValidateToken = useSelector(state => state.login.validateToken);
	const resLogin = useSelector(state => state.login.login);

	const applications = resValidateToken?.user?.menu;
	const location = useLocation();

	const dispatch = useDispatch();
	const existToken = getAccessToken();

	React.useEffect(() => {
		if (existToken)
			dispatch(validateToken());
	}, [])

	React.useEffect(() => {
		if (!resValidateToken.error && !resValidateToken.loading) {
			const automaticConnection = resLogin.user?.automaticConnection || false;
			const { userid, orgid } = resValidateToken.user!!
			dispatch(wsConnect({ userid, orgid, usertype: 'PLATFORM', automaticConnection  }));
		}
	}, [resValidateToken])

	if (!existToken) {
		return <Redirect to={{ pathname: paths.SIGNIN }} />;
	} else if (resValidateToken.loading && !applications) {
		return (
			<Route {...rest}>
				<Backdrop style={{ zIndex: 999999999, color: '#fff', }} open={true}>
					<CircularProgress color="inherit" />
				</Backdrop>
			</Route>
		);
	} else if (resValidateToken.error) {
		return <Redirect to={{ pathname: paths.SIGNIN }} />;
	} else if (!applications?.[location.pathname]?.[0] && !location.pathname.includes('channels') && !location.pathname.includes('person') && !location.pathname.includes('crm') && !location.pathname.includes('dashboard')) {
		return <Redirect to={{ pathname: "/403" }} />;
	} else if (Component) {
		return <Route {...rest} render={props => <Component {...props} />} />;
	} else if (location.pathname === "/") {
		return <Redirect to={{ pathname: resValidateToken.user?.redirect }} />
	}
	return <Route {...rest}>{children}</Route>;
}

const RouterApp: FC = () => {
	const classes = useStyles();

	return (
		<Router basename={process.env.PUBLIC_URL}>
			<Switch>
				<ProtectRoute exact path="/" />
				<Route exact path={paths.SIGNIN} component={SignIn} />
				
				<ProtectRoute exact path={paths.UPLOAD_DATA}>
					<Layout mainClasses={classes.main}>
						<MassiveLoad />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.ROUTING}>
					<Layout mainClasses={classes.main}>
						<Routing />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.TRACKING}>
					<Layout mainClasses={classes.main}>
						<Tracking />
					</Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.REPORTS}>
					<Layout mainClasses={classes.main}>
						<Reports />
					</Layout>
				</ProtectRoute>
			
				<ProtectRoute exact path={paths.CORPORATIONS}>
					<Layout mainClasses={classes.main}>
						<Corporations />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.ORGANIZATIONS}>
					<Layout mainClasses={classes.main}>
						<Organizations />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.MANIFEST}>
					<Layout mainClasses={classes.main}>
						<Manifest />
					</Layout>
				</ProtectRoute>
				
				<ProtectRoute exact path={paths.PROPERTIES}>
					<Layout mainClasses={classes.main}><Properties /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.USERS}>
					<Layout mainClasses={classes.main}><Users /></Layout>
				</ProtectRoute>



				<ProtectRoute exact path={paths.REPORT_PROVIDER}>
					<Layout mainClasses={classes.main}>
						<ReportProvider />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.REPORT_SKU}>
					<Layout mainClasses={classes.main}>
						<ReportSKU />
					</Layout>
				</ProtectRoute>


				
				<Route exact path="/403">
					<Forbidden />
				</Route>
				<Route exact path="/500">
					<InternalServererror />
				</Route>
				<Route>
					<NotFound />
				</Route>
				<Popus />
			</Switch >
		</Router >
	);
};

export default RouterApp;