// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const handlebars = require("handlebars");
// const nodemailer = require("nodemailer");
// const puppeteer = require("puppeteer");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// const gmailUser = process.env.gmail_username;
// const gmailPass = process.env.gmail_app_password;
// // Email setup (use your Gmail + app password)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: gmailUser,
//     pass: gmailPass,
//   },
// });

// app.post("/generate-invoice", async (req, res) => {
//   try {
//     const data = req.body;

//     // Load HTML template
//     const filePath = path.join(__dirname, "templates/invoice.hbs");
//     const htmlFile = fs.readFileSync(filePath, "utf8");

//     // Compile with Handlebars
//     const template = handlebars.compile(htmlFile);
//     const finalHtml = template(data);

//     // Convert HTML → PDF
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setContent(finalHtml, { waitUntil: "networkidle0" });

//     const pdf = await page.pdf({ format: "A4" });
//     await browser.close();

//     // Save PDF
//     const pdfPath = path.join(
//       __dirname,
//       "invoices",
//       `${data.name}-invoice.pdf`
//     );
//     fs.writeFileSync(pdfPath, pdf);

//     // Send email
//     await transporter.sendMail({
//       from: gmailUser,
//       to: data.email,
//       subject: "Course Fee Invoice – Aspiron Institute of Coaching",
//       text: `Dear Student,
// Your invoice for the JHI coaching programme is attached.

// Thank you for choosing Aspiron Institute.
// Regards,
// Aspiron – Administration`,
//       attachments: [{ filename: "invoice.pdf", path: pdfPath }],
//     });

//     res.json({ success: true, message: "Invoice generated & sent!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(5000, () => console.log("SERVER RUNNING → http://localhost:5000"));

const express = require("express");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const gmailUser = process.env.gmail_username;
const gmailPass = process.env.gmail_app_password;

// Email setup (use your Gmail + app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

app.post("/generate-invoice", async (req, res) => {
  try {
    const data = req.body;

    // Load HTML template
    const filePath = path.join(__dirname, "templates/invoice.hbs");
    const htmlFile = fs.readFileSync(filePath, "utf8");

    // Compile with Handlebars
    const template = handlebars.compile(htmlFile);
    const finalHtml = template(data);

    // -------------------------------
    // FIX FOR RENDER → Puppeteer config
    // -------------------------------
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    // Save PDF
    const pdfPath = path.join(
      __dirname,
      "invoices",
      `${data.name}-invoice.pdf`
    );
    fs.writeFileSync(pdfPath, pdf);

    // Send email
    await transporter.sendMail({
      from: gmailUser,
      to: data.email,
      subject: "Course Fee Invoice – Aspiron Institute of Coaching",
      text: `Dear Student,
Your invoice for the JHI coaching programme is attached.

Thank you for choosing Aspiron Institute.
Regards,
Aspiron – Administration`,
      attachments: [{ filename: "invoice.pdf", path: pdfPath }],
    });

    res.json({ success: true, message: "Invoice generated & sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Render will give you a PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT → ${PORT}`));
