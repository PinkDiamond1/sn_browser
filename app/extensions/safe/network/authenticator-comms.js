import logger from 'logger';
import { handleAuthUrl } from 'extensions/safe/actions/authenticator_actions';
import { updateRemoteCall } from 'actions/remoteCall_actions';
import { parseSafeAuthUrl } from 'extensions/safe/utils/safeHelpers';
import {
    PROTOCOLS
} from 'appConstants';
import { SAFE } from 'extensions/safe/constants';

import { parse as parseURL } from 'url';


export const handleAuthentication = ( passedStore, uriOrReqObject ) =>
{
    if ( typeof uriOrReqObject !== 'string' && typeof uriOrReqObject.uri !== 'string' )
    {
        throw new Error( 'Auth URI should be provided as a string' );
    }

    passedStore.dispatch( handleAuthUrl( uriOrReqObject ) );
};

export const attemptReconnect = ( passedStore, appObj ) =>
{
    setTimeout( () =>
    {
        logger.info( 'Attempting reconnect...' );
        appObj.reconnect();

        if ( passedStore.getState().safeBrowserApp.networkStatus === SAFE.NETWORK_STATE.DISCONNECTED )
        {
            attemptReconnect( passedStore );
        }
    }, 5000 );
};


export const handleSafeAuthUrlReception = async ( res ) =>
{
    if ( typeof res !== 'string' )
    {
        throw new Error( 'Response url should be a string' );
    }

    let authUrl = null;
    logger.info( 'Received URL response', res );

    if ( parseURL( res ).protocol === `${PROTOCOLS.SAFE_AUTH}:` )
    {
        authUrl = parseSafeAuthUrl( res );

        if ( authUrl.action === 'auth' )
        {
            return handleAuthentication( res );
        }
    }
};


/**
 * Reconnect the application with SAFE Network when disconnected
 */
export const reconnect = ( app ) =>
{
    if ( !app )
    {
        return Promise.reject( new Error( 'Application not initialised' ) );
    }
    return app.reconnect();
};
