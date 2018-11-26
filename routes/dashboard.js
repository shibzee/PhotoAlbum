var express = require('express');
var router = express.Router();
var passport = require('passport');
const async= require('async');
//const storage= require("firebase/storage");
const path= require("path");

const firebase = require("firebase");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAxFkDGITrPybaU3PvuJy10UPRUDHo5dms",
  authDomain: "photoalbum-8b4dc.firebaseapp.com",
  databaseURL: "https://photoalbum-8b4dc.firebaseio.com",
  projectId: "photoalbum-8b4dc",
  storageBucket: "photoalbum-8b4dc.appspot.com",
  messagingSenderId: "731835108842"
};
firebase.initializeApp(config);

//var ref = storage.storage();

const admin= require("firebase-admin");


//Configuring google cloud  storageBucket

const keyFilename="../config/service-account.json"; //replace this with api key file
const projectId = "photoalbum-8b4dc" //replace with your project id
const bucketName = `${projectId}.appspot.com`;


// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage({
  apiKey: "AIzaSyAxFkDGITrPybaU3PvuJy10UPRUDHo5dms",
  authDomain: "photoalbum-8b4dc.firebaseapp.com",
  databaseURL: "https://photoalbum-8b4dc.firebaseio.com",
  projectId: "photoalbum-8b4dc",
  storageBucket: "photoalbum-8b4dc.appspot.com",
  messagingSenderId: "731835108842"
});

// ({
//     projectId,
//     keyFilename
// });

const bucket = storage.bucket(bucketName);

//Configure google cloud storageBucket


const serviceAccount = require('../config/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://photoalbum-8b4dc.firebaseio.com",
  storageBucket: "photoalbum-8b4dc.appspot.com"
});


//const bucket = admin.storage().bucket();

//const firebase= require("firebase");
var secured = require('../lib/middleware/secured');

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

//const s= firebase.storage();
// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});




//Access control
const ensureAuthenticated =(req,res,next)=>{
  if(req.isAuthenticated()){
    return next();
  }
  else{
//    req.flash("error_msg","You are not authorized to view that page");
    res.redirect("/");
  }
}


router.get("/dashboard",secured(), (req,res,next)=>{
//  console.log(req.user);
//console.log(firebase);
// console.log(req.user.nickname);
// console.log(bucket.storage);

async.waterfall([

 function(callback){
   var username= req.user.nickname;


admin.auth().createCustomToken(username)
.then(function(customToken) {
// Send token back to client
   firebase.auth().signInWithCustomToken(customToken);
})
.catch(function(error) {
console.log("Error creating custom token:", error);
});




//   callback(null,token);
 }
]);

async.waterfall([
      function(callback){
        var cityRef = db.collection('users').doc(req.user.nickname);
        var getDoc = cityRef.get()
          .then(doc => {
            if (!doc.exists) {
              console.log('No such document!');

              var details={
                profilePic:'https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg'
              };
              callback(null,details);
      //    callback(null,"");
            } else {
             console.log('Document data:', doc.data().fullname);
          var fullname=doc.data().fullname;
          var profilePic= doc.data().profilePic;

          var details={
            fullname,
            profilePic
          };
          callback(null,details);

            }
          })
          .catch(err => {
            console.log('Error getting document', err);
          });

      },
      function(details,callback){

        //'https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg'
        res.render("dashboard",{userr:"u14cs1074",imageUrl:details.profilePic,fullname:details.fullname});

      }]);



/*var cityRef = db.collection('users').doc(req.user.nickname);

var fullname="meat";



console.log(fullname);*/


//  console.log("This is my username",firebase.auth().currentUser.uid);
});



router.post("/dashboard",(req,res,next)=>{

//  var currentUser=firebase.auth().currentUser.uid;

//var file = $('#poster').get(0).files[0];
// console.log(req.files);
// var img= req.body.avatarImg.path;
// console.log(img);

//console.log(req);





const file= req.files[0];
  const {
    fieldname,
    originalname,
    encoding,
    mimetype,
    buffer} = req.files[0];
// Create the file metadata
  var metadata = {
    contentType:  mimetype
  };

  // Create a root reference
  console.log(originalname.path);
console.log(file.path);




const fileName= "super.jpg";

const fileUpload= bucket.file(fileName)

const uploadStream= fileUpload.createWriteStream({
  metadata:{contentType:mimetype,cacheControl: 'no-cache'}
});
uploadStream.on("error",(err)=>{
  console.log(err);
  return;
});
uploadStream.on("finish",()=>{

  console.log("upload Success");

  fileUpload.makePublic().then(()=>{
  //  console.log(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`)
    //console.log(`http://storage.googleapis.com/${bucket.name}/${encodeURIComponent(fileUpload.name)}`);


  });

})

uploadStream.end(file.buffer);

var fullname;
var nickname;
var regno;
var address;
var pic;
var bq;
var crush;
var hobbies;
var birthday;
var profilePic;


var userdetails={
  fullname,
  profilePic
};

db.collection("users").doc(req.user.nickname).set({
  fullname: req.body.txtName,
  profilePic:`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
}).then(()=>{
//  console.log("Document written with ID: ", docRef.id);
console.log("Successfully Updated user details");
}).catch((error)=>{

});

/*bucket.upload(originalname, {
    destination: "firstman.jpg",
    public: true,
    metadata: { contentType: mimetype,cacheControl: 'no-cache'}
}, function (err, file) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(createPublicFileURL(uploadTo));
});*/




    //   var task = saveImage(file, newPostKey + '_poster', imagesRef)
   //     task.then(function(snapshot){
   //         movie.poster = task.snapshot.downloadURL;
   //         done(movie, newPostKey);
   //       })
   //       .catch(function(error){
   //         console.error(error)
   //         done(movie, newPostKey);
   //       });
   //   } else {
   //     done(movie, newPostKey);
   //   }
   // }



// db.collection("user").doc("l").set({
//   name: req.body.name
// }).then(()=>{
// //  console.log("Document written with ID: ", docRef.id);
// }).catch((error)=>{
//
// });

res.redirect("/dashboard");

});


function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;

}


module.exports= router;
