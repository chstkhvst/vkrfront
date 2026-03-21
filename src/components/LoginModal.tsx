import React, { useState } from "react"
import { Modal, Box, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material"
// Импорт компонентов из Material UI для создания пользовательского интерфейса.
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LoginModel } from "../client/apiClient";

const modalStyle = {
  // Стиль для модального окна (Material UI). Используется для расположения по центру окна и стилизации.
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
}

interface LoginModalProps {
  open: boolean
  // Пропс `open` отвечает за отображение модального окна.
  onClose: () => void
  // Пропс `onClose` — функция, вызываемая при закрытии модального окна.
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const { login } = useAuth()
  // Получаем функцию login из контекста авторизации.

  const navigate = useNavigate()

  const [userName, setUserName] = useState("")
  // Локальное состояние для хранения имени пользователя.
  const [password, setPassword] = useState("")
  // Локальное состояние для хранения пароля.
  const [error, setError] = useState("")
  // Локальное состояние для хранения сообщений об ошибке.
  const [isLoading, setIsLoading] = useState(false)
  // Локальное состояние для управления индикатором загрузки.

  const handleSubmit = async (e: React.FormEvent) => {
    // Функция обработки отправки формы.
    e.preventDefault() // Предотвращаем стандартное поведение формы.

    setError("") // Сбрасываем сообщения об ошибках.
    setIsLoading(true) // Включаем индикатор загрузки.

    try {
      await login(
            new LoginModel({
                userName,
                password,
            })
            )
      // Пытаемся выполнить вход с указанными данными.

      onClose() // Закрываем модальное окно после успешного входа.
      navigate("/") // Перенаправляем пользователя на главную страницу.
    } catch (err) {
      setError("Вход не выполнен") // Устанавливаем сообщение об ошибке при неудачном входе.
    } finally {
      setIsLoading(false) // Выключаем индикатор загрузки.
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      {/* Компонент Modal отображает модальное окно, если open === true. */}
      <Box sx={modalStyle}>
        {/* Основной контейнер модального окна со стилями. */}
        <Typography variant="h6" component="h2" mb={3}>
          Вход в систему
          {/* Заголовок модального окна. */}
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Форма для ввода данных. Обрабатывается функцией handleSubmit. */}
          <Stack spacing={2}>
            {/* Стек элементов с равными отступами между ними. */}
            <TextField
              label="Имя пользователя"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              // При изменении текста обновляем состояние userName.
              required
              fullWidth
              // Обязательное поле ввода, занимает всю ширину.
            />

            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // При изменении текста обновляем состояние password.
              required
              fullWidth
            />

            {error && <Typography color="error">{error}</Typography>}
            {/* Если есть сообщение об ошибке, отображаем его в красном цвете. */}

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || userName.length === 0 || !password.length}
              // Кнопка недоступна, если идет загрузка.
              endIcon={isLoading ? <CircularProgress size={20} /> : null}
              // Показываем индикатор загрузки внутри кнопки, если isLoading === true.
              fullWidth
            >
              {isLoading ? "Вход..." : "Войти"}
              {/* Текст кнопки зависит от состояния загрузки. */}
            </Button>
            <Button onClick={() => navigate("/register")}>
                Нет аккаунта? Зарегистрироваться
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  )
}

export default LoginModal
