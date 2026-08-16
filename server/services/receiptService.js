import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Receipt from "../models/Receipt.js";

export async function createReceipt({
    type,
    memberId,
    donationId,
    amount,
    paymentMethod,
    transactionId,
    email,
    festivalYear,
    recipientName
}) {
    const receiptNumber =
        `GC-${festivalYear || new Date().getFullYear()}-` +
        `${Date.now()}`;

    const receiptsDir = path.resolve("uploads", "receipts");

    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, {
            recursive: true
        });
    }

    const fileName = `${receiptNumber}.pdf`;
    const file = path.join(receiptsDir, fileName);

    await new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            margin: 50
        });

        const stream = fs.createWriteStream(file);

        stream.on("finish", resolve);
        stream.on("error", reject);

        doc.pipe(stream);

        doc.fontSize(22)
            .text(
                "GANESH COMMUNITY MANAGEMENT",
                {
                    align: "center"
                }
            );

        doc.moveDown();

        doc.fontSize(18)
            .text(
                "OFFICIAL PAYMENT RECEIPT",
                {
                    align: "center"
                }
            );

        doc.moveDown(2);

        doc.fontSize(12);

        doc.text(`Receipt Number: ${receiptNumber}`);

        doc.text(
            `Festival Year: ${festivalYear || new Date().getFullYear()}`
        );

        doc.text(
            `Date (IST): ${new Date().toLocaleString(
                "en-IN",
                {
                    timeZone: "Asia/Kolkata"
                }
            )}`
        );

        doc.moveDown();

        if (recipientName) {
            doc.text(`Donor Name: ${recipientName}`);
        }

        if (email) {
            doc.text(`Email: ${email}`);
        }

        if (memberId) {
            doc.text(`Member ID: ${memberId}`);
        }

        doc.moveDown();

        doc.fontSize(14)
            .text(
                `Amount: ₹${Number(amount).toLocaleString(
                    "en-IN"
                )}`
            );

        doc.fontSize(12);

        doc.text(
            `Payment Method: ${paymentMethod || "UPI"}`
        );

        doc.text(
            `Transaction/Reference: ${transactionId || "N/A"
            }`
        );

        doc.moveDown(2);

        doc.text(
            "Thank you for supporting the Ganesh community.",
            {
                align: "center"
            }
        );

        doc.moveDown();

        doc.text(
            "This receipt was generated after payment verification.",
            {
                align: "center"
            }
        );

        doc.end();
    });

    return Receipt.create({
        receiptNumber,
        type,
        memberId: memberId || null,
        donationId: donationId || null,
        amount,
        paymentMethod,
        transactionId,
        pdfPath: file,
        email,
        emailSent: false,
        festivalYear
    });
}