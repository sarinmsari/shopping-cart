const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/productHelper");
const userHelper = require("../helpers/userHelper");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then((products) => {
    res.render("user/viewProduct", { products, user, cartCount });
  });
});

router.get("/login", (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginError: req.session.logginError });
    req.session.logginError = "";
  }
});
router.get("/signup", (req, res, next) => {
  res.render("user/signup");
});
router.post("/signup", (req, res, next) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});
router.post("/login", (req, res, next) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.logginError = "Invalid email or password";
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/login");
});
router.get("/cart", verifyLogin, async (req, res, next) => {
  let products = await userHelper.getCartProducts(req.session.user._id);
  let totalValue=await userHelper.getTotalAmount(req.session.user._id);
  console.log(products);
  res.render("user/cart", { products, user: req.session.user._id ,totalValue});
});
router.get("/add-to-cart/:id", (req, res, next) => {
  console.log('api-call');
  userHelper.addtoCart(req.params.id, req.session.user._id).then(() => {
    res.json({status:true})
  });
});
router.post("/change-product-quantity/:id",(req,res,next)=>{
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total= await userHelper.getTotalAmount(req.session.user);

    res.json(response)
  })
});
router.get("/place-order",verifyLogin,async (req,res,next)=>{
  let total= await userHelper.getTotalAmount(req.session.user._id);
  res.render("user/place-order",{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products= await userHelper.getCartProductList(req.body.userId)
  let totalPrice= await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json ({status:true})
  })
  console.log(req.body);
})
router.get("/orders",verifyLogin,async (req,res,next)=>{
  let products = await userHelper.getOrderProducts(req.session.user._id);
  console.log(products);
  res.render('user/orders',{products, user: req.session.user})
})

module.exports = router;
