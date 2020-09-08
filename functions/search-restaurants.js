const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient
const dynamodb = new DocumentClient()
const { metricScope, Unit } = require('aws-embedded-metrics')

const defaultResults = process.env.defaultResults || 8
const tableName = process.env.restaurants_table

const findRestaurantsByTheme = async (theme, count) => {
  console.log(`finding (up to ${count}) restaurants with the theme ${theme}...`)
  const req = {
    TableName: tableName,
    Limit: count,
    FilterExpression: "contains(themes, :theme)",
    ExpressionAttributeValues: { ":theme": theme }
  }

  const resp = await dynamodb.scan(req).promise()
  console.log(`found ${resp.Items.length} restaurants`)
  return resp.Items
}

module.exports.handler = metricScope(metrics =>
  async (event, context) => {
    //namespace values for metrics
    metrics.setNamespace('workshop-garycraine')
    metrics.putDimensions({ Service: "findRestaurantsByTheme" })
    
    const req = JSON.parse(event.body)
    const theme = req.theme
    
    //wrap function dynamodb call in a latency timer
    const start = Date.now()
    const restaurants = await findRestaurantsByTheme(theme, defaultResults)
    const end = Date.now()

    //record metrics to cloudwatch
    metrics.putMetric("latency", end - start, Unit.Milliseconds)
    metrics.putMetric("count", restaurants.length, Unit.Count)
    metrics.setProperty("RequestId", context.awsRequestId)
    //metrics.setProperty("ApiGatewayRequestId", event.requestContext.requestId)

    const response = {
      statusCode: 200,
      body: JSON.stringify(restaurants)
    }

    return response
})

/*
const DocumentClient = require('aws-sdk/clients/dynamodb').DocumentClient
const dynamodb = new DocumentClient()

const defaultResults = process.env.defaultResults || 8
const tableName = process.env.restaurants_table

const findRestaurantsByTheme = async (theme, count) => {
  console.log(`finding (up to ${count}) restaurants with the theme ${theme}...`)
  const req = {
    TableName: tableName,
    Limit: count,
    FilterExpression: "contains(themes, :theme)",
    ExpressionAttributeValues: { ":theme": theme }
  }

  const resp = await dynamodb.scan(req).promise()
  console.log(`found ${resp.Items.length} restaurants`)
  return resp.Items
}

module.exports.handler = async (event, context) => {
    const req = JSON.parse(event.body)
    const theme = req.theme
    const restaurants = await findRestaurantsByTheme(theme, defaultResults)

    const response = {
      statusCode: 200,
      body: JSON.stringify(restaurants)
    }

    return response
}
*/


