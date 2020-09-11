const AWS = require('aws-sdk');
const sts = new AWS.STS();

const getCrossAccountCredentials = async () => {
  return new Promise((resolve, reject) => {
    const params = {
      RoleArn: `arn:aws:iam::${DEV_ACCOUNT_ID}:role/deployer_role`,
      RoleSessionName: `${CIRCLE_SHA1}`
    };
    sts.assumeRole(params, (err, data) => {
      if (err) reject(err);
      else {
        resolve({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken,
            export AWS_ACCESS_KEY_ID=accessKeyId,
            export AWS_SECRET_ACCESS_KEY=secretAccessKey,
            export AWS_SESSION_TOKEN=sessionToken
        });
      }
    });
  });
}

getCrossAccountCredentials();