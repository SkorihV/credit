const urlParams = new URLSearchParams(window.location.search)

export const getQueryParam = (name) => {
  if (name === null) {
    return null
  }
  return urlParams.get(name)
}

export const setQueryParam = (name, value) => {
  if (name === null || value === null) {
    return null
  }
  urlParams.set(name, value)
  // window.location.search = urlParams.toString();
}
