const express = require("express")
const mongoose = require("mongoose")
const productSchema = require("./models/productModel")
const app = express()
app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

mongoose.connect("mongodb://localhost/ZLShop")


app.get("/", async (req, res) => {
    const allProducts = await productSchema.find()
    res.render("index", { allProducts })
})
app.get("/admin/products/new", (req, res) => {
    res.render("new-product")
})
app.post("/products", async (req, res) => {
    const { name, about, category } = req.body
    try {
        await productSchema.insertOne({ name: name, about: about, category: category })
        res.redirect("/admin/products/new")
    } catch (error) {
        res.send(`There is an error: ${error.message}`)
    }
})

app.get("/phones", async (req, res) => {
    const allPhones = await productSchema.find({ category: "phone" })
    res.render("phones", { allPhones })
})
app.get("/computers", async (req, res) => {
    const allComputers = await productSchema.find({ category: "computer" })
    res.render("computers", { allComputers })
})

app.listen(4000)