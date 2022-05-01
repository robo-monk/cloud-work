let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e < 63 ? "_" : "-"), "");

addEventListener('fetch', event => {
  let req = event.request;
  req.ip = req.headers.get('CF-Connecting-IP')
  event.respondWith(handleRequest(req))
})

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  })
}

async function getVisits(ip) {
  let visits = (await BEEPOP.list({ prefix: ip }) || { keys: [] }).keys
  return visits?.length || 0
}

async function addVisit(ip) {
  return await BEEPOP.put(`${ip}-${nanoid()}`, 1)
}
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(req) {
  const clientData = {
    visits: await getVisits(req.ip),
    url: req.url,
    ip: req.ip,
    headers: Object.fromEntries(req.headers.entries()),
    kv: {
      all: await BEEPOP.list(),
      non: await BEEPOP.list({ prefix: 'non-' }),
      visits: await BEEPOP.list({ prefix: req.ip }),
    },
    cf: {
      country: req.cf.country,
      city: req.cf.city,
      continent: req.cf.continent,
      latitude: req.cf.latitude,
      longitude: req.cf.longitude,
    }
  }
  await addVisit(req.ip);

  return json(clientData);
  //return new Response(`req ${req.url} ${req.ip}`, {
  //headers: { 'content-type': 'application/plain' },
  //})
}

