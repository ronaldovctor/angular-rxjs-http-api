const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const Product = require('./product.js')

let app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

mongoose.connect(
    'mongodb://localhost:27017/http_client',
    { useNewUrlParser: true }
)

const myLogger = (req, res, next) => {
    console.log(req.body)
    next()
}

app.get('/products', (req, res) => {
    Product.find({}).lean().exec(
        (err, prods) => {
            if(err)
                return res.status(500).send(err).json({
                    error: err,
                    message: 'Internal Error'
                })
            else{
                res.status(200).send(prods)
            }
        }
    )
})

app.get('/productserr', (req, res) => {
    setTimeout(() => {
        res.status(500).send({
            msg: 'Internal Server Error'
        }) 
    }, 1500 )
})

app.get('/productsdelay', (req, res) => {
    setTimeout(() => {
        Product.find().lean().exec(
            (err, prods) => {
                if(err)
                    res.status(500).send(err)
                else
                    res.status(200).send(prods)
            }
        )
    }, 2000)
})

app.get('/products_id', (req, res) => {
    Product.find().lean().exec(
        (err, prods) => {
            if(err)
                res.status(500).send(err)
            else
                res.status(200).send(prods.map(p => p._id))
        }
    )
})

app.get('/products/name/:id', (req, res) => {
    const id = req.params.id
    Product.findById(id, (err, prod) => {
        if(err)
            res.status(500).send(err)
        else if(!prod)
            res.status(404).send({})
        else
            res.status(200).send(prod.name)
    })
})

app.post('/products', (req, res) => {
    const p = new Product({
        name: req.body.name,
        department: req.body.department,
        price: req.body.price
    })
    p.save((err, prod) => {
        if(err)
            res.status(500).send(err)
        else
            res.status(200).send(prod)
    })
})

app.delete('/products/:id', (req, res) => {
    const id = req.params.id
    Product.deleteOne({id}, (err) => {
        if(err)
            res.status(500).send(err)
        else
            res.status(200).send({})
    })
})

app.patch('/products/:id', (req, res) => {
    Product.findById(req.params.id, (err, prod)=> {
        if(err)
            res.status(500).send(err)
        else if(!prod)
            res.status(404).send({})
        else {
            prod.name = req.body.name
            prod.department = req.body.department
            prod.price = req.body.price

            prod.save((err, prod) => {
                if(err)
                    res.status(500).send(err)
                else
                    res.status(200).send(prod)
            })
        }
    })
})

app.use((req, res, next) => {
    res.status(404).send('Route does not exist.')
})

app.listen(9000)