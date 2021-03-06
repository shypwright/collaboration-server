const test = require("ava")
const getDB = require("../src/db")
const app = require("../app")
const micro = require("micro")
const listen = require("test-listen")
const postJSON = require("bent")("json", "POST")

test("Create session", async (t) => {
  const db = await getDB({ testDB: true })
  const service = micro(app)
  const url = await listen(service)

  const response = await postJSON(`${url}/api/session`, {
    udt: {
      interface: {
        type: "image_segmentation",
        availableLabels: ["valid", "invalid"],
        regionTypesAllowed: ["bounding-box", "polygon", "point"],
      },
      samples: [
        {
          imageUrl:
            "https://s3.amazonaws.com/asset.workaround.online/example-jobs/sticky-notes/image1.jpg",
        },
        {
          imageUrl:
            "https://s3.amazonaws.com/asset.workaround.online/example-jobs/sticky-notes/image2.jpg",
        },
      ],
    },
  })
  t.assert(response.short_id)
  const addedSession = db
    .prepare(
      `SELECT  *
       FROM latest_session_state
       WHERE short_id = ?
       LIMIT 1`
    )
    .get(response.short_id)
  t.assert(addedSession)
  t.deepEqual(JSON.parse(addedSession.summary_object).interface, {
    type: "image_segmentation",
    availableLabels: ["valid", "invalid"],
    regionTypesAllowed: ["bounding-box", "polygon", "point"],
  })
  t.like(JSON.parse(addedSession.summary_object).summary.samples[0], {
    hasAnnotation: false,
    version: 0,
  })

  db.destroy()
})
