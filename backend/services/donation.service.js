import DonationConfig from "../models/DonationConfig.js";
import Payments from "../models/Payments.js";

/**
 * Updates the donation fund collected amount atomically and idempotently.
 * @param {Object} payment - The payment object containing amount, category, status, etc.
 */
export const updateDonationCollected = async (payment) => {
  try {
    // 1. Basic validation
    if (!payment || typeof payment !== "object") return;
    
    // 2. Reject if amount <= 0
    if (typeof payment.amount !== "number" || payment.amount <= 0) {
      console.warn(`[DonationUpdate] Rejected: Invalid amount for payment ${payment.tran_id}`);
      return;
    }

    // 3. Reject if not success
    if (payment.status !== "success") {
      return;
    }

    // 4. Reject if missing or unknown category
    const validCategories = ["general", "zakat"];
    if (!payment.category || !validCategories.includes(payment.category)) {
      console.warn(`[DonationUpdate] Ignored: Unknown category '${payment.category}' for payment ${payment.tran_id}`);
      return;
    }

    // 5. Idempotent lock check
    // We only update if `isDonationUpdated` is falsy. We atomically set it to true so concurrent requests or retries won't process it twice.
    const updatedPayment = await Payments.findOneAndUpdate(
      { _id: payment._id, isDonationUpdated: { $ne: true } },
      { $set: { isDonationUpdated: true } },
      { new: true }
    );

    // If no payment returned, it was already processed or doesn't exist
    if (!updatedPayment) {
      console.log(`[DonationUpdate] Skipped: Payment ${payment.tran_id} already processed or not found.`);
      return;
    }

    // 6. Atomic MongoDB update
    const result = await DonationConfig.updateOne(
      { "funds.id": payment.category },
      {
        $inc: {
          "funds.$.collected": payment.amount
        }
      }
    );

    // 7. Verify the update
    if (result.matchedCount === 0) {
      console.warn(`[DonationUpdate] Failed: Donation document or fund category '${payment.category}' missing.`);
      // Optional: rollback the lock if it failed due to missing document (so it can be retried if document is created)
      await Payments.updateOne({ _id: payment._id }, { $set: { isDonationUpdated: false } });
      return;
    }

    console.log(`[DonationUpdate] Success: Donation fund updated. category=${payment.category} amount=${payment.amount} tran_id=${payment.tran_id}`);

  } catch (error) {
    console.error(`[DonationUpdate] Error processing payment ${payment?.tran_id}:`, error);
    // Suppress error to avoid server crash and keep payment successful
  }
};
