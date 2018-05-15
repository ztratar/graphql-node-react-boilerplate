export const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = function (e) {
    resolve(e.target.result);
  };
  reader.onerror = function (e) {
    reject(e);
  };
  reader.readAsDataURL(file);
});

export const dataURLtoFile = (dataurl, filename) => {
  var arr = dataurl.split(',')
    , mime = arr[0].match(/:(.*?);/)[1]
    , bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export const cropImageUpload = (file, width, height) => new Promise((resolve, reject) => {
  try {
    var canvas = document.createElement('canvas')
      , ctx = canvas.getContext('2d')
      , reader = new FileReader();

    document.body.appendChild(canvas);

    reader.onload = (event) => {
      var img = new Image();

      img.onload = () => {
        let startCropX
          , startCropY
          , cropWidth
          , cropHeight;

        if (img.width > img.height) {
          startCropY = 0;
          startCropX = (img.width - img.height) / 2;
          cropHeight = img.height;
          cropWidth = img.height;
        } else {
          startCropX = 0;
          startCropY = (img.height- img.width) / 2;
          cropHeight = img.width;
          cropWidth = img.width;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, startCropX, startCropY, cropWidth, cropHeight, 0, 0, width, height);

        var dataURI = canvas.toDataURL('image/jpeg');

        resolve(dataURI);

        document.body.removeChild(canvas);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  } catch (e) {
    reject(e);
  }
});
