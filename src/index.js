const { res, response } = require('express')
const express = require('express')
const { v4: idv4 } = require('uuid')
const app = express()


/**
 * cpf - string
 * name - string
 * id - string
 * statement []
*/

function verifyIfCpfExists(req, res, next) {
    const { cpf } = req.headers;
    const customer = customers.find(customer => customer.cpf === cpf)

    if (!customer) {
        return res.status(400).json({ error: "Customer not found" })
    }
    req.customer = customer
    return next();
}


function getBalance(statement) {
    const balance = statement.reduce(
        (acc, operation) => {
            if (operation.type === 'credit') {
                return acc + operation.amount;
            } else if (operation.type === 'debit') {
                return acc - operation.amount;
            }
        }, 0)

    return balance
}
app.use(express.json())
const customers = []

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)

    if (customerAlreadyExists) {
        return res.status(400).json({ error: "Customer already exists" })
    }
    customers.push({
        cpf,
        name,
        id: idv4(),
        statement: []
    })

    res.status(201).send()

})

//app.use(verifyIfCpfExists)

app.get('/statement/', verifyIfCpfExists, (req, res) => {
    const { customer } = req;
    return res.json(customer.statement)
})

app.post("/deposit", verifyIfCpfExists, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }
    customer.statement.push(statementOperation)

    return res.status(201).send()
})

app.post("/withdraw", verifyIfCpfExists, (req, res) => {
    const { amount } = req.body;
    const { customer } = req

    const balance = getBalance(customer.statement)

    if (balance < amount) {
        res.status(400).json({
            error: "Insufficient funds."
        })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }
    customer.statement.push(statementOperation)

    return res.status(201).send()
})

app.get('/statement/date', verifyIfCpfExists, (req, res) => {
    const { customer } = req;
    const { date } = req.query

    const dateFormat = new Date(date)

    const statement = customer.statement.filter(
        (statement) =>
            statement.created_at.toString() ===
            new Date(dateFormat).toString()
    )
    console.log(statement)
    return res.json(statement)
})

app.put("/account", verifyIfCpfExists, (req, res) => {
    const { customer } = req;
    const { name } = req.body;

    customer.name = name

    return res.status(201).send()
})

app.get("/account", verifyIfCpfExists, (req, res) => {

    const { customer } = req;


    return res.json(customer)
})

app.delete("/account", verifyIfCpfExists, (req, res) => {
    const { customer } = req;

    customers.splice(customer, 1);

    return res.status(200).json(customer)
})

app.get("/balance", verifyIfCpfExists, (req, res) => {
    const { customer } = req;

    const balance = getBalance(customer.balance)

    return res.json(balance)

})
app.listen(3333)