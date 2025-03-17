const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // หรือใช้ bcryptjs หากมีปัญหา

const app = express();
app.use(cors());
app.use(express.json());

const port = 8080;

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//==================================================================================================
// ✅ Connect to Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kenzoexpress'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database');
});

// ✅ Create Table (ใช้ IF NOT EXISTS เพื่อป้องกัน error ซ้ำซ้อน)
const createTable = `
    CREATE TABLE IF NOT EXISTS Employee (
        EmID INT PRIMARY KEY AUTO_INCREMENT,
        Name VARCHAR(50) NOT NULL,
        Surname VARCHAR(50) NOT NULL,
        Password VARCHAR(255) NOT NULL, -- ใช้การเข้ารหัสรหัสผ่าน
        Email VARCHAR(100) UNIQUE NOT NULL,
        Sex ENUM('Male', 'Female', 'Other') NOT NULL,
        Role ENUM('Parcel Clerk', 'Messenger') NOT NULL,
        Bday DATE NOT NULL
    )`;

db.query(createTable, (err, result) => {
    if (err) {
        console.error('Error creating Employee table:', err);
        return;
    }
    console.log('Employee table is ready');
});

//==================================================================================================
// ✅ API: Register Employee
app.post('/register', async (req, res) => {
    try {
        const { Name, Surname, Password, Email, Sex, Role, Bday } = req.body;

        // ตรวจสอบค่าที่ส่งมาครบหรือไม่
        if (!Name || !Surname || !Password || !Email || !Sex || !Role || !Bday) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ตรวจสอบ Email ซ้ำ
        db.query(`SELECT * FROM Employee WHERE Email = ?`, [Email], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (result.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Hash รหัสผ่านก่อนบันทึก
            const hashedPassword = await bcrypt.hash(Password, 10);

            const sql = `
                INSERT INTO Employee (Name, Surname, Password, Email, Sex, Role, Bday)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [Name, Surname, hashedPassword, Email, Sex, Role, Bday], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Registration failed", error: err });
                }
                res.status(200).json({ message: "Registration successful" });
            });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
