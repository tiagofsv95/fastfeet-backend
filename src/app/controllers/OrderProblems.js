import DeliveryProblems from '../models/DeliveryProblems';
import Order from '../models/Order';

class OrderProblems {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const deliveryProblem = await DeliveryProblems.findAll({
      where: { delivery_id: id },
      order: ['created_at'],
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product'],
        },
      ],
    });

    return res.json(deliveryProblem);
  }
}

export default new OrderProblems();
