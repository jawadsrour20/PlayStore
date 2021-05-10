if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
const express = require('express');
const bodyParser = require('body-parser')
var mysql = require('mysql');
var bcrypt = require('bcrypt'); // allows for hashing password for security
const path = require('path');
const app = express();
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
var RememberMeStrategy = require("passport-remember-me").Strategy;


// connect to MySQL database
var connection = mysql.createConnection({
    host: "localhost", // or 127.0.0.1 
    user: "root",
    password: "12345678",
    database: "DOWNLOADABLE",
    insecureAuth : true
});
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});



/*---------------------------- Remember me cookie Start --------------------------------*/
var tokens = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
  tokens[token] = uid;
  return fn();
}

// Remember Me cookie strategy
//   This strategy consumes a remember me token, supplying the user the
//   token was originally issued to.  The token is single-use, so a new
//   token is then issued to replace it.
passport.use(new RememberMeStrategy(
    function(token, done) {
      consumeRememberMeToken(token, function(err, uid) {
        if (err) { return done(err); }
        if (!uid) { return done(null, false); }
        
        findById(uid, function(err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user);
        });
      });
    },
    issueToken
  ));
  
  function issueToken(user, done) {
    var token = utils.randomString(64);
    saveRememberMeToken(token, user.id, function(err) {
      if (err) { return done(err); }
      return done(null, token);
    });
  }
  
/*---------------------------- Remember me cookie End --------------------------------*/





/*---------------------------- Authenticate Users Session Start --------------------------------*/
//  Promise function Reference  
// https://stackoverflow.com/questions/31875621/how-to-properly-return-a-result-from-mysql-with-node
// Promise used to get the result of the query since the callback causes a local variable issue
var users;
getUsers = function(){
    return new Promise(function(resolve, reject){
      connection.query(
          "SELECT * FROM Users", 
          function(err, rows){                                                
              if(rows === undefined){
                  reject(new Error("Error rows is undefined"));
              }else{
                  users = rows
                  resolve(rows);
              }
          }
      )}
  )}
  const initializePassport = require('./passport-config')

getUsers().then(users => { 

    initializePassport(
        passport,
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id)
      )


});
/*---------------------------- Authenticate Users Session End --------------------------------*/


var username = "";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
// methodOverride is to let logout function properly
// since it needs a delete rout + form in ejs
// but form has no delete method,
// so we override POST method of the form in ejs
app.use(methodOverride('_method'))





// set JS files in public to be usable and visible to client
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

// use ejs template engine
app.set('view engine', 'ejs');

app.get('/', checkNotAuthenticated, (req, res) => {res.redirect('/login')})

app.get('/home', checkAuthenticated, (req,res)=>{


    connection.query("SELECT * FROM DOWNLOADABLE.Downloadable;", (err, results, fields) => {
        if (err) {
            throw err;
        }
        
        

        res.render('home', {data : {
                username : username
            },
            homeApps : results,
            photo : req.user.image,
            name : req.user.username,
        });

        
            
        
    })
});



app.get('/login', checkNotAuthenticated, (req,res)=>{
    res.render('login', {data : {
        fail : false},
        newUser : null,
        newPassword : null,
        });
});


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  }),
  function(req, res, next) {

    if (!req.body.remember_me) { return next(); }
    
    // Issue a remember me cookie if the option was checked
    issueToken(req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
  }
);


app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register', {errorString : null});
})

app.post('/register', checkNotAuthenticated ,async (req, res)=>{

    try {
        username = req.body.username;
        password = req.body.password;
        let isSubscribed = req.body.isSubscribed;
        console.log(isSubscribed);
        let hashedPassword = await bcrypt.hash(password, 10);
        profile = req.body.profile;
        dateOfBirth = req.body.dateofbirth;
        confirmedPassword = req.body.confirmedPassword;
        email = req.body.email;

        let error = "Passwords do not match!";
        if (password !== confirmedPassword)
        {
    
            res.render('register', {errorString: error})
        }
        else
        {   
            if (isSubscribed === "on")
            {
            let record = [username, hashedPassword, profile, dateOfBirth, email, 1]
            connection.query('INSERT INTO Users(username, password, image, birthDate, email, isSubscribed) VALUES (?)', [record], (err, results, fields) =>{
                if (err) throw err;
                else
                {
                    var users;
getUsers = function(){
    return new Promise(function(resolve, reject){
      connection.query(
          "SELECT * FROM Users", 
          function(err, rows){                                                
              if(rows === undefined){
                  reject(new Error("Error rows is undefined"));
              }else{
                  users = rows
                  resolve(rows);
              }
          }
      )}
  )}
  const initializePassport = require('./passport-config')

getUsers().then(users => { 

    initializePassport(
        passport,
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id)
      )


});
                    res.render('login', {data : {fail : false},
                        newUser : true,
                        username : username,
                        newPassword : null
                        });
                }
    
            } )
            }
            else
            { let record = [username, hashedPassword, profile, dateOfBirth, email, 0]
            connection.query('INSERT INTO Users(username, password, image, birthDate, email, isSubscribed) VALUES (?)', [record], (err, results, fields) =>{
                if (err) throw err;
                else
                {
                    var users;
getUsers = function(){
    return new Promise(function(resolve, reject){
      connection.query(
          "SELECT * FROM Users", 
          function(err, rows){                                                
              if(rows === undefined){
                  reject(new Error("Error rows is undefined"));
              }else{
                  users = rows
                  resolve(rows);
              }
          }
      )}
  )}
  const initializePassport = require('./passport-config')

getUsers().then(users => { 

    initializePassport(
        passport,
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id)
      )


});
                    res.render('login', {data : {fail : false},
                        newUser : true,
                        username : username,
                        newPassword : null
                        });
                }
    
            } )
            }

            

        }
        

    }
    catch(err) { console.log(err.message)}
    finally {}

 
});

app.delete('/logout', checkAuthenticated,(req,res)=>{

    res.clearCookie('remember_me');
    req.logOut()
    // render logout page which redirects to login page in 5 seconds
    // alternative was simply to res.redirect('/login')
    res.render('logout')
});

app.get('/forgot', checkNotAuthenticated, (req, res) => {

    res.render('forgot', {isValid : null});
})

app.post('/forgot', checkNotAuthenticated, async (req, res) => {

    username = req.body.username;
    birthDate = req.body.dateofbirth;
    newPassword = req.body.password;
    confirmedPassword = req.body.confirmedPassword;
    let hashedPassword = await bcrypt.hash(newPassword, 10);

    if (newPassword !== confirmedPassword)
    {
        res.render("forgot", {isValid : false})
    }

    connection.query('SELECT * FROM Users WHERE username=\"' + username + "\" AND birthDate=\"" + birthDate +"\"", (err, results, fields) =>{
        
        if (err) throw err;
        if (results.length === 0)
            {
                res.render("forgot", {isValid : false})
            }
        else
        {
            connection.query("UPDATE Users SET password=\""+hashedPassword+"\" WHERE username=\""+username+"\"",  (err, results, fields) =>{ 
                 if (err) throw err;

                 res.render('login', {data : {
        fail : false},
        newUser : null,
        newPassword : true,
        username : username, 
        }
        )})
        }
     } )

})

app.get('/apps', checkAuthenticated, (req, res)=> {

    connection.query("SELECT * FROM DOWNLOADABLE.Downloadable;", (err, results, fields) => {
        if (err) {
            throw err;
        }
        
        let countFree = 0;
        let countPopular = 0;
        let countPaid = 0;

        let freeApps = [];
        let paidApps = [];
        let popularApps = [];
        for(var i=0; i<results.length;i++)
            {
                if (results[i].price === "free" && countFree < 10)
                { 
                    freeApps.push(results[i]);
                    countFree++;

                }
                 if (results[i].price !== "free" && countPaid < 10)
                { 
                    paidApps.push(results[i]);
                    countPaid++;

                }
                 if (results[i].averageRating >= 3.5 && countPopular < 10)
                { 
                    popularApps.push(results[i]);
                    countPopular++;

                }

            }


        res.render('apps', {
            freeApps : freeApps,
            paidApps : paidApps,
            popularApps : popularApps, 
            photo : req.user.image,
            
        });
            
        
    })
})

app.get('/apps/free', checkAuthenticated, (req, res) => {

     connection.query("SELECT * FROM DOWNLOADABLE.Downloadable;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let freeApps = [];
        for(var i=0; i<results.length;i++)
        {
            if (results[i].price === "free") freeApps.push(results[i]);
        }


        res.render('allApps', {
            apps : freeApps,
            photo : req.user.image,
            route : "free",
   
        });
            
        
    })
})

app.get('/apps/paid', checkAuthenticated, (req, res) => {

     connection.query("SELECT * FROM DOWNLOADABLE.Downloadable;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let paidApps = [];
        for(var i=0; i<results.length;i++)
        {
            if (results[i].price !== "free") paidApps.push(results[i]);
        }


        res.render('allApps', {  apps : paidApps, photo : req.user.image, route : "paid"   });
            
        
    })
})

app.get('/apps/popular', checkAuthenticated, (req, res) => {

     connection.query("SELECT * FROM DOWNLOADABLE.Downloadable;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let popularApps = [];
        for(var i=0; i<results.length;i++)
        {
            if (results[i].averageRating >= 3.5) popularApps.push(results[i]);
        }


        res.render('allApps', {
            apps : popularApps,
            photo : req.user.image,
            route : "popular",
   
        });
            
        
    })
})


app.get('/games', checkAuthenticated, (req, res) =>  

    {
        connection.query("SELECT * FROM DOWNLOADABLE.Downloadable WHERE isGame=true;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let kids = [];
        let adventure = [];
        let family = [];
        let topRated = [];
        let topPaid = [];

        let countKids = 0;
        let countAdventure = 0;
        let countFamily = 0;
        let countTopRated = 0;
        let countTopPaid = 0;

        for(var i=0; i<results.length;i++)
        {
            if (results[i].gameGenre === "adventure" && countAdventure < 10) 
            {
                adventure.push(results[i]);
                countAdventure++
            }
            if (results[i].gameGenre === "kids" && countKids < 10)
            { 
                kids.push(results[i]);
                countKids++;


            }
            if (results[i].gameGenre === "top" && countTopRated < 10)
            { 
                topRated.push(results[i]);
                countTopRated++;

            }
            if (results[i].gameGenre === "family" && countFamily < 10) 
            {
                family.push(results[i]);
                countFamily++;
            }

            if (results[i].price !== "free" && countTopPaid < 10) 
            {
                topPaid.push(results[i]);
                countTopPaid++;
            }
        }


        res.render('games', {
            kids : kids,
            adventure : adventure,
            family : family,
            topRated : topRated,
            topPaid : topPaid,
            photo : req.user.image,
   
       } );
        })})

    


app.get('/games/kids', checkAuthenticated, (req, res) => {


        connection.query("SELECT * FROM DOWNLOADABLE.Downloadable WHERE isGame=true;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let kids = [];
       
        for(var i=0; i<results.length;i++)
        {

            if (results[i].gameGenre === "kids") kids.push(results[i]);
        }


        res.render('allApps', {
            apps : kids,
            photo : req.user.image,
            route : "kids",
   
} );
        })})

app.get('/games/adventure', checkAuthenticated, (req, res)  => {


        connection.query("SELECT * FROM DOWNLOADABLE.Downloadable WHERE isGame=true;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let adventure = [];
       
        for(var i=0; i<results.length;i++)
        {

            if (results[i].gameGenre === "adventure") adventure.push(results[i]);
        }


        res.render('allApps', {
            apps : adventure,
            photo : req.user.image, 
            route : "adventure",
   
    } );
        })})

app.get('/games/family', checkAuthenticated, (req, res)  => {


        connection.query("SELECT * FROM DOWNLOADABLE.Downloadable WHERE isGame=true;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let family = [];
       
        for(var i=0; i<results.length;i++)
        {

            if (results[i].gameGenre === "family") family.push(results[i]);
        }


        res.render('allApps', {
            apps : family,
            photo : req.user.image,
            route : "family",
   
     } );
        })})


app.get('/games/topRated', checkAuthenticated, (req, res)  => 


        
        {


        connection.query("SELECT * FROM DOWNLOADABLE.Downloadable WHERE isGame=true;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let topRated = [];
       
        for(var i=0; i<results.length;i++)
        {

            if (results[i].gameGenre === "top") topRated.push(results[i]);
        }


        res.render('allApps', { apps : topRated, photo : req.user.image,  route : "topRated", } );
        })})
        

app.get('/games/topPaid', checkAuthenticated, (req, res)  => 


        
        {


        connection.query("SELECT * FROM DOWNLOADABLE.Downloadable WHERE isGame=true;", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let topPaid = [];
       
        for(var i=0; i<results.length;i++)
        {

            if (results[i].price !== "free") topPaid.push(results[i]);
        }


        res.render('allApps', { apps : topPaid,    photo : req.user.image,  route : "topPaid", } );
        })})
        


app.get('/books', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Books", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let newReleases = []; // past 3 months
        let topSellersUnderTenDollars = []; // price <10$ and rating >=3
        let audioBooks = []; // isAudioBook is True
        let bestOf2019 = []; // DateAdded is 2019 and rating >= 3

        let countNewReleases = 0;
        let countTopunderTenDollars = 0;
        let countAudioBooks = 0;
        let countBestOf2019 = 0;
        let addedYear, addedMonth;
        let dateString;
        // let d = new Date(results[0].DateAdded)
        // console.log(results[0].DateAdded.toString().split(" "))
        
        let today = new Date();
        let currentYear = parseInt(today.getFullYear());
        let currentMonth = parseInt(today.getMonth() + 1);
        
        for(var i=0;i<results.length;i++)
        {

            dateString = results[i].DateAdded.toString().split(" ");
            addedYear = parseInt(dateString[3]);
            addedMonth = parseInt(dateString[2]);
            

            

            // new Releases
            if (addedYear === currentYear && (currentMonth - addedMonth) <= 3 && results[i].isAudioBook === 0 && countNewReleases < 10)
            {
                newReleases.push(results[i]);
                countNewReleases++;
            }

            if (addedYear == 2019 && results[i].averageRating >= 3 && results[i].isAudioBook === 0 && countBestOf2019 < 10)
            {
                bestOf2019.push(results[i]);
                countBestOf2019++;
            }

            // top sellers under 10$
            if(results[i].price !== "free")
                if(parseFloat(results[i].price) < 10 && results[i].averageRating >= 3 && results[i].isAudioBook === 0 && countTopunderTenDollars < 10) {
                    topSellersUnderTenDollars.push(results[i]);
                    countTopunderTenDollars++;
                }

            // audio books
            if( results[i].isAudioBook == 1 && countAudioBooks < 10)
            {
                audioBooks.push(results[i]);
                countAudioBooks++;
            }

        }   

           res.render('books', {
            newReleases : newReleases,
            topSellersUnderTenDollars : topSellersUnderTenDollars,
            audioBooks : audioBooks,
            bestOf2019 : bestOf2019,
            photo : req.user.image,
   
       } );

        
    })


})


app.get('/books/newReleases', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Books", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let newReleases = []; // past 3 months
   
        let addedYear, addedMonth;
        let dateString;
        // let d = new Date(results[0].DateAdded)
        // console.log(results[0].DateAdded.toString().split(" "))
        
        let today = new Date();
        let currentYear = parseInt(today.getFullYear());
        let currentMonth = parseInt(today.getMonth() + 1);
        
        for(var i=0;i<results.length;i++)
        {

            dateString = results[i].DateAdded.toString().split(" ");
            addedYear = parseInt(dateString[3]);
            addedMonth = parseInt(dateString[2]);
            

            

            // new Releases
            if (addedYear === currentYear && (currentMonth - addedMonth) <= 3  && results[i].isAudioBook === 0)
            {
                newReleases.push(results[i]);
                
            }


        }   

           res.render('allBooks', {
            apps : newReleases,
            photo : req.user.image,
            route : "newReleases",
   
       } );

        
    })


})


app.get('/books/topSellersUnderTen', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Books", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let topSellersUnderTenDollars = []; // price <10$ and rating >=3
    
        for(var i=0;i<results.length;i++)
        {
            // top sellers under 10$
            if(results[i].price !== "free")
                if(parseFloat(results[i].price) < 10 && results[i].averageRating >= 3 && results[i].isAudioBook === 0) {
                    topSellersUnderTenDollars.push(results[i]);
                }
        }   
    res.render('allBooks', {
            apps : topSellersUnderTenDollars,
            photo : req.user.image,
            route : "topSellersUnderTen",
       } );

        
    })


})

app.get('/books/bestof2019', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Books", (err, results, fields) => {
        if (err) {
            throw err;
        }


        let bestOf2019 = []; // DateAdded is 2019 and rating >= 3

        let addedYear, addedMonth;
        let dateString;
        // let d = new Date(results[0].DateAdded)
        // console.log(results[0].DateAdded.toString().split(" "))
        
        let today = new Date();
        let currentYear = parseInt(today.getFullYear());
        let currentMonth = parseInt(today.getMonth() + 1);
        
        for(var i=0;i<results.length;i++)
        {

            dateString = results[i].DateAdded.toString().split(" ");
            addedYear = parseInt(dateString[3]);
            addedMonth = parseInt(dateString[2]);
            

  

            if (addedYear == 2019 && results[i].averageRating >= 3 && results[i].isAudioBook === 0)
            {
                bestOf2019.push(results[i]);
            }


        }   

           res.render('allBooks', {
            apps : bestOf2019,
            photo : req.user.image,
            route : "bestof2019",
   
       } );

        
    })


})


app.get('/books/audiobooks', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Books", (err, results, fields) => {
        if (err) {
            throw err;
        }


        let audioBooks = []; // isAudioBook is True



        
        for(var i=0;i<results.length;i++)
        {

            dateString = results[i].DateAdded.toString().split(" ");
            addedYear = parseInt(dateString[3]);
            addedMonth = parseInt(dateString[2]);
            


            // audio books
            if( results[i].isAudioBook == 1)
            {
                audioBooks.push(results[i]);

            }

        }   

           res.render('allAudioBooks', {
            apps : audioBooks,
            photo : req.user.image,
   
       } );

        
    })


})




app.get('/movies', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Movies", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let mostPopular = [];
        let recommendedForYou = []; 
        let dealsOfTheWeek = []; 
        let actionMovies = [];

        let countMostPopular = 0;
        let countRecommended = 0;
        let countDeals = 0;
        let countActionMovies = 0;


        for(var i=0;i<results.length;i++)
        {
            if(results[i].rating >= 4 && countMostPopular < 10)
            {
                mostPopular.push(results[i]);
                countMostPopular++;
            }
            if(results[i].rating < 4.6 && parseInt(results[i].releaseDate) > 2005 
            && countRecommended < 10)
            {
                recommendedForYou.push(results[i]);
                countRecommended++;
            }
            if(results[i].price < 13.00 && countDeals < 10)
            {
                dealsOfTheWeek.push(results[i]);
                countDeals++;
            }
            if(results[i].category === "Action" && countActionMovies < 10)
            {
                actionMovies.push(results[i]);
                countActionMovies++;
            }


        }   

           res.render('movieZ', {
            mostPopular : mostPopular,
            recommendedForYou : recommendedForYou,
            dealsOfTheWeek : dealsOfTheWeek,
            actionMovies : actionMovies,
            photo : req.user.image,
       } );

        
    })
});

app.get('/movies/popular', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Movies", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let mostPopular = [];
       


        for(var i=0;i<results.length;i++)
        {
            if(results[i].rating >= 4)
            
                mostPopular.push(results[i]);


        }   

           res.render('allMovies', {
            apps : mostPopular,
            photo : req.user.image,
            route : "popular",
       } );

        
    })
});


app.get('/movies/recommended', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Movies", (err, results, fields) => {
        if (err) {
            throw err;
        }


        let recommendedForYou = []; 


        for(var i=0;i<results.length;i++)
        {
           
            if(results[i].rating < 4.6 && parseInt(results[i].releaseDate) > 2005)
        
                recommendedForYou.push(results[i]);
                
     


        }   

           res.render('allMovies', {
            apps : recommendedForYou,
            route : "recommended",
            photo : req.user.image,
       } );

        
    })
});


app.get('/movies/deals', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Movies", (err, results, fields) => {
        if (err) {
            throw err;
        }

        // console.log(results.length);
  
        let dealsOfTheWeek = []; 


        let countDeals = 0;



        for(var i=0;i<results.length;i++)
        {
            
            if(results[i].price < 13.00)
            {
                dealsOfTheWeek.push(results[i]);
    
            }
   


        }   

           res.render('allMovies', {

            apps : dealsOfTheWeek,
            route : "deals",
            photo : req.user.image,
       } );

        
    })
});


app.get('/movies/action', checkAuthenticated, (req, res) => {

    connection.query("SELECT * FROM Movies", (err, results, fields) => {
        if (err) {
            throw err;
        }

        let actionMovies = [];



        for(var i=0;i<results.length;i++)
        {
          
            if(results[i].category === "Action")
            
              actionMovies.push(results[i]);
              

        }   

           res.render('allMovies', {
       
            apps : actionMovies,
            route : "action",
            photo : req.user.image,
       } );

        
    })
});


app.get('/wishlist', checkAuthenticated, (req, res) => {

// console.log(req.user.id);

// console.log("123");
// console.log(name);
// console.log(genre);
// console.log(path);
// console.log(description);
// console.log(price);
console.log("234");

console.log(req.user.id);

    connection.query("SELECT * FROM Wishlist where userID=\""+req.user.id+"\"", (err, results) => {

        res.render('wishlist', {
       
            items : results,
            name : req.user.username,
            photo : req.user.image
       } );
    })

});
    
 




app.delete('/wishlist/:id', checkAuthenticated, (req, res) =>{

    // console.log("orderID is = "+ req.params.id);

    connection.query("DELETE FROM Wishlist where orderID="+req.params.id, (err, results)=>{
            
        if(err) throw err;

        res.redirect('/wishlist');

    })

})



app.post('/wishlist/:name/:genre/:path/:price', checkAuthenticated, (req, res) => {

        let tempID = req.user.id;
        let itemName = req.params.name;
        let genre = req.params.genre;
        let tempPath = req.params.path;
        let description = "This is amazing, you will love it";
        let price = req.params.price;
        
        let record = [tempID, itemName, genre, tempPath, description, price]
        connection.query("INSERT INTO Wishlist (userID, name, genre, path, description, price) VALUES (?)", [record], (err, results) =>
        {
            if (err) throw err;

            res.redirect('../../../../wishlist')
        } )



  
})


// app.post('/wishlistP', checkAuthenticated, (req, res) => {

// var name = req.body.name;
// var genre = req.body.genre;
// var path = req.body.path;
// var description = req.body.description;
// var price = req.body.price;

// name = name.substring(0, name.length-1);
// genre = genre.substring(0, genre.length-1);
// path = path.substring(0, path.length-1);
// description = description.substring(0, description.length-1);
// price = price.substring(0, price.length-1);


// connection.query("INSERT INTO `Wishlist` (`userID`, `name`, `genre`, `path`, `description`) VALUES ('12', '" + name + "', '" + genre + "', '" + path + "', '" + description + "');");

// res.redirect('/wishlist');

  
// })


app.post('/search', checkAuthenticated, (req, res) => {

    let searchKey = req.body.searchKey;
    connection.query("SELECT * FROM searching where name=\""+searchKey+"\" OR description=\'"+searchKey+'\'', (err, results) =>{

        if (err) throw err;
        let games = [];
        let apps = [];
        let movies = [];
        let books = [];
        
        for(var i=0;i<results.length;i++)
        {
            if(results[i].genre === "application" && results[i].isGame === 0)
            {
                apps.push(results[i])
            }
            if(results[i].genre === "application" && results[i].isGame === 1)
            {
                games.push(results[i])
            }
            if(results[i].genre === "movies")
            {
                movies.push(results[i])
            }
            if(results[i].genre === "books")
            {
                books.push(results[i])
            }
            
        }

        res.render('search', {games : games, movies : movies, apps : apps, books : books, photo : req.user.image, } )
    })
})

app.get('/download/:name', checkAuthenticated, function (req, res) {
   var name = req.params.name;
//    console.log(name)
    
    var sql = "SELECT * FROM Downloadable WHERE path = '" + name  + "';";



    connection.query(sql, (err, results) => {


            
  
        var tempName=results[0].name, 
            tempGenre=results[0].genre, 
            tempPath=results[0].path,
            tempDescription=results[0].description,
            tempPrice=results[0].price;

        if (err) {
            throw err;
        }
        var id = results[0].id;
        var title = results[0].title;
        var averageDownloadableRating = results[0].averageRating;
        var genre = results[0].genre;
        var price = results[0].price;
        var description = results[0].description;
        var path = results[0].path;
        
        var items = results;

        var averageRating = 0;
        
        var oneStar = 0;
        var twoStar = 0;
        var threeStar = 0;
        var fourStar = 0;
        var fiveStar = 0;
        
        var oneStarPercentage = 0;
        var twoStarPercentage = 0;
        var threeStarPercentage = 0;
        var fourStarPercentage = 0;
        var fiveStarPercentage = 0;
        
        var idArray = [];
        var reviewersArray = [];
        var reviewsArray = [];
        var numberOfLikesArray = [];
        var numberOfReportsArray = [];
        var ratingArray = []
        
        name = name.substring(0, name.length-4);
        var sql = "SELECT id, rating FROM Reviews WHERE downloadable = '" + name + "';";

        connection.query(sql, (err, results) => {
            if (err) {
                throw err;
            }
            
//            console.log(results[2].rating)
            var numberOfRatings = results.length;
            
            
            
            
            for (let i = 0; i < numberOfRatings; i++) {
                averageRating += results[i].rating;
                
                switch (results[i].rating) {
                    case 1:
                        oneStar++;
                        break;
                    case 2:
                        twoStar++;
                        break;
                    case 3:
                        threeStar++;
                        break;
                    case 4:
                        fourStar++;
                        break;
                    case 5:
                        fiveStar++;
                        break;
                    default:
                        oneStar = 0;
                        twoStar = 0;
                        threeStar = 0;
                        fourStar = 0;
                        fiveStar = 0;
                }
            }
            

//            console.log(averageRating)
            averageRating /= numberOfRatings;
            averageRating = Math.round(averageRating * 10) / 10;
//            console.log(averageRating)
//            console.log(numberOfRatings)

            oneStarPercentage = Math.round((oneStar/numberOfRatings) * 100);
            twoStarPercentage = Math.round((twoStar/numberOfRatings) * 100);
            threeStarPercentage = Math.round((threeStar/numberOfRatings) * 100);
            fourStarPercentage = Math.round((fourStar/numberOfRatings) * 100);
            fiveStarPercentage = Math.round((fiveStar/numberOfRatings) * 100);
            
            
//            console.log(oneStarPercentage)
//            console.log(twoStarPercentage)
//            console.log(threeStarPercentage)
//            console.log(fourStarPercentage)
//            console.log(fiveStarPercentage)
            
            console.log(name);
            var sql = "SELECT * FROM Reviews WHERE downloadable = '" + name +"';";

            connection.query(sql, (err, results) => {
                if (err) {
                    throw err;
                }
                
//                console.log(results[0].review)
                
                console.log(results.length)
                
                for (let i = 0; i < results.length; i++) {
                    idArray.push(results[i].id);
                    reviewersArray.push(results[i].reviewer);
                    reviewsArray.push(results[i].review);
                    numberOfLikesArray.push(results[i].numberOfLikes);
                    numberOfReportsArray.push(results[i].numberOfReports);
                    ratingArray.push(results[i].rating);
                }
                
//                console.log(idArray)
//                console.log(reviewersArray)
//                console.log(reviewsArray)
//                console.log(numberOfLikesArray)
//                console.log(numberOfReportsArray)
//                console.log(ratingArray)


            
          
                res.render('download', {data : {
                    id : id,
                    name : name,
                    title : title,
                    averageDownloadableRating : averageDownloadableRating,
                    genre : genre,
                    price : price,
                    description : description,
                    averageRating : averageRating,
                    numberOfRatings : numberOfRatings,
                    oneStar : oneStar,
                    twoStar : twoStar,
                    threeStar : threeStar,
                    fourStar : fourStar,
                    fiveStar : fiveStar,
                    oneStarPercentage: oneStarPercentage,
                    twoStarPercentage : twoStarPercentage,
                    threeStarPercentage : threeStarPercentage,
                    fourStarPercentage : fourStarPercentage,
                    fiveStarPercentage : fiveStarPercentage,
                    idArray : idArray,
                    reviewersArray : reviewersArray,
                    reviewsArray : reviewsArray,
                    numberOfLikesArray : numberOfLikesArray,
                    numberOfReportsArray : numberOfReportsArray,
                    ratingArray : ratingArray, 
                    photo : req.user.image,
                    path : path
                },
                // for pics
                items : items, 
                name : name,
                tempName :tempName ,
                tempGenre : tempGenre,
                tempPath :tempPath ,
                tempDescription :tempDescription,
                tempPrice : tempPrice,},
                // for pics
            );
            
            })
            
            
            

        });
        
        
        
        
        
        
    })
    
    
    
    
    
});


app.get('/movies/:name', checkAuthenticated, function (req, res) {
    var name = req.params.name;
 
     var id = 0;
     var movieName = "";
     var category = "";
     var releaseDate = "";
     var duration = "";
     var rating = 0;
     var numberOfRatings = 0;
     var price = 0;
     var description = "";
     var actors = "";
     var producers = "";
     var writers = "";
     var director = "";
     var path = "";
 
     var averageRating = 0;
 
     var oneStar = 0;
     var twoStar = 0;
     var threeStar = 0;
     var fourStar = 0;
     var fiveStar = 0;
 
 
 
     var idArray = [];
     var reviewersArray = [];
     var reviewsArray = [];
     var numberOfLikesArray = [];
     var numberOfReportsArray = [];
     var ratingArray = []
 
     var trailerID = ""
 
 
     var sql = "SELECT * FROM DOWNLOADABLE.Movies WHERE path = '" + name + "';";
 
     connection.query(sql, (err, results) => {

         if (err) {
             throw err;
         }


         var tempName=results[0].name, 
         tempGenre=results[0].genre, 
         tempPath=results[0].path,
         tempDescription=results[0].description,
         tempPrice=results[0].price;

 
         console.log(results[0].trailerID);
 
         movieName = results[0].movieName;
         category = results[0].category;
         releaseDate = results[0].releaseDate;
         duration = results[0].duration;
         rating = results[0].rating;
         numberOfRatings = results[0].numberOfRatings;
         price = results[0].price;
         description = results[0].description;
         actors = results[0].actors;
         producers = results[0].producers;
         writers = results[0].writers;
         director = results[0].director;
         trailerID = results[0].trailerID;
         path = results[0].path;

 
 
     name = name.substring(0, name.length-4);
      var sql = "SELECT id, rating FROM Reviews WHERE downloadable = '" + name + "';";
 
         connection.query(sql, (err, results) => {
             if (err) {
                 throw err;
             }
             
 //            console.log(results[2].rating)
             var numberOfRatings = results.length;
             
             
             
             
             for (let i = 0; i < numberOfRatings; i++) {
                 averageRating += results[i].rating;
                 
                 switch (results[i].rating) {
                     case 1:
                         oneStar++;
                         break;
                     case 2:
                         twoStar++;
                         break;
                     case 3:
                         threeStar++;
                         break;
                     case 4:
                         fourStar++;
                         break;
                     case 5:
                         fiveStar++;
                         break;
                     default:
                         oneStar = 0;
                         twoStar = 0;
                         threeStar = 0;
                         fourStar = 0;
                         fiveStar = 0;
                 }
             }
             
 
            // console.log(averageRating)
             averageRating /= numberOfRatings;
             averageRating = Math.round(averageRating * 10) / 10;
            console.log(averageRating)
 //            console.log(numberOfRatings)
 
             oneStarPercentage = Math.round((oneStar/numberOfRatings) * 100);
             twoStarPercentage = Math.round((twoStar/numberOfRatings) * 100);
             threeStarPercentage = Math.round((threeStar/numberOfRatings) * 100);
             fourStarPercentage = Math.round((fourStar/numberOfRatings) * 100);
             fiveStarPercentage = Math.round((fiveStar/numberOfRatings) * 100);
             
             
            // console.log(oneStarPercentage)
            // console.log(twoStarPercentage)
            // console.log(threeStarPercentage)
            // console.log(fourStarPercentage)
            // console.log(fiveStarPercentage)
             
             
             var sql = "SELECT * FROM Reviews WHERE downloadable = '" + name +"';";
 
             connection.query(sql, (err, results) => {
                 if (err) {
                     throw err;
                 }
                 
 //                console.log(results[0].review)
                 
                 // console.log(results.length)
                 
                 for (let i = 0; i < results.length; i++) {
                     idArray.push(results[i].id);
                     reviewersArray.push(results[i].reviewer);
                     reviewsArray.push(results[i].review);
                     numberOfLikesArray.push(results[i].numberOfLikes);
                     numberOfReportsArray.push(results[i].numberOfReports);
                     ratingArray.push(results[i].rating);
                 }
                 
                // console.log(idArray)
                // console.log(reviewersArray)
                // console.log(reviewsArray)
                // console.log(numberOfLikesArray)
                // console.log(numberOfReportsArray)
                // console.log(ratingArray)
 
                 // console.log(averageRating)
 
 
                 res.render('movies', {data : {
                     id : id,
                     name : name,
                     movieName : movieName,
                     category : category,
                     releaseDate : releaseDate,
                     duration : duration,
                     rating : rating,
                     numberOfRatings : numberOfRatings,
                     averageRating : averageRating,
                     oneStar : oneStar,
                     twoStar : twoStar,
                     threeStar : threeStar,
                     fourStar : fourStar,
                     fiveStar : fiveStar,
                     oneStarPercentage: oneStarPercentage,
                     twoStarPercentage : twoStarPercentage,
                     threeStarPercentage : threeStarPercentage,
                     fourStarPercentage : fourStarPercentage,
                     fiveStarPercentage : fiveStarPercentage,
                     price : price,
                     description : description,
                     actors : actors,
                     producers : producers,
                     writers : writers,
                     director : director,
                     idArray : idArray,
                     reviewersArray : reviewersArray,
                     reviewsArray : reviewsArray,
                     numberOfLikesArray : numberOfLikesArray,
                     numberOfReportsArray : numberOfReportsArray,
                     ratingArray : ratingArray,
                     trailerID : trailerID,
                     path : path
                  
 
                    
                 },    photo : req.user.image,tempName :tempName ,
                tempGenre : tempGenre,
                tempPath :tempPath ,
                tempDescription :tempDescription,
                tempPrice : tempPrice,});
 
             });
 
 
         
          });
     });
 });





    app.get('/no/:name', checkAuthenticated, function (req, res) {
    var name = req.params.name;
 
     var id = 0;
     var movieName = "";
     var category = "";
     var releaseDate = "";
     var duration = "";
     var rating = 0;
     var numberOfRatings = 0;
     var price = 0;
     var description = "";
     var actors = "";
     var producers = "";
     var writers = "";
     var director = "";
     var path = "";
 
     var averageRating = 0;
 
     var oneStar = 0;
     var twoStar = 0;
     var threeStar = 0;
     var fourStar = 0;
     var fiveStar = 0;
 
 
 
     var idArray = [];
     var reviewersArray = [];
     var reviewsArray = [];
     var numberOfLikesArray = [];
     var numberOfReportsArray = [];
     var ratingArray = []
 
     var trailerID = ""
 
 
     var sql = "SELECT * FROM DOWNLOADABLE.Movies WHERE path = '" + name + "';";
 
     connection.query(sql, (err, results) => {
         if (err) {
             throw err;
         }
 
         console.log(results[0].trailerID);
 
         movieName = results[0].movieName;
         category = results[0].category;
         releaseDate = results[0].releaseDate;
         duration = results[0].duration;
         rating = results[0].rating;
         numberOfRatings = results[0].numberOfRatings;
         price = results[0].price;
         description = results[0].description;
         actors = results[0].actors;
         producers = results[0].producers;
         writers = results[0].writers;
         director = results[0].director;
         trailerID = results[0].trailerID;
         path = results[0].path;

 
 
     name = name.substring(0, name.length-4);
      var sql = "SELECT id, rating FROM Reviews WHERE downloadable = '" + name + "';";
 
         connection.query(sql, (err, results) => {
             if (err) {
                 throw err;
             }
             
 //            console.log(results[2].rating)
             var numberOfRatings = results.length;
             
             
             
             
             for (let i = 0; i < numberOfRatings; i++) {
                 averageRating += results[i].rating;
                 
                 switch (results[i].rating) {
                     case 1:
                         oneStar++;
                         break;
                     case 2:
                         twoStar++;
                         break;
                     case 3:
                         threeStar++;
                         break;
                     case 4:
                         fourStar++;
                         break;
                     case 5:
                         fiveStar++;
                         break;
                     default:
                         oneStar = 0;
                         twoStar = 0;
                         threeStar = 0;
                         fourStar = 0;
                         fiveStar = 0;
                 }
             }
             
 
            // console.log(averageRating)
             averageRating /= numberOfRatings;
             averageRating = Math.round(averageRating * 10) / 10;
            console.log(averageRating)
 //            console.log(numberOfRatings)
 
             oneStarPercentage = Math.round((oneStar/numberOfRatings) * 100);
             twoStarPercentage = Math.round((twoStar/numberOfRatings) * 100);
             threeStarPercentage = Math.round((threeStar/numberOfRatings) * 100);
             fourStarPercentage = Math.round((fourStar/numberOfRatings) * 100);
             fiveStarPercentage = Math.round((fiveStar/numberOfRatings) * 100);
             
             
            // console.log(oneStarPercentage)
            // console.log(twoStarPercentage)
            // console.log(threeStarPercentage)
            // console.log(fourStarPercentage)
            // console.log(fiveStarPercentage)
             
             
             var sql = "SELECT * FROM Reviews WHERE downloadable = '" + name +"';";
 
             connection.query(sql, (err, results) => {
                 if (err) {
                     throw err;
                 }
                 
 //                console.log(results[0].review)
                 
                 // console.log(results.length)
                 
                 for (let i = 0; i < results.length; i++) {
                     idArray.push(results[i].id);
                     reviewersArray.push(results[i].reviewer);
                     reviewsArray.push(results[i].review);
                     numberOfLikesArray.push(results[i].numberOfLikes);
                     numberOfReportsArray.push(results[i].numberOfReports);
                     ratingArray.push(results[i].rating);
                 }
                 
                // console.log(idArray)
                // console.log(reviewersArray)
                // console.log(reviewsArray)
                // console.log(numberOfLikesArray)
                // console.log(numberOfReportsArray)
                // console.log(ratingArray)
 
                 // console.log(averageRating)
 
 
                 res.render('no', {data : {
                     id : id,
                     name : name,
                     movieName : movieName,
                     category : category,
                     releaseDate : releaseDate,
                     duration : duration,
                     rating : rating,
                     numberOfRatings : numberOfRatings,
                     averageRating : averageRating,
                     oneStar : oneStar,
                     twoStar : twoStar,
                     threeStar : threeStar,
                     fourStar : fourStar,
                     fiveStar : fiveStar,
                     oneStarPercentage: oneStarPercentage,
                     twoStarPercentage : twoStarPercentage,
                     threeStarPercentage : threeStarPercentage,
                     fourStarPercentage : fourStarPercentage,
                     fiveStarPercentage : fiveStarPercentage,
                     price : price,
                     description : description,
                     actors : actors,
                     producers : producers,
                     writers : writers,
                     director : director,
                     idArray : idArray,
                     reviewersArray : reviewersArray,
                     reviewsArray : reviewsArray,
                     numberOfLikesArray : numberOfLikesArray,
                     numberOfReportsArray : numberOfReportsArray,
                     ratingArray : ratingArray,
                     trailerID : trailerID,
                     path : path
                  
 
                    
                 },    photo : req.user.image,});
 
             });
 
 
         
          });
     });
 });
 
 
 
 
 
 
 app.post('/like', checkAuthenticated, function(req, res){
     
     var likes = req.body.NumberOfLikes;
     var name = req.body.nameLikes;
     console.log("Likes", likes);
 });
 
 app.post('/like/:id/:route/:name', checkAuthenticated, function(req, res){
    var id = req.params.id;
    var category = req.params.route;
    var name = req.params.name;

     var likes = req.body.NumberOfLikes;
     console.log("Likes", likes);


          let sql = "UPDATE `DOWNLOADABLE`.`Reviews` SET `numberOfLikes` = '" + likes + "' WHERE (`id` = '" + id + "');";

               connection.query(sql, (err, results) => {
         if (err) {
             throw err;
         }

         res.redirect('/' + category + '/' + name);
         
     })


 });
 
 
 app.post('/report', checkAuthenticated, function(req, res){
     
    var reports = req.body.NumberOfReports;

    console.log("Reports", reports);
    // let sql = "UPDATE `DOWNLOADABLE`.`Reviews` SET `numberOfLikes` = '" + likes + "' WHERE (`id` = '20');";
    
    // connection.query(sql, (err, results) => {
    //     if (err) {
    //         throw err;
    //     }
        
    //     if (results.length == 1) {
    //         console.log("success!")
    //         res.redirect('/home')
    //     }
    //     else {
    //         console.log("Failure!")
            
    //         res.render('login', {data : {
    //             fail : true}});
    //     }
    // })
});




 function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  // case user is already authenticated (logged-in currently)
  // we want user to not be able to access pages like register
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/home')
    }
    next()
  }


app.listen(8080, () => {
    console.log('listening on port 8080');
})