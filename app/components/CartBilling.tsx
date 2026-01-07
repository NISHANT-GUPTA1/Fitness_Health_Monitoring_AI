import React from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
}

interface CartBillingProps {
  cart: CartItem[];
  total: number;
}

const CartBilling: React.FC<CartBillingProps> = ({ cart, total }) => {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Billing</h2>
      <ul className="mb-4">
        {cart.map(item => (
          <li key={item.id} className="mb-2">
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
      <p className="font-semibold mb-6">Total: ${total}</p>
      <form className="space-y-4">
        <input type="text" placeholder="Name" className="border p-2 w-full" required />
        <input type="email" placeholder="Email" className="border p-2 w-full" required />
        <input type="text" placeholder="Address" className="border p-2 w-full" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Pay Now</button>
      </form>
    </div>
  );
};

export default CartBilling;
