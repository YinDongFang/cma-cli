'use strict'

const fs = require('fs')
const Svgo = require('svgo')
const applyColor = require('./applyColor')
const applySize = require('./applySize')

function initialize(plugins) {
  return new Svgo({
    datauri: 'base64',
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

module.exports = function optimize(filepath, color, size) {
  return new Promise((resolve, reject) => {
    const applyColorPlugin = applyColor(color)
    fs.readFile(filepath, 'utf8', function (err, data) {
      initialize([
        {
          applyColor: applyColorPlugin,
        },
        {
          applySize: applySize(size.width, size.height),
        },
      ])
        .optimize(data, {path: filepath})
        .then(function (result) {
          result.info.color = applyColorPlugin.params.color
          resolve(result)
        })
    })
  })
}
