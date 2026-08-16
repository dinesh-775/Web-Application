import express from "express";

import {
    create,
    submitPayment,
    list,
    getById,
    approve,
    reject
} from "../controllers/donationController.js";

import { auth, roles } from "../middleware/auth.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| DONOR
|--------------------------------------------------------------------------
*/

/*
 * Create donation request.
 *
 * PENDING
 *
 * Public endpoint.
 * Anyone can create a donation request.
 */
router.post("/", create);

/*
 * Donor confirms that they completed the UPI payment.
 *
 * PENDING → PAYMENT_SUBMITTED
 *
 * Public endpoint.
 * The donor only submits that they completed payment.
 *
 * IMPORTANT:
 * This does NOT make the donation SUCCESS.
 * Admin must verify the payment.
 */
router.post(
    "/:id/submit-payment",
    submitPayment
);


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

/*
 * Admin donation list.
 *
 * Only PRESIDENT and VICE_PRESIDENT can access.
 */
router.get(
    "/",
    auth,
    roles("PRESIDENT", "VICE_PRESIDENT"),
    list
);

/*
 * Admin view individual donation.
 */
router.get(
    "/:id",
    auth,
    roles("PRESIDENT", "VICE_PRESIDENT"),
    getById
);

/*
 * Admin approves donation.
 *
 * PAYMENT_SUBMITTED → SUCCESS
 *
 * Admin supplies the actual UPI transaction ID.
 *
 * Receipt is generated only after approval.
 */
router.post(
    "/:id/approve",
    auth,
    roles("PRESIDENT", "VICE_PRESIDENT"),
    approve
);

/*
 * Admin rejects donation.
 *
 * PAYMENT_SUBMITTED → REJECTED
 */
router.post(
    "/:id/reject",
    auth,
    roles("PRESIDENT", "VICE_PRESIDENT"),
    reject
);


/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
|
| There is intentionally NO:
|
| /:id/demo-success
|
| route.
|
| Donation flow is:
|
| POST /donations
|       ↓
| PENDING
|       ↓
| POST /donations/:id/submit-payment
|       ↓
| PAYMENT_SUBMITTED
|       ↓
| Admin verifies bank/UPI payment
|       ↓
| POST /donations/:id/approve
|       ↓
| SUCCESS
|       ↓
| Receipt generated
|
|--------------------------------------------------------------------------
*/

export default router;