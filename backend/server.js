const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')

app = express()
app.use(cors())
app.use(express.json())


const port = 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    }
)
//==================================================================================================

// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kenzoexpress'
})

// Create table
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
const createTable = `
    CREATE TABLE Employee (
        EmID INT PRIMARY KEY AUTO_INCREMENT,
        Name VARCHAR(50) NOT NULL,
        Surname VARCHAR(50) NOT NULL,
        Password VARCHAR(255) NOT NULL, -- ใช้การเข้ารหัสรหัสผ่าน
        Email VARCHAR(100) UNIQUE NOT NULL,
        Sex ENUM('Male', 'Female', 'Other') NOT NULL,
        Role ENUM('Parcel Clerk', 'Messenger') NOT NULL,
        Bday DATE NOT NULL
    )`
db.query(createTable, (err, result) => {
    if (err) {
        throw err
    }
    console.log('Employee table created')
})
//==================================================================================================