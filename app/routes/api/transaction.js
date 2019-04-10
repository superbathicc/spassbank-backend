const mongoose = require('mongoose');
const Transaction = require('../../models/Transaction');

async function getById(id) {
  let q = Transaction.findById(id);
  return await q.exec();
}

async function create(sender, target, amount) {
  let transaction = new Transaction({
    sender: sender._id,
    target: target._id,
    balance: amount
  })
  let created = await transaction.save();
  return created;
}

async function handleGetTransaction(req, res) {
  if(req.params.transactionId) {
    res.status(200).json(await getById(req.params.transactionId));
  } else {
    res.sendStatus(400);
  }
}

async function handleGetTransactions(req, res) {
  let q = Transaction.find();

  if(req.query.sender) {
    q.where('sender').equals(mongoose.Types.ObjectId(req.query.sender));
  }

  if(req.query.target) {
    q.where('target').equals(mongoose.Types.ObjectId(req.query.target));
  }

  if(req.query.amount) {
    let _ = req.query.amount + '';
    if(_.startsWith('<')) {
      q.where('amount').lt(Number(_.substr(1,_.length-1)));
    } else if(_.startsWith('>')) {
      q.where('amount').gt(Number(_.substr(1,_.length-1)));
    } else {
      q.where('amount').equals(Number(_));
    }
  }

  if(req.query.date) {
    let _ = req.query.date + '';
    if(_.startsWith('<')) {
      q.where('date').lt(Number(_.substr(1,_.length-1)));
    } else if(_.startsWith('>')) {
      q.where('date').gt(Number(_.substr(1,_.length-1)));
    } else {
      q.where('date').equals(Number(_));
    }
  }

  if(req.query.limit) {
    q.limit(Number(req.query.limit));
    if(req.query.page) {
      q.skip(Number(req.query.page));
    }
  }

  var result = await q.exec();
  res.status(200).json(result);
}

function router(app) {
  app.get('/api/transaction/:transactionId', handleGetTransaction);
  app.get('/api/transaction', handleGetTransactions);
}

module.exports = {
  router,

  handleGetTransaction,
  handleGetTransactions,
  
  create,
  getById,
}