import multer from 'multer';

export class Storage {
  private static storage: multer.StorageEngine = multer.diskStorage({
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
  public static upload = multer({
    dest: 'public/images',
    storage: Storage.storage,
  });
}
