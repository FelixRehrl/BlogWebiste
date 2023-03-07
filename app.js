//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const ld = require('lodash');
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// 'Connecting Database'
main().catch(err => console.log(err));
mongoose.set('strictQuery', true);

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true });

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const userSchema = new mongoose.Schema({
  
})

const blogPostSchema = new mongoose.Schema({

  name : String,
  text : String

});
const BlogPost = mongoose.model("BlogPost", blogPostSchema);


const blogSchema = new mongoose.Schema({
  name : String,
  blogPosts : [blogPostSchema]
});
const Blog = mongoose.model("Blog", blogSchema);


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


const homeStartingContentBlog = new BlogPost({
  name: "HomeDefaultBlog",
  text: homeStartingContent
});

const aboutContentBlog = new BlogPost({
  name: "AboutDefaultBlog",
  text: aboutContent
});

const contactContentBlog = new BlogPost({
   name: "ContactDefaultBlog",
   text: contactContent
});

// Adding Initial BlogPosts to DB
BlogPost.find({}, function (err, blogs) {

  if (err) {
    console.log(err);
  } else if (blogs.length === 0) {

    BlogPost.insertMany([
       homeStartingContentBlog, aboutContentBlog, contactContentBlog
    ]).then(function(){
        console.log("Starting BlogPosts successfully inserted.")  // Success
    }).catch(function(error){
        console.log(error)      // Failure
    });

  }

});


// Home Route
app.get("/", function (req, res) {

  // We Retrieve the HomeBlog
  Blog.findOne( {name : "Home"}, function (err, foundBlog) {

    // There shoudl always be a home blog
    if (!err) {
      if (!foundBlog) {

        // If there isn't a homeBlog we have to create it
        const homeBlog = new Blog({
          name: "Home",
          blogPosts : [homeStartingContentBlog]
        });

        homeBlog.save();
        res.redirect("/");
      // We want to build all the posts in the home blog post
      } else {
        res.render("home", {posts: foundBlog.blogPosts});
      }
    }

  });


});


// About Route
app.get("/about", function (req, res) {

  // We Retrieve the HomeBlog
  Blog.findOne( {name : "About"}, function (err, foundBlog) {

    // There shoudl always be a home blog
    if (!err) {
      if (!foundBlog) {

        // If there are no posts yet, create them
        const aboutBlog = new Blog({
          name: "About",
          blogPosts : [aboutContentBlog]
        });

        aboutBlog.save();
        res.redirect("/about");
      // We want to build all the posts in the home blog post
      } else {
        res.render("about", {posts: foundBlog.blogPosts});
      }
    }

  });

});


// Contact Route
app.get("/contact", function (req, res) {

  // We Retrieve the HomeBlog
  Blog.findOne( {name : "Contact"}, function (err, foundBlog) {

    // There shoudl always be a home blog
    if (!err) {
      if (!foundBlog) {

        // If there are no posts yet, create them
        const contactBlog = new Blog({
          name: "Contact",
          blogPosts : [contactContentBlog]
        });

        homeBlog.save();
        res.redirect("/contact");
      // We want to build all the posts in the home blog post
      } else {
        res.render("contact", {posts: foundBlog.blogPosts});
      }
    }

  });

});



// Compose Route
app.get("/compose", function (req, res) {

  res.render("compose");

});



// Handling Post-Reqquests
app.post( "/compose", function (req, res) {

  const post = {

    title: req.body.inputTitle,
    content:  req.body.inputCompose

  };

  const newBlogPost = new BlogPost( {
    name : post.title,
    text : post.content
  });

  newBlogPost.save();

  Blog.findOne({name : "Home"}, function (err, homeBlog) {

    if (!err) {

      homeBlog.blogPosts.push(newBlogPost);
      homeBlog.save();
      res.redirect("/");
    } else {

      res.redirect("/");
    }

  });

});



app.get("/posts/:newPage", function (req, res) {

   // User Trying to Access New Composition
   let newPost = req.params.newPage;

   // We need to find the corresponding blogPost
   BlogPost.findOne( {name : newPost}, function (err, foundBlogPost) {

     res.render("post", {title: ld.capitalize(newPost) , content: foundBlogPost.text });
   });

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
