import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Початковий стан користувача (за замовчуванням null — не авторизований)
  // Для тестування профілю ми можемо відразу закинути сюди демо-користувача
  const [user, setUser] = useState({
    firstName: 'Олександр',
    lastName: 'Татученко',
    phone: '+380671234567',
    email: 'tattoo.master@gmail.com',
    studioName: 'Cyber Ink Studio',
    experience: '3',
    city: 'Київ',
    isPhoneVerified: true,
    isEmailVerified: true
  });

  // Функція для реєстрації / входу
  const registerUser = (userData) => {
    setUser({
      ...userData,
      isPhoneVerified: true, // Імітуємо, що код з SMS підтверджено
      isEmailVerified: true  // Імітуємо підтвердження пошти
    });
  };

  // Функція для оновлення профілю
  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  // Вихід з акаунту
  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, registerUser, updateUser, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);