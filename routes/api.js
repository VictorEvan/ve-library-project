/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectId;

//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {
  
  const bookColl = db.collection('book');
  
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      const responseArr = [];
      bookColl.find({}).forEach( book => {
        const responseObj = {
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }
        responseArr.push(responseObj);
      }, (err) => {
        if (err) return console.error(err);
        else res.json(responseArr);
      });
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      console.log(req.body);
      var title = req.body.title;
      if (!title) {
        res.status(400);
        return res.send('missing title');
      }
      const bookId = new ObjectId();
      db.collection('book').save({_id: bookId, title, comments: []}, function(err, doc){
        if (err) return console.error('error saving book:', err);
        else res.json({title, _id: bookId, comments: []});
      });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      bookColl.remove({}, (err, result)=>{
        console.log(result);
        if (err) return console.error(err);
        else return res.send('complete delete successful');
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      console.log(bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      bookColl.findOne({_id: ObjectId(bookid)}, (err, bookDoc) => {
        if (err) return console.error(err);
        if (!bookDoc) {
          res.status(404);
          return res.send('no book exists');
        }
        else return res.json(bookDoc);
      });
    })
    
    .post(function(req, res){
      var bookid = new ObjectId(req.params.id);
      var comment = req.body.comment;
    
      bookColl.findAndModify(
        {_id: bookid},
        {},
        { $push: { comments: comment}},
        {new: true},
        (err, bookDoc) => {
          if (err) return console.error(err);
          else res.json(bookDoc.value);
      });
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = ObjectId(req.params.id);
      bookColl.findOneAndDelete(bookid, (err, result) => {
        if (err) return console.error(err);
        if (result.value == null) {
          res.send('id invalid, nothing deleted');
        } else return res.send('delete successful');
      });
      //if successful response will be 'delete successful'
    });
  
};
