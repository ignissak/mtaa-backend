import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    // insert before extension Date
    const name = file.originalname.split('.');
    const date = new Date().getTime();
    cb(null, name[0] + '-' + date + '.' + name[1]);
  },
});

const upload = multer({
  storage: storage,
});

export default upload;
