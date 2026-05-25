import { Alert } from 'react-native';

export const useAlert = () => {
  const showAlert = (title: string, message: string, onPress?: () => void) => {
    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: onPress,
      },
    ]);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    Alert.alert(title, message, [
      {
        text: 'Batal',
        onPress: onCancel,
        style: 'cancel',
      },
      {
        text: 'Lanjutkan',
        onPress: onConfirm,
        style: 'destructive',
      },
    ]);
  };

  return { showAlert, showConfirm };
};
