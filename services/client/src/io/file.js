import Promise from 'bluebird';

export default file => new Promise((resolve, reject) => {
  const fileReader = new FileReader();
  fileReader.onload = e => resolve(e.target.result);
  fileReader.onerror = e => reject(e);
  fileReader.readAsDataURL(file);
});
