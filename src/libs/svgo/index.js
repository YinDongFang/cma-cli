'use strict'

const fs = require('fs')
const Svgo = require('svgo')

function initialize(plugins, base64) {
  return new Svgo({
    datauri: base64 ? 'base64' : undefined,
    plugins: [
      {
        cleanupAttrs: true,
      },
      {
        removeDoctype: true,
      },
      {
        removeXMLProcInst: true,
      },
      {
        removeComments: true,
      },
      {
        removeMetadata: true,
      },
      {
        removeTitle: true,
      },
      {
        removeDesc: true,
      },
      {
        removeUselessDefs: true,
      },
      {
        removeEditorsNSData: true,
      },
      {
        removeEmptyAttrs: true,
      },
      {
        removeHiddenElems: true,
      },
      {
        removeEmptyText: true,
      },
      {
        removeEmptyContainers: true,
      },
      {
        removeViewBox: false,
      },
      {
        cleanupEnableBackground: true,
      },
      {
        convertStyleToAttrs: true,
      },
      {
        convertColors: true,
      },
      {
        convertPathData: true,
      },
      {
        convertTransform: true,
      },
      {
        removeUnknownsAndDefaults: true,
      },
      {
        removeNonInheritableGroupAttrs: true,
      },
      {
        removeUselessStrokeAndFill: true,
      },
      {
        removeUnusedNS: true,
      },
      {
        cleanupIDs: true,
      },
      {
        cleanupNumericValues: true,
      },
      {
        moveElemsAttrsToGroup: true,
      },
      {
        moveGroupAttrsToElems: true,
      },
      {
        collapseGroups: true,
      },
      {
        removeRasterImages: false,
      },
      {
        mergePaths: true,
      },
      {
        convertShapeToPath: true,
      },
      {
        sortAttrs: true,
      },
      {
        removeDimensions: false,
      },
      {
        removeAttrs: false,
      },
      ...plugins,
    ],
  })
}

module.exports = function optimize(filepath, plugins, base64 = true) {
  return new Promise((resolve) => {
    fs.readFile(filepath, 'utf8', function (err, data) {
      initialize(
        plugins.map((plugin) =>
          plugin.custom
            ? {
                [plugin.name]: plugin,
              }
            : plugin
        ),
        base64
      )
        .optimize(data, {path: filepath})
        .then(function (result) {
          plugins.forEach((plugin) => {
            if (typeof plugin.after === 'function') {
              plugin.after(result)
            }
          })
          resolve(result)
        })
    })
  })
}
