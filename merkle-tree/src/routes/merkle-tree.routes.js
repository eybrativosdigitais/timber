/**
 * @module node.routes.js
 * @author iAmMichaelConnor
 * @desc merkle-tree.routes.js gives api endpoints to access the functions of the merkle-tree microservice
 */

import contractController from '../contract-controller';
import filterController from '../filter-controller';
import merkleTreeController from '../merkle-tree-controller';

const alreadyStarted = {}; // initialises as false

/**
 * Updates the entire tree based on the latest-stored leaves.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * @param {*} req
 * @param {*} res - returns the tree's metadata
 */
async function startFilter(req, res, next) {
  console.log('\nsrc/routes/merkle-tree.routes startFilter()');

  const contractName = req.headers.contractname;
  const { db } = req.user;

  try {
    console.log(`already started?`);
    console.log(alreadyStarted);

    if (alreadyStarted[contractName]) {
      res.data = { message: `filter already started for ${contractName}` };
    } else {
      // get a web3 contractInstance we can work with:
      const contractInstance = await contractController.instantiateContract(db, contractName);

      // start an event filter on this contractInstance:
      const started = await filterController.start(db, contractName, contractInstance);

      alreadyStarted[contractName] = started; // true/false

      res.data = { message: 'filter started' };
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Get the siblingPath or 'witness path' for a given leaf.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * req.params {
 *  leafIndex: 1234,
 * }
 * @param {*} req
 * @param {*} res
 */
async function getSiblingPathByLeafIndex(req, res, next) {
  console.log('\nsrc/routes/merkle-tree.routes getSiblingPathByLeafIndex()');
  console.log('req.params:');
  console.log(req.params);

  try {
    const { db } = req.user;
    let { leafIndex } = req.params;
    leafIndex = Number(leafIndex); // force to number

    const siblingPath = await merkleTreeController.getSiblingPathByLeafIndex(db, leafIndex);

    res.data = siblingPath;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Get the path for a given leaf.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * req.params {
 *  leafIndex: 1234,
 * }
 * @param {*} req
 * @param {*} res
 */
async function getPathByLeafIndex(req, res, next) {
  console.log('\nsrc/routes/merkle-tree.routes getPathByLeafIndex()');
  console.log('req.params:');
  console.log(req.params);

  const { db } = req.user;
  let { leafIndex } = req.params;
  leafIndex = Number(leafIndex); // force to number

  try {
    const path = await merkleTreeController.getPathByLeafIndex(db, leafIndex);

    res.data = path;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Updates the entire tree based on the latest-stored leaves.
 * req.user.db (an instance of mongoose.createConnection (a 'Connection' instance in mongoose terminoligy)) is required, to access the user's db from within the merkleTreeController
 * @param {*} req
 * @param {*} res - returns the tree's metadata
 */
async function update(req, res, next) {
  console.log('\nsrc/routes/merkle-tree.routes update()');

  const { db } = req.user;

  try {
    const metadata = await merkleTreeController.update(db);

    res.data = metadata;
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  router.route('/start').post(startFilter);

  router.route('/update').patch(update);

  router.get('/siblingPath/:leafIndex', getSiblingPathByLeafIndex);
  router.get('/path/:leafIndex', getPathByLeafIndex);
}
