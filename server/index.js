const express = require("express");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Email setup (use your Gmail + app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "adhnanadhnan001@gmail.com",
    pass: "oxrb lljy doxb frto",
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

    // Convert HTML → PDF
    const browser = await puppeteer.launch();
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
      from: "adhnanadhnan001@gmail.com",
      to: data.email,
      subject: "Invoice from Your Company",
      text: "Please find your invoice attached.",
      attachments: [{ filename: "invoice.pdf", path: pdfPath }],
    });

    res.json({ success: true, message: "Invoice generated & sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("SERVER RUNNING → http://localhost:5000"));
