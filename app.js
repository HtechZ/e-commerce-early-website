const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer");
const session = require("express-session");
const userSchema = require("./models/userSchema")
const productSchema = require("./models/productModel")
const app = express()
app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false
}));

mongoose.connect("mongodb+srv://ZLShop:Sf2CqoDdhCeix5U4@cluster0.domxj3h.mongodb.net/?appName=Cluster0")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({ storage: storage })



app.get("/", async (req, res) => {
    const allProducts = await productSchema.find()
    res.render("index", { allProducts, user: req.user })
})

app.post("/", async (req, res) => {
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {
    const username = req.body.username.toLowerCase()
    const password = req.body.password
    const phoneNumber = req.body.phoneNumber
    try {
        const user = await userSchema.insertOne({ username: username, password: password, phone_number: phoneNumber })
        res.redirect("/")
    } catch {
        res.send(`
        <h1>You must enter both Username and Phone number</h1>
        <h2>You will be redirected in 5 seconds...</h2>

        <script>
            setTimeout(() => {
                window.location.href = "/register";
            }, 5000);
        </script>
    `);
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req, res) => {
    const username = req.body.username.toLowerCase()
    const password = req.body.password
    const user = await userSchema.findOne({ username: username, password: password })
    if (!user) {
        res.send(`<h1>Your Username is incorrect</h1>
            <h2>If you doesn't have and account you can register</h2>
            <h2>You are going to be redirected to login page in 5 seconds</h2>
            <script>
            setTimeout(() => window.location.href("/login"), 5000)
            </script>`)
    }
    req.session.userId = user._id;
    { res.redirect("/") }
})

app.get("/admin/products/new", auth, async (req, res) => {

    if (req.user.role !== "admin") {
        return res.redirect("/");
    } else {
        const allOrders = await userSchema.find({}, { _id: 0 });
        res.render("new-product", { allOrders });


    }
});
app.post("/products", upload.single("image"), async (req, res) => {
    const name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1).toLowerCase()
    const about = req.body.about
    const category = req.body.category
    const link = req.body.link
    const image = "/uploads/" + req.file.filename
    try {
        await productSchema.insertOne({ name: name, about: about, category: category, link: link, image: image })
        res.redirect("/admin/products/new")
    } catch (error) {
        res.send(`There is an error: ${error.message}`)
    }
})

app.get("/product/:link", async (req, res) => {
    const product = await productSchema.findOne({ link: req.params.link })
    res.render("product", { product: product })
})

app.get("/phones", async (req, res) => {
    const allPhones = await productSchema.find({ category: "phone" })
    res.render("phones", { allPhones })
})
app.get("/computers", async (req, res) => {
    const allComputers = await productSchema.find({ category: "computer" })
    res.render("computers", { allComputers })
})

app.get("/cart", auth, (req, res) => {

    res.render("cart", {
        orders: req.user.orders
    });

});

app.post("/cart", auth, async (req, res) => {
    if (req.user) {
        await userSchema.updateOne(
            { username: req.user.username },
            {
                $push: {
                    orders: req.body.productName
                }
            }
        );
        return res.status(200).redirect("/")
    }
    else if (!req.user) {
        return res.status(403)
    }
});

async function auth(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const user = await userSchema.findById(req.session.userId);

    if (!user) {
        return res.redirect("/login");
    }

    req.user = user;

    next();
}

app.listen(4000)
