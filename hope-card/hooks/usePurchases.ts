import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkout, getPurchaseHistory, CheckoutPayload } from '../services/purchases.service';

export function usePurchases() {
  const qc = useQueryClient();

  const history = useQuery({
    queryKey: ['purchases'],
    queryFn: getPurchaseHistory,
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['purchases'] });
    },
  });

  return { history, checkout: checkoutMutation };
}
