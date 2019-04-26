import isEmpty from '../validation/is-empty';

import { SET_CURRENT_USER } from '../actions/types';

const initialState = {
  isAuthenticated: false,
  user: {},
  token: null
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload.user,
        token: action.payload.token
      };
    default:
      return state;
  }
}
