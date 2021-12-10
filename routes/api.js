'use strict';

require('mongodb');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date, default: () => new Date().toISOString() },
  updated_on: { type: Date, default: () => new Date().toISOString() },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: '' },
});
const Issue = new mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
    // middlewares for issue-related CRUD only

    .get(function (req, res, next) {
      const project = req.params.project;
      let queries = req.query;
      queries.project = project;

      Issue.find(queries, function (err, docs) {
        if (err) next(err);
        if (!docs) next();
        res.json(docs);
      });
    })
    
    .post(function (req, res, next) {
      const project = req.params.project;
      let doc = req.body;
      doc.project = project;
      if (!(doc.issue_title && doc.issue_text && doc.created_by)) next();
      Issue.create(doc, function (err, newdoc) {
        if (err) next(err);
        res.json(newdoc);
      })
    })
    
    .put(function (req, res, next) {
      //const project = req.params.project; //flat schema, no need
      const doc = req.body;
      const {_id, ...update} = doc;
      Issue.findByIdAndUpdate(_id, update, { new: true }, function (err, newdoc) {
        if (err) next(err);
        res.json(newdoc);
      })
    })
    
    .delete(function (req, res, next){
      //const project = req.params.project; //flat schema, no need
      const _id = req.body._id;
      Issue.findByIdAndDelete(_id, function (err, doc) {
        if (err) next(err);
        res.json(doc);
      })
    })
    
};
