var express = require('express');
var router = express.Router();
var passport = require('passport');
const async= require('async');
//const storage= require("firebase/storage");
const path= require("path");
const multer= require("multer");
const gcsSharp = require('multer-sharp');
const moment= require("moment");


//am trying to test multer sharp
// simple resize with custom filename
const storage = gcsSharp({
  filename: (req, file, cb) => {
      cb(null, `${req.user.nickname}`);
  },
  bucket: 'examstudent-8fcf6.appspot.com', // Required : bucket name to upload
  projectId: 'examstudent-8fcf6', // Required : Google project ID
  keyFilename: './config/service-account.json', // Optional : JSON credentials file for Google Cloud Storage
  acl: 'publicRead', // Optional : acl credentials file for Google Cloud Storage, 'publicrRead' or 'private', default: 'private'
  size: {
    width: 250,
    height: 250
  },
  max: true,
});
const upload = multer({ storage: storage });

const firebase = require("firebase");


// Initialize Firebase
var config = {
  apiKey: "AIzaSyBfT5uQ5trlR2tO9fLz8sXuLmJgXXo4aUA",
    authDomain: "examstudent-8fcf6.firebaseapp.com",
    databaseURL: "https://examstudent-8fcf6.firebaseio.com",
    projectId: "examstudent-8fcf6",
    storageBucket: "examstudent-8fcf6.appspot.com",
    messagingSenderId: "651513649435"
};
firebase.initializeApp(config);

//var ref = storage.storage();

const admin= require("firebase-admin");





//Configuring google cloud  storageBucket

const keyFilename="../config/service-account.json"; //replace this with api key file
const projectId = "examstudent-8fcf6" //replace with your project id
const bucketName = `${projectId}.appspot.com`;


// Imports the Google Cloud client library
//const {Storage} = require('@google-cloud/storage');

// Creates a client
/*const storage = new Storage({
  apiKey: "AIzaSyBfT5uQ5trlR2tO9fLz8sXuLmJgXXo4aUA",
    authDomain: "examstudent-8fcf6.firebaseapp.com",
    databaseURL: "https://examstudent-8fcf6.firebaseio.com",
    projectId: "examstudent-8fcf6",
    storageBucket: "examstudent-8fcf6.appspot.com",
    messagingSenderId: "651513649435"
});*/

//const bucket = storage.bucket(bucketName);

//Configure google cloud storageBucket


const serviceAccount = require('../config/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://examstudent-8fcf6.firebaseio.com",
  storageBucket: "examstudent-8fcf6.appspot.com"
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
                  profilePic:'https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg',
                  birthday:"Select Birthday"
              };
              callback(null,details);
      //    callback(null,"");
            } else {
             console.log('Document data:', doc.data().fullname);
          var fullname=doc.data().fullname;
        //  var profilePic= doc.data().profilePic;
        if(doc.data().image_url===undefined){
          var profilePic="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"
        }
        else{
          var profilePic=doc.data().image_url
        //  console.log("Firebase profile pic "+profilePic);
        }

          if(doc.data().birthday===undefined){
            var birthday="Select birthday";
          }
          else{
            var year= doc.data().birthday;
            var birthday = moment.unix(year.seconds).format("LL");

          }

        //  var dateTimeString = moment.unix(birthday.seconds).format("Y-M-D");
        // console.log(dateTimeString);
          var nickname=doc.data().nickname;
          var regno=doc.data().regno;
          var phone=doc.data().phone_number;
          var address=doc.data().address;
          var pic=doc.data().pic;
          var bq=doc.data().bq;
          var hobbies=doc.data().hobbies;
    //      var crush=doc.data().crush;
          var email= doc.data().email;
          var fmeal= doc.data().fmeal;

          var details={
            fullname,
            profilePic,
            nickname,
            regno,
            address,
            pic,
            bq,
            hobbies,
            email,
            phone,
            fmeal,
            birthday
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
        res.render("dashboard",{userr:"u14cs1074",imageUrl:details.profilePic,fullname:details.fullname,title:"CS/EX Class of 2018",details});

      }]);



/*var cityRef = db.collection('users').doc(req.user.nickname);

var fullname="meat";



console.log(fullname);*/


//  console.log("This is my username",firebase.auth().currentUser.uid);
});



router.post("/dashboard",upload.single('myPic'),(req,res,next)=>{


  console.log(JSON.stringify(req.file)); // Print upload details

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
  var phone_number;
  var email;
  var fmeal;
  var image_url;
  var birthday;


  var userdetails={
    fullname,
    profilePic
  };


  if(!req.file){
    if(!req.body.txtBirthday){
      db.collection("users").doc(req.user.nickname).set({
        fullname: req.body.txtName,
        regno: req.user.nickname,
        nickname:req.body.txtN,
        address:req.body.txtAddress,
        pic:req.body.txtPIC,
        bq:req.body.txtBest,
        hobbies:req.body.txtHobbies,
        phone_number:req.body.txtPhone,
        fmeal:req.body.txtFmeal,
        email:req.user.emails[0].value

      }).then(()=>{
      //  console.log("Document written with ID: ", docRef.id);
      console.log("Successfully Updated user details");
      }).catch((error)=>{

      });
    }
    else{
      db.collection("users").doc(req.user.nickname).set({
        fullname: req.body.txtName,
        regno: req.user.nickname,
        nickname:req.body.txtN,
        address:req.body.txtAddress,
        pic:req.body.txtPIC,
        bq:req.body.txtBest,
        hobbies:req.body.txtHobbies,
        phone_number:req.body.txtPhone,
        fmeal:req.body.txtFmeal,
        email:req.user.emails[0].value,
        birthday:new Date(req.body.txtBirthday)

      }).then(()=>{
      //  console.log("Document written with ID: ", docRef.id);
      console.log("Successfully Updated user details");
      }).catch((error)=>{

      });
    }

  }

  else{
    if(!req.body.txtBirthday){
      db.collection("users").doc(req.user.nickname).set({
        fullname: req.body.txtName,
        image_url:req.file.path,
        regno: req.user.nickname,
        nickname:req.body.txtN,
        address:req.body.txtAddress,
        pic:req.body.txtPIC,
        bq:req.body.txtBest,
        hobbies:req.body.txtHobbies,
        phone_number:req.body.txtPhone,
          fmeal:req.body.txtFmeal,
        email:req.user.emails[0].value
      }).then(()=>{
      //  console.log("Document written with ID: ", docRef.id);
      console.log("Successfully Updated user details");
      }).catch((error)=>{

      });
    }
    else{
      db.collection("users").doc(req.user.nickname).set({
        fullname: req.body.txtName,
        image_url:req.file.path,
        regno: req.user.nickname,
        nickname:req.body.txtN,
        address:req.body.txtAddress,
        pic:req.body.txtPIC,
        bq:req.body.txtBest,
        hobbies:req.body.txtHobbies,
        phone_number:req.body.txtPhone,
          fmeal:req.body.txtFmeal,
        email:req.user.emails[0].value,
        birthday:new Date(req.body.txtBirthday)
      }).then(()=>{
      //  console.log("Document written with ID: ", docRef.id);
      console.log("Successfully Updated user details");
      }).catch((error)=>{

      });
    }

  }


  // res.send('Successfully uploaded!');
//  var currentUser=firebase.auth().currentUser.uid;

//var file = $('#poster').get(0).files[0];
// console.log(req.files);
// var img= req.body.avatarImg.path;
// console.log(img);

//console.log(req);
/*const file= req.files[0];
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

*/

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
