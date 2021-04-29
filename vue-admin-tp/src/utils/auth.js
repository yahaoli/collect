import storage from "@/storage";


export function getToken() {
  return localStorage.getItem(storage.userToken);
}

export function setToken(token) {
  return localStorage.setItem(storage.userToken, token);
}

export function removeToken() {
  return localStorage.removeItem(storage.userToken);
}
