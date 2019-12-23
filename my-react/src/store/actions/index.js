import * as types from '../constants/ActionTypes';

export const weatherFather = text => {
  return { type: types.weatherFather, weatherFather: text };
};


