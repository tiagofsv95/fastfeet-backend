import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, order } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Novo pedido para ${recipient.name}`,
      template: 'newOrder',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        product: order.product,
        address: `${recipient.address}, ${recipient.address_number} ${recipient.address_complement}, ${recipient.address_city} - ${recipient.address_state} `,
      },
    });
  }
}

export default new NewOrderMail();
