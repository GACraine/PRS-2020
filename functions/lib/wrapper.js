const middy = require('@middy/core')
const ssm = require('@middy/ssm')
const { promisify } = require('util')

const { serviceName, stage } = process.env

module.exports = f => {
  const g = middy(f)
    .use(ssm({
        cache: true,
        cacheExpiryInMillis: 5 * 60 * 1000, // 5 mins
        names: {
          config: `/${serviceName}/${stage}/get-restaurants/config`
        },
        onChange: () => {
          const config = JSON.parse(process.env.config)
          process.env.defaultResults = config.defaultResults
        }  
      }))
    .use(ssm({
        cache: true,
        cacheExpiryInMillis: 5 * 60 * 1000, // 5 mins
        names: {
          secretString: `/${serviceName}/${stage}/get-restaurants/secretString`
        },
        setToContext: true
      }))

  return promisify(g)
}