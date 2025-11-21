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

//     // -------------------------------
//     // FIX FOR RENDER → Puppeteer config
//     // -------------------------------
//     const browser = await puppeteer.launch({
//       executablePath: puppeteer.executablePath(),
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu",
//       ],
//       headless: "new",
//     });

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

// // Render will give you a PORT
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT → ${PORT}`));

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

// Validate environment variables
if (!gmailUser || !gmailPass) {
  console.error(
    "Missing required environment variables: gmail_username and gmail_app_password"
  );
  process.exit(1);
}

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

// Ensure directories exist
const templatesDir = path.join(__dirname, "templates");
const invoicesDir = path.join(__dirname, "invoices");

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Register Handlebars helpers (optional)
handlebars.registerHelper("formatDate", (date) => {
  return new Date(date).toLocaleDateString();
});

handlebars.registerHelper("formatCurrency", (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
});

// Puppeteer launch function with production optimization
async function launchBrowser() {
  const isProduction = process.env.NODE_ENV === "production";

  const launchOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
      "--disable-accelerated-2d-canvas",
      "--disable-web-security",
      "--remote-debugging-port=0",
    ],
  };

  if (isProduction) {
    console.log("🚀 Production mode: Using Chromium from puppeteer");
    // Let puppeteer handle executable path automatically
  } else {
    console.log("💻 Development mode");
    launchOptions.executablePath = puppeteer.executablePath();
  }

  try {
    const browser = await puppeteer.launch(launchOptions);
    console.log("✅ Browser launched successfully");
    return browser;
  } catch (error) {
    console.error("❌ Failed to launch browser:", error);
    throw error;
  }
}

// Generate PDF from HTML
async function generatePDF(htmlContent) {
  let browser = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Set a realistic viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Set content and wait for everything to load
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log("✅ PDF generated successfully");
    return pdf;
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}

// Load and compile template
function compileTemplate(templateData) {
  try {
    const filePath = path.join(__dirname, "templates", "invoice.hbs");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found at: ${filePath}`);
    }

    const htmlFile = fs.readFileSync(filePath, "utf8");
    const template = handlebars.compile(htmlFile);
    const finalHtml = template(templateData);

    console.log("✅ Template compiled successfully");
    return finalHtml;
  } catch (error) {
    console.error("❌ Template compilation failed:", error);
    throw error;
  }
}

// Validate request data
function validateInvoiceData(data) {
  const required = ["name", "email", "amount", "courseName"];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (!/\S+@\S+\.\S+/.test(data.email)) {
    throw new Error("Invalid email format");
  }

  if (isNaN(parseFloat(data.amount))) {
    throw new Error("Amount must be a valid number");
  }
}

// Main invoice generation endpoint
app.post("/generate-invoice", async (req, res) => {
  let pdfPath = null;

  try {
    const data = req.body;

    console.log("📨 Received invoice generation request for:", data.email);

    // Validate input data
    validateInvoiceData(data);

    // Compile HTML template
    const htmlContent = compileTemplate(data);

    // Generate PDF
    const pdf = await generatePDF(htmlContent);

    // Save PDF temporarily
    const fileName = `invoice-${data.name.replace(
      /\s+/g,
      "-"
    )}-${Date.now()}.pdf`;
    pdfPath = path.join(invoicesDir, fileName);
    fs.writeFileSync(pdfPath, pdf);

    console.log("📄 PDF saved temporarily:", fileName);

    // Send email with attachment
    await transporter.sendMail({
      from: `"Aspiron Institute" <${gmailUser}>`,
      to: data.email,
      subject: "Course Fee Invoice – Aspiron Institute of Coaching",
      text: `Dear ${data.name},

Your invoice for the ${data.course} coaching programme is attached.

Invoice Details:
- Student: ${data.name}
- Course: ${data.course}
- Amount: ₹${data.paidAmount}
- Date: ${new Date().toLocaleDateString()}

Thank you for choosing Aspiron Institute.

Regards,
Aspiron – Administration`,
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("✅ Email sent successfully to:", data.email);

    // Clean up PDF file after successful email
    setTimeout(() => {
      try {
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          console.log("🧹 Temporary PDF cleaned up");
        }
      } catch (cleanupError) {
        console.log("Cleanup warning:", cleanupError.message);
      }
    }, 3000);

    res.json({
      success: true,
      message: "Invoice generated and sent successfully!",
      data: {
        recipient: data.email,
        name: data.name,
        amount: data.amount,
      },
    });
  } catch (error) {
    console.error("❌ Error in /generate-invoice:", error);

    // Clean up on error
    if (pdfPath && fs.existsSync(pdfPath)) {
      try {
        fs.unlinkSync(pdfPath);
      } catch (cleanupError) {
        console.log("Error cleanup failed:", cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: "Failed to generate or send invoice",
    });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test browser launch for health check
    const browser = await launchBrowser();
    await browser.close();

    res.json({
      status: "OK",
      message: "Server is running and browser is functional",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Browser health check failed",
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Invoice Generation API",
    version: "1.0.0",
    endpoints: {
      "POST /generate-invoice": "Generate and send invoice PDF",
      "GET /health": "Health check",
    },
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING ON PORT → ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📧 Email service: ${gmailUser ? "Configured" : "Not configured"}`
  );
});
