const glob = require('glob') // Library for file path matching
const CopyPlugin = require('copy-webpack-plugin') // Plugin for copying files during build
const ESLintPlugin = require('eslint-webpack-plugin') // Plugin for ESLint integration
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // Plugin for extracting CSS into separate files
const path = require('path') // Node.js module for working with file paths
const WebpackShellPluginNext = require('webpack-shell-plugin-next') // Plugin for running shell commands during build

module.exports = (env, argv) => {
  const devMode = argv.mode === 'development' // Check if the build mode is development
  const themeName = argv.env.theme || 'development' // Set the theme name based on the environment variable or default to 'development'
  const buildDir = devMode ? './src' : './dist' // Set the build directory based on the build mode

  const config = {
    entry: glob.sync('./src/scripts/*.js').reduce((acc, path) => {
      const entry = path.replace(/^.*[\\\/]/, '').replace('.js', '') // Extract the entry name from the file path
      acc[entry] = path // Add the entry to the accumulator object
      return acc
    }, {}),
    output: {
      path: path.resolve(__dirname, buildDir), // Resolve the output path based on the build directory
      filename: './assets/bundle.[name].js' // Set the output filename pattern for bundled JavaScript files
    },
    devtool: devMode ? 'eval-cheap-source-map' : 'none', // Set the devtool configuration for source mapping
    cache: false, // Disable caching for faster builds
    performance: {
      hints: false // Disable performance hints
    },
    module: {
      rules: [
        {
          test: /\.(sc|sa|c)ss$/, // Match SCSS, Sass, and CSS files
          use: [
            MiniCssExtractPlugin.loader, // Extract CSS into separate files
            {
              loader: 'css-loader',
              options: {
                url: false // Disable URL handling in CSS
              }
            },
            'postcss-loader', // Loader for processing CSS with PostCSS plugins
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true // Enable source maps for Sass
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/, // Match image files
          use: ['file-loader'] // Use file-loader to handle image files
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/, // Match font files
          use: ['file-loader'] // Use file-loader to handle font files
        },
        {
          test: /\.js$/, // Match JavaScript files
          exclude: [/node_modules/, path.resolve('vendor.js')], // Exclude files from processing
          use: ['babel-loader'] // Use Babel to transpile JavaScript
        },
        {
          test: path.resolve('vendor.js'), // Match the vendor.js file
          loader: 'imports-loader', // Use imports-loader for importing external dependencies
          options: {
            imports: [
              {
                syntax: 'default',
                moduleName: 'jquery',
                name: '$' // Import jQuery as $
              }
            ],
            additionalCode: 'var define = false; var modules = false;' // Additional code to execute during import
          }
        }
      ]
    },
    plugins: [
      new ESLintPlugin({
        fix: true // Enable automatic fixing of ESLint errors
      }),
      new MiniCssExtractPlugin({
        filename: './assets/bundle.[name].css.liquid' // Set the output filename pattern for bundled CSS files
      })
    ]
  }

  if (devMode) {
    config.plugins.push(
      new WebpackShellPluginNext({
        onBuildStart: {
          scripts: ['echo Webpack build started...'] // Execute a shell command at the start of the build
        },
        onBuildError: {
          scripts: ['echo Webpack build failed...'] // Execute a shell command if there is a build error
        },
        onBuildEnd: {
          scripts: [
            `shopify-themekit watch --env=${themeName} --dir src`, // Watch for changes using Shopify Themekit
            `shopify-themekit open --env=${themeName}` // Open the Shopify theme editor
          ],
          parallel: true // Run the scripts in parallel
        }
      })
    )
  } else {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: 'src/assets/*',
            to: 'assets/[name].[ext]' // Copy asset files to the build directory
          },
          {
            from: 'src/config/*.json',
            to: 'config/[name].[ext]' // Copy config files to the build directory
          },
          {
            from: 'src/layout/*.liquid',
            to: 'layout/[name].[ext]' // Copy layout files to the build directory
          },
          {
            from: 'src/locales/*.json',
            to: 'locales/[name].[ext]' // Copy locale files to the build directory
          },
          {
            from: 'src/sections/*.liquid',
            to: 'sections/[name].[ext]' // Copy section files to the build directory
          },
          {
            from: 'src/snippets/*.liquid',
            to: 'snippets/[name].[ext]' // Copy snippet files to the build directory
          },
          {
            from: 'src/templates/*.liquid',
            to: 'templates/[name].[ext]' // Copy template files to the build directory
          },
          {
            from: 'src/templates/customers/*.liquid',
            to: 'templates/customers/[name].[ext]' // Copy customer template files to the build directory
          }
        ]
      })
    )
  }
  return config
}

