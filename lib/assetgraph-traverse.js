const compileQuery = require('assetgraph/lib/compileQuery'); // FIXME, expose this

function* preorder(assetGraph, startAssetOrRelation, relationQueryObj) {
  yield* traverse(assetGraph, startAssetOrRelation, relationQueryObj);
}

function* postorder(assetGraph, startAssetOrRelation, relationQueryObj) {
  yield* traverse(
    assetGraph,
    startAssetOrRelation,
    relationQueryObj,
    'postorder'
  );
}

function* traverse(
  assetGraph,
  startAssetOrRelation,
  relationQueryObj,
  mode = 'preorder'
) {
  const relationQueryMatcher =
    relationQueryObj && compileQuery(relationQueryObj);
  let startAsset;
  let startRelation;
  if (startAssetOrRelation.isRelation) {
    startRelation = startAssetOrRelation;
    startAsset = startRelation.to;
  } else {
    // incomingRelation will be undefined when (pre|post)OrderLambda(startAsset) is called
    startAsset = startAssetOrRelation;
  }

  const seenAssets = {};
  const assetStack = [];
  const traverse = function*(asset, incomingRelation) {
    if (!seenAssets[asset.id]) {
      if (mode === 'preorder') {
        yield [asset, incomingRelation];
      }
      seenAssets[asset.id] = true;
      assetStack.push(asset);
      for (const relation of assetGraph.findRelations({ from: asset })) {
        if (!relationQueryMatcher || relationQueryMatcher(relation)) {
          yield* traverse(relation.to, relation);
        }
      }
      const previousAsset = assetStack.pop();
      if (mode === 'postorder') {
        yield [previousAsset, incomingRelation];
      }
    }
  };

  yield* traverse(startAsset, startRelation);
}

module.exports = { preorder, postorder };
