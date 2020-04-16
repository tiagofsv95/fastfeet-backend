import Order from '../models/Order';

class EndDeliveryController {
  async store(req, res) {
    const { id } = req.params;
    const { signature } = req.body;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    if (!order.start_date) {
      return res.status(403).json({ error: 'This order is not in progress' });
    }

    if (order.end_date) {
      return res.status(403).json({ error: 'This order is already complete' });
    }

    order.end_date = new Date();
    order.signature_id = signature;

    order.save();

    return res.json(order);
  }
}

export default new EndDeliveryController();
