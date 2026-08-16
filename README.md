# Ganesh Community Management — Full MVP

A complete working MVP covering Public, Member and Admin workflows.

## Included
- Public homepage, events, gallery, committee, finance summary, registration, donations
- Member registration with Pending/Approved/Rejected workflow
- President and Vice President admin roles
- JWT authentication
- Member dashboard and contribution tracking
- UPI payment demo flow and cash-payment approval flow
- Donations and receipt records
- PDF receipt generation
- Email-ready receipt service
- Expenses and financial summary
- Events, gallery, committee and community settings management
- Audit logs

## Important
The payment implementation includes a DEMO online-payment confirmation endpoint so the whole app works locally. Replace it with a real Indian payment gateway and verify its webhook before production use. Do not treat the demo payment endpoint as secure for real money.

## Run
### Server
cd server
npm install
copy .env.example .env
npm run seed
npm run dev

### Client
cd client
npm install
copy .env.example .env
npm run dev

Demo admin:
president@ganesh.local / ChangeMe123!
vicepresident@ganesh.local / ChangeMe123!

Change these credentials immediately in a real deployment.
