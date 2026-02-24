// AI assisted development
package com.medexjob.service;

import com.medexjob.entity.Invoice;
import com.medexjob.entity.Payment;
import com.medexjob.entity.Subscription;
import com.medexjob.repository.InvoiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class InvoiceService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final FileUploadService fileUploadService;

    public InvoiceService(InvoiceRepository invoiceRepository, FileUploadService fileUploadService) {
        this.invoiceRepository = invoiceRepository;
        this.fileUploadService = fileUploadService;
    }

    public Invoice createInvoiceForPayment(Payment payment) {
        try {
            Optional<Invoice> existing = invoiceRepository.findByPaymentId(payment.getId());
            if (existing.isPresent()) {
                return existing.get();
            }

            Subscription subscription = payment.getSubscription();
            String invoiceNumber = generateInvoiceNumber(payment);
            String currency = "INR";
            BigDecimal amount = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;

            String html = buildInvoiceHtml(invoiceNumber, payment, subscription, amount, currency);
            byte[] bytes = html.getBytes(StandardCharsets.UTF_8);

            String fileName = invoiceNumber + ".html";
            String url = fileUploadService.uploadBytes(bytes, fileName, "invoices");

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setUserId(payment.getUserId());
            invoice.setPayment(payment);
            invoice.setSubscription(subscription);
            invoice.setAmount(amount);
            invoice.setCurrency(currency);
            invoice.setIssuedAt(LocalDateTime.now());
            invoice.setStatus(Invoice.InvoiceStatus.GENERATED);
            invoice.setFileUrl(url);

            invoice = invoiceRepository.save(invoice);
            logger.info("Invoice generated for payment {} as {}", payment.getId(), invoiceNumber);
            return invoice;
        } catch (Exception e) {
            logger.error("Error generating invoice for payment {}", payment.getId(), e);
            throw new RuntimeException("Failed to generate invoice", e);
        }
    }

    private String generateInvoiceNumber(Payment payment) {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String idPart = payment.getId() != null ? payment.getId().toString().substring(0, 8).toUpperCase() : "UNKNOWN";
        return "INV-" + datePart + "-" + idPart;
    }

    private String buildInvoiceHtml(String invoiceNumber,
                                    Payment payment,
                                    Subscription subscription,
                                    BigDecimal amount,
                                    String currency) {
        String planName = subscription != null && subscription.getPlan() != null
                ? subscription.getPlan().getName()
                : "Subscription";

        String period = subscription != null
                ? subscription.getStartDate() + " to " + subscription.getEndDate()
                : "N/A";

        String issuedDate = LocalDate.now().toString();

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <title>Invoice %s</title>
                  <style>
                    body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
                    .invoice { max-width: 720px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; }
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                    .title { font-size: 20px; font-weight: 700; }
                    .meta { font-size: 12px; color: #6B7280; }
                    .section-title { margin-top: 24px; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
                    table { width: 100%%; border-collapse: collapse; margin-top: 8px; }
                    th, td { padding: 8px; text-align: left; font-size: 13px; }
                    th { background-color: #F3F4F6; }
                    tfoot td { font-weight: 600; border-top: 1px solid #E5E7EB; }
                  </style>
                </head>
                <body>
                  <div class="invoice">
                    <div class="header">
                      <div>
                        <div class="title">MedExJob.com Invoice</div>
                        <div class="meta">Invoice No: %s</div>
                        <div class="meta">Date: %s</div>
                      </div>
                    </div>

                    <div class="section-title">Billing Details</div>
                    <table>
                      <tbody>
                        <tr>
                          <td>Payment ID</td>
                          <td>%s</td>
                        </tr>
                        <tr>
                          <td>Transaction ID</td>
                          <td>%s</td>
                        </tr>
                        <tr>
                          <td>Plan</td>
                          <td>%s</td>
                        </tr>
                        <tr>
                          <td>Subscription Period</td>
                          <td>%s</td>
                        </tr>
                      </tbody>
                    </table>

                    <div class="section-title">Charges</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Amount (%s)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>%s</td>
                          <td>%.2f</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>Total</td>
                          <td>%.2f</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </body>
                </html>
                """.formatted(
                invoiceNumber,
                invoiceNumber,
                issuedDate,
                payment.getId() != null ? payment.getId().toString() : "",
                payment.getTransactionId() != null ? payment.getTransactionId() : "",
                planName,
                period,
                currency,
                planName,
                amount,
                amount
        );
    }
}

