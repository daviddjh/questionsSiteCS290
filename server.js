//set server port
 var port_number = 3000;
 if(process.env.PORT){
     port_number = process.env.PORT;
 }

//diffrent categories on the site
var pages = [];

//importing mongodb values from environment variables
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME; 
const mongoURL =
	'mongodb://' + mongoUser + ':' + mongoPassword + '@' +
  mongoHost + ':' + mongoPort + '/' + mongoDBName;

//setting up server 
const express = require('express');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const app = express();
const port = port_number;
var mongoDBDatabase;

app.engine('handlebars', exphbs({defaultLayout: 'main' })); 
app.set('view engine', 'handlebars');
app.use(bodyParser.json());

Handlebars.registerHelper('convertTag', function(a){
  if (a === "sports"){
    return "Sports";
  } else if (a == "animals"){
    return "Animals";
  } else if (a == "news"){
    return "News";
  } else if (a == "politics"){
    return "Politics";
  } else if (a == "gaming"){
    return "Gaming";
  }
});

app.get('/', function(req, res, next){
  res.redirect("/all");
});

//serve static files
app.use(express.static(__dirname + "/public"));

//serve a page with many posts
app.get('/:page', function(req, res, next){
  var page = req.params.page;

  // makes sure page is valid
  if(pages.includes(page)){

    //get posts from DB
    var postDB = db.collection('posts');
    if(page != "all"){
      var postCursor = postDB.find({tag: {$in: [page]}}).sort({votes: -1});
    } else {
      var postCursor = postDB.find({}).sort({votes: -1});
    }

    //turn posts into array
    postCursor.toArray(function (err, postDocs){
      console.log(postDocs);

      if(err) {
        res.status(500).send("Error fetching pages from DB")

      } else {
        if(postDocs){
          //temp page
          //res.status(200).sendFile(__dirname + "/public/index.html");

          //render and send the post's page
          res.status(200).render('catpage', {
            posts: postDocs,
            page: page
          });

        } else {
          console.log("couldn't find posts in DB")
          next();
        }
      }
    });
  } else {
    console.log("couldn't find page " + page );
    next();
  }
});

//serve a specific post's page with comments
app.get('/:postID', function(req, res, next){
  var postID = req.params.postID;
  console.log("String: " + postID + " Type: " + typeof postID);
  if(ObjectID.isValid(postID)){

    //get posts from server
    var post_OID = new ObjectID(postID);
    var postDB = db.collection('posts');
    var postCursor = postDB.find({_id: post_OID});

    //get commnet from server
    var commentDB = db.collection('comments');
    var commentCursor = commentDB.find({postID: post_OID});

    //turn post into array
    postCursor.toArray(function (err, postDocs){
      console.log("post: ");
      console.log(postDocs);

      if(err) {
        res.status(500).send("Error fetching post from DB")
      } else {

        //makes sure post is real
        if(postDocs){

          //turn comments to array 
          commentCursor.toArray(function (err, commentDocs){
            if(err) {
              res.status(500).send("Error fetching comments from DB")
            } else {

              if(commentDocs){
                //temp
                //res.status(200).sendFile(__dirname + "/public/index.html");
                console.log("comments: ");
                console.log(commentDocs);

                res.status(200).render('postPage', {
                  page: postDocs[0].tag[0],
                  postData: postDocs[0],
                  comments: commentDocs,
                });
                /*
                //render post's page and send
                res.status(200).render(postPage, {
                  post: post
                });
                */
              } else {
                console.log("couldn't find comment in DB")
                next();
              }
            }
          });
        } else {
          console.log("couldn't find post in DB")
          next();
        }
      }
    });
  } else { 
    console.log("object id is invalid");
    next();
  }
});

//serve 404 page
app.get('*', function(req, res, next) {
  res.status(200).render('404', {});
});

//api route for addding a post
app.post('/addPost', function (req, res){
  if (req.body && req.body.title && req.body.text && req.body.userID && req.body.tag) {

    // Add post to DB here.
    var postDB = db.collection('posts');
    var postData = {
      tag: req.body.tag,
      userID: req.body.userID,
      title: req.body.title,
      text: req.body.text,
      votes: 0
    };
    postDB.insertOne(postData, function(err, insertedPost){

      if(err){

        res.status(400).send("Error adding post to DB");

      } else {

        var postDataID = new ObjectID(insertedPost.insertedId);
        console.log(postDataID);

        res.status(200).send(postDataID);
      }

    });


  } else {
    res.status(400).send("Requests to this path must " +
      "contain a JSON body with title, text, and author " +
      "fields.");
  }
});

//api route for addding a comment 
app.post('/:postID/addComment', function (req, res){
  if (req.body && req.body.text && req.body.userID) {

    // Add comment to DB here.
    var postID = req.params.postID;
    var post_OID = new ObjectID(postID);
    var postDB = db.collection('posts');
    var postCursor = postDB.find({_id: post_OID});
    var commentsDB = db.collection('comments');

    //find post to make sure it is real
    postCursor.toArray(function (err, postDocs){
      console.log(postDocs);

      if(err) {
        res.status(400).send("Post Not Found");
      } else {
          //ensure post is real
          if(postDocs){
            //add comment
            commentsDB.insertOne({
              userID: req.body.userID,
              postID: post_OID,
              text: req.body.text,
            });
          } else {
            res.status(400).send("Requests to this path must " +
            "contain a JSON body with title, text, and author " +
            "fields.");
          }
      }
    });


      res.status(200).send("Comment added");
    } else {
      res.status(400).send("Requests to this path must " +
        "contain a JSON body with a text and author " +
        "fields.");
    }
  });


//establish connection with MongoDB server
MongoClient.connect(mongoURL, function (err, client) {
  if(err) {
    throw err;
  }

  //if successfull, continue setting up server
  db = mongoDBDatabase = client.db(mongoDBName);

  //get pages from db
  var pagesDB = db.collection('pages');
  var pagesCursor = pagesDB.find({});
  pagesCursor.toArray(function (err, pageDocs){
    if(err){
      console.log(err);
    } else {
      //add pages to pages array
      for (i = 0; i < Object.keys(pageDocs).length; i++ ){
        pages.push(pageDocs[i].page);
      }
      //start server
      app.listen(port, () => console.log("listening on port " + port));
    }
  });
});
