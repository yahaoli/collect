import * as types from '../constants/ActionTypes';

const initialState = {
  //数据录入所有景区的列表天气
  weatherFather: '',
};
export default function setTodo(state = initialState, action) {
  switch (action.type) {
    case types.weatherFather:
      return { ...state, weatherFather: action.weatherFather };
    default:
      return state;
  }
}
