/**
 * OrderList - Component hiển thị danh sách đơn hàng với empty state
 */

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Card } from '../ui/card';
import { Order } from '../../types';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => void;
  showActionButtons?: boolean; // Optional prop to show/hide action buttons
}

export function OrderList({ orders, onUpdateStatus, showActionButtons = true }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">Chưa có đơn hàng</h3>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-4"
    >
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onUpdateStatus={onUpdateStatus}
          showActionButtons={showActionButtons}
        />
      ))}
    </motion.div>
  );
}

