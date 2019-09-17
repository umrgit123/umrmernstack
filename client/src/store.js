import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReducer from './reducers'
// In the above line index.js is imported as it is present in reducers folder
// for index.js files, it is not necessary to specify the filename 

const initialState = {};

const middleware = [thunk];

const store = createStore(rootReducer, 
                          initialState, 
                          composeWithDevTools(applyMiddleware(...middleware))
                          );


export default store;

