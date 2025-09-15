import { withPayload } from '@payloadcms/next/withPayload'
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withMDX(withPayload(nextConfig, { devBundleServerPackages: false }))
