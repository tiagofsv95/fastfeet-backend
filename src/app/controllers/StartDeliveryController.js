import { startOfDay, endOfDay, getHours } from 'date-fns';
import { Op } from 'sequelize';
import Order from '../models/Order';

class StartDeliveryController {
  async store(req, res) {
    const { id } = req.params;
    const { deliveryman } = req.body;

    const hour = getHours(new Date());

    if (hour < 8 || hour > 18) {
      return res.status(403).json({
        error:
          'It is only possible to make deliveries beetwen 08:00 until 18:00h',
      });
    }

    const startedOrders = Order.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
        deliveryman_id: deliveryman,
        canceled_at: null,
      },
    });

    if (startedOrders.length > 5) {
      return res.status(403).json({
        error: 'It is only possible to make five deliveries on the same day',
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    if (order.start_date) {
      return res
        .status(403)
        .json({ error: 'This order is already  in progress' });
    }

    if (order.end_date) {
      return res.status(403).json({ error: 'This order is already complete' });
    }

    order.start_date = new Date();

    order.save();

    return res.json(order);
  }
}

export default new StartDeliveryController();
