import { Theme } from '@react-navigation/native'

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2f95dc',
    background: '#fff',
    card: '#fff',
    text: '#000',
    border: '#ccc',
    notification: '#2f95dc'
  }
}

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#2f95dc',
    background: '#000',
    card: '#000',
    text: '#fff',
    border: '#ccc',
    notification: '#2f95dc'
  }
}
