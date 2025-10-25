// storage-adapter-import-placeholder
import { postgresAdapter } from '@deessecms/db-postgres'
import { deesseCloudPlugin } from '@deessecms/deesse-cloud'
import { lexicalEditor } from '@deessecms/richtext-lexical'
import path from 'path'
import { buildConfig } from '@deessejs/cms'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  deesse: {
    admin: {
      user: Users.slug,
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [Users, Media],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
      outputFile: path.resolve(dirname, 'deesse-types.ts'),
    },
    db: postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URI || '',
      },
    }),
    sharp,
    plugins: [
      deesseCloudPlugin(),
      // storage-adapter-placeholder
    ],

  },
})
