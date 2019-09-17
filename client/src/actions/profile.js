import axios from 'axios';
import { setAlert } from './alert';

import { 
    GET_PROFILE,
    PROFILE_ERROR,
    UPDATE_PROFILE,
    CLEAR_PROFILE,
    ACCOUNT_DELETED,
    GET_ALLPROFILES,
    GET_REPOS
} from './types';

// Get current user's profile

export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me')
        // no parameters to be sent as the token will already have userid
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Get all profiles


export const getProfiles = () => async dispatch => {
    // clear any existing user profile before loading all profiles
    dispatch({ type: CLEAR_PROFILE})
    try {
        const res = await axios.get('/api/profile')
        dispatch({
            type: GET_ALLPROFILES,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            // axios is not returning statusText so changed the line below
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Get profile by ID

export const getProfileById = userId => async dispatch => {
    // clear any existing user profile before loading new profile
    
    try {
        const res = await axios.get(`/api/profile/user/${userId}`)
        // no parameters to be sent as the token will already have userid
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Get github repos

export const getGithubRepos = username => async dispatch => {
    // clear any existing user profile before loading new profile
    
    try {
        const res = await axios.get(`/api/profile/github/${username}`)
        dispatch({
            type: GET_REPOS,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}


// Create or Update profile

export const createProfile = (formData, history, edit = false) => async dispatch => {
    
    try {
        const config = {
        headers: {
            'Content-Type': 'application/json'
            }
        }
        
        const res = await axios.post('/api/profile', formData, config)
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'))
        if (!edit) {
            history.push('/dashboard')
        }
    } catch (err) {
        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Add experience

export const addExperience = (formData, history) => async dispatch => {
    
    try {
        const config = {
        headers: {
            'Content-Type': 'application/json'
            }
        }

        const res = await axios.put('/api/profile/experience', formData, config)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience Added', 'success'))
        history.push('/dashboard')

    } catch (err) {
        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Add education

export const addEducation = (formData, history) => async dispatch => {
    
    try {
        const config = {
        headers: {
            'Content-Type': 'application/json'
            }
        }

        const res = await axios.put('/api/profile/education', formData, config)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education Added', 'success'))
        history.push('/dashboard')

    } catch (err) {
        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}


// Delete an experience

export const deleteExperience = id => async dispatch => {
    
    try {
        const res = await axios.delete('/api/profile/experience/${id}')
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience deleted', 'success'))

    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Delete an education

export const deleteEducation = id => async dispatch => {
    
    try {
        const res = await axios.delete('/api/profile/education/${id}')
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education deleted', 'success'))

    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Delete account & profile
// No parameters to be passed as account will be available in token

export const deleteAccount = () => async dispatch => {
    
    if (window.confirm('Are you sure? This cannot be undone')) {
        try {
            await axios.delete('/api/profile')
            dispatch({type: CLEAR_PROFILE})
            dispatch({type: ACCOUNT_DELETED})
    
            dispatch(setAlert('Your account has been permanently deleted'))
    
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.statusText, status: err.response.status }
            })
        }
    }    
}

