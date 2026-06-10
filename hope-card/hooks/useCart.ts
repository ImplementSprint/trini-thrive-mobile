import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../services/cart.service';

export function useCart() {
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });

  const addItem = useMutation({
    mutationFn: ({
      campaign_id,
      face_value,
      quantity,
    }: {
      campaign_id: string;
      face_value: number;
      quantity?: number;
    }) => addToCart(campaign_id, face_value, quantity),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });

  return { cartQuery, addItem, updateItem, removeItem };
}
