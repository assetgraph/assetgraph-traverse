const AssetGraph = require('assetgraph');
const sinon = require('sinon');
const pathModule = require('path');
const expect = require('unexpected')
  .clone()
  .use(require('unexpected-sinon'));
const {
  preorder,
  postorder,
  reversePath
} = require('../lib/assetgraph-traverse');

describe('preorder', function() {
  it('should visit the assets in the correct order', async function() {
    const assetGraph = new AssetGraph({
      root: pathModule.resolve(__dirname, '..', 'testdata', 'htmlWithCss')
    });
    const [htmlAsset] = await assetGraph.loadAssets('index.html');
    await assetGraph.populate();

    const htmlStyle = htmlAsset.outgoingRelations[0];
    const stylesCss = assetGraph.findAssets({ fileName: 'styles.css' })[0];
    const fooPng = assetGraph.findAssets({ fileName: 'foo.png' })[0];
    const fooCssImage = fooPng.incomingRelations[0];
    const barPng = assetGraph.findAssets({ fileName: 'bar.png' })[0];
    const barCssImage = barPng.incomingRelations[0];

    const visitSpy = sinon.spy().named('visit');

    for (const asset of preorder(assetGraph, htmlAsset)) {
      visitSpy(asset);
    }

    expect(visitSpy, 'to have calls satisfying', () => {
      visitSpy([htmlAsset, undefined]);
      visitSpy([stylesCss, htmlStyle]);
      visitSpy([fooPng, fooCssImage]);
      visitSpy([barPng, barCssImage]);
    });
  });
});

describe('postorder', function() {
  it('should visit the assets in the correct order', async function() {
    const assetGraph = new AssetGraph({
      root: pathModule.resolve(__dirname, '..', 'testdata', 'htmlWithCss')
    });
    const [htmlAsset] = await assetGraph.loadAssets('index.html');
    await assetGraph.populate();

    const htmlStyle = htmlAsset.outgoingRelations[0];
    const stylesCss = assetGraph.findAssets({ fileName: 'styles.css' })[0];
    const fooPng = assetGraph.findAssets({ fileName: 'foo.png' })[0];
    const fooCssImage = fooPng.incomingRelations[0];
    const barPng = assetGraph.findAssets({ fileName: 'bar.png' })[0];
    const barCssImage = barPng.incomingRelations[0];

    const visitSpy = sinon.spy().named('visit');

    for (const asset of postorder(assetGraph, htmlAsset)) {
      visitSpy(asset);
    }

    expect(visitSpy, 'to have calls satisfying', () => {
      visitSpy([fooPng, fooCssImage]);
      visitSpy([barPng, barCssImage]);
      visitSpy([stylesCss, htmlStyle]);
      visitSpy([htmlAsset, undefined]);
    });
  });
});

describe('reversePath', function() {
  it('should visit the assets in the correct order', async function() {
    const assetGraph = new AssetGraph({
      root: pathModule.resolve(__dirname, '..', 'testdata', 'htmlWithCss')
    });
    const [htmlAsset] = await assetGraph.loadAssets('index.html');
    await assetGraph.populate();

    const htmlStyle = htmlAsset.outgoingRelations[0];
    const stylesCss = assetGraph.findAssets({ fileName: 'styles.css' })[0];
    const fooPng = assetGraph.findAssets({ fileName: 'foo.png' })[0];
    const barPng = assetGraph.findAssets({ fileName: 'bar.png' })[0];
    const barCssImage = barPng.incomingRelations[0];

    const visitSpy = sinon.spy().named('visit');

    for (const asset of reversePath(assetGraph, barPng, htmlAsset)) {
      visitSpy(asset);
    }

    expect(visitSpy, 'to have calls satisfying', () => {
      visitSpy([barPng, undefined]);
      visitSpy([stylesCss, barCssImage]);
      visitSpy([htmlAsset, htmlStyle]);
    });
  });
});
