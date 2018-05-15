const reload = (route, wait = 250) => __CLIENT__ ? setTimeout(() => {
  if (route) {
    window.location.href = route;
    return;
  }
  window.location.reload()
}, wait) : null;

export default reload;
