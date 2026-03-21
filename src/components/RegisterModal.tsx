import React, { useState } from "react"
import { Modal, Box, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { RegisterModel } from "../client/apiClient";

const modalStyle = {
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

interface RegisterModalProps {
  open: boolean
  onClose: () => void
}

const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose  }) => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setIsLoading(true)

    try {
      await register(
        new RegisterModel({
          userName,
          password,
          email
        })
      )

      onClose()
      navigate("/")
    } catch (err) {
      setError("Регистрация не выполнена")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" mb={3}>
          Регистрация
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Имя пользователя"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Повторите пароль"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            {error && <Typography color="error">{error}</Typography>}

            <Button
              type="submit"
              variant="contained"
              disabled={
                isLoading || 
                userName.length === 0 || 
                !email.length || 
                !password.length || 
                !confirmPassword.length
              }
              endIcon={isLoading ? <CircularProgress size={20} /> : null}
              fullWidth
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
            
            <Button onClick={() => {
              onClose()
              navigate("/login")
            }}>
              Уже есть аккаунт? Войти
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  )
}

export default RegisterModal