const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const BucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

const AwsS3Service = {
  //upload file to s3
  async uploadFile(file, bucketName = BucketName) {
    const fileStream = fs.readFileSync(file.path);

    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: `route_${Date.now()}_${file.originalname}`,
    };

    const { mimetype } = file;
    if (
      mimetype === "image/jpeg" ||
      mimetype === "image/png" ||
      mimetype === "image/gif" ||
      mimetype === "video/mp3" ||
      mimetype === "video/mp4" ||
      mimetype === "video/x-ms-wmv" ||
      mimetype === "image/jpg"
    )
      uploadParams.ContentType = mimetype;

    try {
      const result = await s3.upload(uploadParams).promise();
      return result.Location;
      // return file;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },
};

module.exports = AwsS3Service;
