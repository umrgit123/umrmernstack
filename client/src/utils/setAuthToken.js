import axios from 'axios';

// token is coming from localstorage
// if token exists in local storage, set it equal to global token
// else delete token from global storage
const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token']
    }
}

export default setAuthToken;