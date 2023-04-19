const router = require("express").Router();
const ticketController = require("../controllers/TicketController");

router.post("/booking", ticketController.bookingTicket);
// get all ticket  query page, size, name = (name customer)
router.get("/all/getTicket", ticketController.getTicket);
router.get("/:userId", ticketController.getAllTicketByUserId);
// get ticket by code
router.get("/", ticketController.getTicketByCode);
// cancle ticket
router.delete("/delete", ticketController.CanceledTicket);
// create ticket refund Ticket by seat
router.post("/refundTicket", ticketController.refundChairOfTicket);
//get list ticket refund by user id
router.get("/refund/:userId", ticketController.getAllTicketRefundByUserId);
// get all ticket refund   query page, size, name = (name customer)
router.get("/all/ticketRefund", ticketController.getAllTicketRefund);
// create order ticket
router.post("/createOrder", ticketController.createOrderTicket);
// update order when payment
router.patch("/updateOrder", ticketController.updateStatusOrderTicket);
//statistic ticket with customer
router.get("/statistic/ticket", ticketController.statisticTicketByAllCustomer);
//statistic ticket with employee
router.get(
  "/statistic/ticket-empl",
  ticketController.statisticTicketByAllEmployee
);
// statistic revenue month (dashboard)
router.get("/statistic/revenue", ticketController.revenueStatisticsMonth);
// statistic ticet refunds
router.get("/statistic/ticket-refund", ticketController.statisticTicketRefunds);
// statictis current date (dashboard)
router.get("/statistic/current", ticketController.statictisCurrentDate);

module.exports = router;
