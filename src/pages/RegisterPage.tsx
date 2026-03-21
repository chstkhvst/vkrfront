import React, { useState } from "react"
import { Box } from "@mui/material"
import RegisterModal from "../components/RegisterModal"

const RegisterPage: React.FC = () => {
  const [open, setOpen] = useState(true)

  return (
    <Box>
      <RegisterModal open={open} onClose={() => setOpen(false)} />
    </Box>
  )
}

export default RegisterPage
