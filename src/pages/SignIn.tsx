/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from 'react'; // we need this to make JSX compile
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from 'hooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useDispatch } from 'react-redux';
import { login } from 'store/login/actions';
import { getAccessToken } from 'common/helpers';
import { useHistory } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { connectAgentUI } from 'store/inbox/actions';
import { showSnackbar } from 'store/popus/actions';
import { useLocation } from "react-router-dom";

export const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundImage: 'url("https://staticfileszyxme.s3.us-east.cloud-object-storage.appdomain.cloud/backgroundqapla.png")',
        position: 'relative',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    paperLogin: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 10
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '400px', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    progress: {
        margin: theme.spacing(0, 'auto', 3),
        display: 'block'
    },
    alert: {
        display: 'inline-flex',
        width: '100%'
    },
    alertheader: {
        display: 'inline-flex',
        width: '100%',
        marginTop: theme.spacing(1),
    },
}));

export function Copyright() {
    const { t } = useTranslation();
    return (
        <Fragment>
            <Typography variant="body2" color="textPrimary" align="center">
                {'Copyright © '} IEE {new Date().getFullYear()}
            </Typography>
            <Typography variant="body2" color="textPrimary" align="center">
                <a href="https://app.laraigo.com/privacy" target="_blank" rel="noopener noreferrer">{t(langKeys.privacypoliciestitle)}</a>
            </Typography>
        </Fragment>
    );
}

type IAuth = {
    username: string,
    password: string
}

const SignIn = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const location = useLocation();

    const history = useHistory();

    const dispatch = useDispatch();
    const resLogin = useSelector(state => state.login.login);

    const [dataAuth, setDataAuth] = useState<IAuth>({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleMouseDownPassword = (event: any) => event.preventDefault();

    const onSubmitLogin = (e: any) => {
        e.preventDefault();
        dispatch(login(dataAuth.username, dataAuth.password));
    }

    useEffect(() => {
        const ff = location.state || {} as any;
        if (!!ff?.showSnackbar) {
            dispatch(showSnackbar({ show: true, success: true, message: ff?.message || "" }))
        }
    }, [location]);

    useEffect(() => {


        if (getAccessToken()) {
            history.push('/');
        }
    }, [])

    useEffect(() => {
        if (!resLogin.error && resLogin.user && getAccessToken()) {
            dispatch(connectAgentUI(resLogin.user.automaticConnection!!))
            history.push(resLogin.user.redirect ? resLogin.user.redirect : "/user");
        }
    }, [resLogin]);

    return (
        <div className={classes.root}>
            <div className={classes.paperLogin}>
                <div className={classes.paper}>
                    <img src="https://staticfileszyxme.s3.us-east.cloud-object-storage.appdomain.cloud/logoqapla.png" alt="titledev" width="150" />
                    {resLogin.error && (
                        <Alert className={classes.alertheader} variant="filled" severity="error">
                            {t(resLogin.code || "error_unexpected_error")}
                        </Alert>
                    )}
                    <form
                        className={classes.form}
                        onSubmit={onSubmitLogin}
                    >
                        <TextField
                            // variant="outlined"
                            margin="normal"
                            fullWidth
                            value={dataAuth.username}
                            onChange={e => setDataAuth(p => ({ ...p, username: e.target.value.trim() }))}
                            label={t(langKeys.username)}
                            name="usr"
                        />
                        <TextField
                            // variant="outlined"
                            margin="normal"
                            fullWidth
                            label={t(langKeys.password)}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={dataAuth.password}
                            onChange={e => setDataAuth(p => ({ ...p, password: e.target.value.trim() }))}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {!resLogin.loading ?
                            <div style={{ alignItems: 'center' }}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}>
                                    <Trans i18nKey={langKeys.logIn} />
                                </Button>
                            </div> :
                            <CircularProgress className={classes.progress} />
                        }
                    </form>
                </div>
            </div>
        </div>)
}

export default SignIn;