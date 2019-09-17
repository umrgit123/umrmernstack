import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
    const id = uuid.v4();
    
    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id }
    })

// Below code is required to remove the alert after 5 secs so that it does not stay on screen forever
    setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout)
}