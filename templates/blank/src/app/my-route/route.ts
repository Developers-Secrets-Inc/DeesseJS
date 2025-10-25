import configPromise from '@deesse-config'
import { getPayload } from 'deesse'

export const GET = async (request: Request) => {
  const deesse = await getPayload({
    config: configPromise,
  })

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
