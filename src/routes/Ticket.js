const router = require("express").Router();
const ticketController = require("../controllers/TicketController");

router.post("/booking", ticketController.bookingTicket);
// get all ticket  query page, size, name = (name customer)
router.get("/all/getTicket", ticketController.getTicket);
router.get("/:userId", ticketController.getAllTicketByUserId);
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
//
router.get("/statistic/ticket", ticketController.statisticTicketByAllCustomer);
module.exports = router;
