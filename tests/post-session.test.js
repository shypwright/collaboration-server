const test = require("ava")
const getDB = require("../db")
const app = require("../api/session/index.js")
const http = require("http")
const micro = require("micro")
const listen = require("test-listen")
const postJSON = require("bent")("json", "POST")

test("get session", async t => {
  const db = await getDB({ testDB: true })
  const service = micro(app)
  const url = await listen(service)
  const response = await postJSON(url, {
    udt: {
      interface: {
        type: "image_segmentation",
        availableLabels: ["valid", "invalid"],
        regionTypesAllowed: ["bounding-box", "polygon", "point"]
      },
      taskData: [
        {
          imageUrl:
            "https://s3.amazonaws.com/asset.workaround.online/example-jobs/sticky-notes/image1.jpg"
        },
        {
          imageUrl:
            "https://s3.amazonaws.com/asset.workaround.online/example-jobs/sticky-notes/image2.jpg"
        }
      ],
      taskOutput: [
        [
          {
            regionType: "bounding-box",
            centerX: 0.43416827231856137,
            centerY: 0.3111753371868978,
            width: 0.09248554913294799,
            height: 0.0789980732177264,
            color: "hsl(297,100%,50%)"
          }
        ],
        null
      ]
    }
  })
  t.assert(response.sessionId)
  t.assert(await db("latest_session_state").first())

  db.destroy()
})
