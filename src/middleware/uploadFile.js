const util = require("util");
const multer = require("multer");

let TYPE_FILE = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/jpg",
  "video/mp3",
  "video/mp4",
  "video/x-ms-wmv",
  "text/plain",
];

const FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);

let storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const splitFileName = file.originalname.split(".");

    const fileEx = splitFileName[splitFileName.length - 1];

    if (fileEx === "rar") {
      file.mimetype = "application/rar";
    }

    if (TYPE_FILE.indexOf(file.mimetype) === -1) {
      var err = `The file ${file.originalname} is not supported.`;
      return cb(err, null);
    }

    let filename = `${Date.now()}-route-${file.originalname}`;
    cb(null, filename);
  },
});

let uploadFile = multer({
  storage,
  limits: { fileSize: FILE_SIZE },
}).single("file");

let uploadManyFiles = multer({
  storage,
  limits: { fileSize: FILE_SIZE },
}).array("files", 10);

let uploadFileMiddleware = util.promisify(uploadFile);
let uploadManyFilesMiddleware = util.promisify(uploadManyFiles);

module.exports = {
  uploadFileMiddleware,
  uploadManyFilesMiddleware,
};
