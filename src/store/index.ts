import callAPIMiddleware from 'middlewares/apiMiddleware';
// import callWSMiddleware from 'middlewares/wsMiddleware';
import { applyMiddleware, compose, createStore, combineReducers, Middleware } from 'redux';
import thunk from 'redux-thunk';

import loginReducer, { IState as ILogin } from './login/reducer';
import mainReducer, { IState as IMain } from './main/reducer';
import popusReducer, { IState as IPopus } from './popus/reducer';
import inboxReducer, { IState as IInbox } from './inbox/reducer';
import assignmentReducer, { IState as IAsignment } from './assignment/reducer';

export interface IRootState {
    login: ILogin,
    popus: IPopus;
    main: IMain;
    // ticket: ITicketState;
    inbox: IInbox;
    // channel: IChannelState;
    // integrationmanager: IIntegrationManager;
    assignment: IAsignment;
    // signup: ISignUp;
    // person: IPerson;
    // setting: ISetting;
    // activationuser: IActivationUser;
    // lead: ILead;
    // culqi: ICulqi;
    // dashboard: IDashboard;
}

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}   

const rootReducer = combineReducers<IRootState>({
    login: loginReducer,
    main: mainReducer,
    popus: popusReducer,
    assignment: assignmentReducer,
    // ticket: ticketReducer,
    inbox: inboxReducer,
    // integrationmanager: integrationManagerReducer,
    // channel: channelReducer,
    // botdesigner: botdesignerReducer,
    // signup: signupReducer,
    // person: personReducer,
    // setting: settingReducer,
    // activationuser: activationUserReducer,
    // lead: leadReducer,
    // culqi: culqiReducer,
    // dashboard: dashboardReducer,
});

export default function configureStore(preloadedState?: IRootState) {
    const middleware: Middleware[] = [callAPIMiddleware];

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const middlewareEnhancer = composeEnhancers(applyMiddleware(thunk, ...middleware));

    return createStore(rootReducer, preloadedState, middlewareEnhancer);
}
