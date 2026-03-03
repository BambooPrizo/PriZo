// ============================================
// HOOK - Détection statut réseau
// ============================================

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState as NetInfoStateType } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: string | null;
}

interface UseNetworkStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  networkStatus: NetworkStatus;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    details: null,
  });

  useEffect(() => {
    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener((state: NetInfoStateType) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details ? JSON.stringify(state.details) : null,
      });
    });

    // Vérifier l'état initial
    NetInfo.fetch().then((state: NetInfoStateType) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details ? JSON.stringify(state.details) : null,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }, []);

  return {
    isOnline: networkStatus.isConnected && networkStatus.isInternetReachable !== false,
    isOffline: !networkStatus.isConnected,
    networkStatus,
    checkConnection,
  };
};

export default useNetworkStatus;
