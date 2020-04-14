import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order } = data;

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: `Cancelamento do pedido nº ${order.id} de ${order.recipient.name}`,
      template: 'cancelation',
      context: {
        deliveryman: order.deliveryman.name,
        recipient: order.recipient.name,
        product: order.product,
        canceledBy: `Cancelado pelo administrador`,
      },
    });
  }
}

export default new CancellationMail();
