const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelper')
const userHelper=require('../helpers/userHelper')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log(user);
  productHelper.getAllProducts().then((products)=>{
    res.render('user/viewProduct',{ products,user});
  })

});

router.get('/login',(req,res,next)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render("user/login",{"loginError":req.session.logginError})
    req.session.logginError="";
  }
})
router.get('/signup',(req,res,next)=>{
  res.render("user/signup")
})
router.post('/signup',(req,res,next)=>{
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response);
  })
})
router.post('/login',(req,res,next)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true;
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.logginError="Invalid email or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res,next)=>{
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart',verifyLogin,(req,res,next)=>{
  
  res.render("user/cart")
})


module.exports = router;